// Image Converter Web Worker
// Handles heavy image processing tasks off the main thread

// Note: We do not load external decoders in the worker to avoid dynamic import failures.
// We attempt native ImageDecoder; if unavailable, we request a main-thread fallback.

// Convert HEIC to canvas via native ImageDecoder; otherwise signal fallback
async function convertHeicToCanvas(fileData, metadata) {
  try {
    // @ts-ignore - ImageDecoder may not exist in all environments
    if (typeof ImageDecoder === 'undefined') {
      const err = new Error('ImageDecoder not available for HEIC');
      // @ts-ignore annotate for catch
      err.code = 'HEIC_FALLBACK';
      throw err;
    }

    // @ts-ignore - TS not aware here
    const decoder = new ImageDecoder({ data: fileData, type: 'image/heic' });
    const { image } = await decoder.decode();
    const srcW = image.displayWidth || image.codedWidth || 0;
    const srcH = image.displayHeight || image.codedHeight || 0;

    const needsRotation = metadata && [5,6,7,8].includes(metadata.orientation);
    const canvas = new OffscreenCanvas(needsRotation ? srcH : srcW, needsRotation ? srcW : srcH);
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.save();
      applyOrientationCorrectionToContext(ctx, (metadata && metadata.orientation) || 1, srcW, srcH);
      // @ts-ignore drawImage supports VideoFrame in modern browsers
      ctx.drawImage(image, 0, 0, srcW, srcH);
      ctx.restore();
    }
    // @ts-ignore
    if (typeof image.close === 'function') image.close();
    return canvas;
  } catch (error) {
    // Signal to main thread to handle HEIC fallback with its own decoder
    // Attach a code property for detection upstream
    // @ts-ignore
    if (!error || error.code !== 'HEIC_FALLBACK') {
      // Wrap any other error as fallback request too
      // eslint-disable-next-line no-unused-expressions
      null;
    }
    const err = new Error('HEIC_FALLBACK');
    // @ts-ignore
    err.code = 'HEIC_FALLBACK';
    throw err;
  }
}

// Apply EXIF orientation correction
function applyOrientationCorrection(canvas, orientation) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return canvas;

  const { width, height } = canvas;
  let newWidth = width;
  let newHeight = height;

  // Adjust canvas size for rotated orientations
  if ([5, 6, 7, 8].includes(orientation)) {
    newWidth = height;
    newHeight = width;
  }

  const orientedCanvas = new OffscreenCanvas(newWidth, newHeight);
  const orientedCtx = orientedCanvas.getContext('2d');

  if (!orientedCtx) return canvas;

  // Save context and apply transformation
  orientedCtx.save();

  switch (orientation) {
    case 2:
      orientedCtx.translate(newWidth, 0);
      orientedCtx.scale(-1, 1);
      break;
    case 3:
      orientedCtx.translate(newWidth, newHeight);
      orientedCtx.rotate(Math.PI);
      break;
    case 4:
      orientedCtx.translate(0, newHeight);
      orientedCtx.scale(1, -1);
      break;
    case 5:
      orientedCtx.rotate(0.5 * Math.PI);
      orientedCtx.scale(1, -1);
      break;
    case 6:
      orientedCtx.rotate(0.5 * Math.PI);
      orientedCtx.translate(0, -newWidth);
      break;
    case 7:
      orientedCtx.rotate(0.5 * Math.PI);
      orientedCtx.translate(newHeight, -newWidth);
      orientedCtx.scale(-1, 1);
      break;
    case 8:
      orientedCtx.rotate(-0.5 * Math.PI);
      orientedCtx.translate(-newHeight, 0);
      break;
  }

  orientedCtx.drawImage(canvas, 0, 0, width, height);
  orientedCtx.restore();

  return orientedCanvas;
}

// Convert regular image to canvas with orientation correction
async function convertImageToCanvas(fileData, metadata) {
  return new Promise((resolve, reject) => {
    const blob = new Blob([fileData]);
    const url = URL.createObjectURL(blob);
    const img = new Image();

    img.onload = () => {
      URL.revokeObjectURL(url);

      let canvas = new OffscreenCanvas(img.width, img.height);
      let ctx = canvas.getContext('2d');

      if (!ctx) {
        reject(new Error('Failed to get canvas context'));
        return;
      }

      // Apply orientation correction if needed
      if (metadata?.orientation && metadata.orientation !== 1) {
        const needsRotation = [5, 6, 7, 8].includes(metadata.orientation);
        canvas = new OffscreenCanvas(
          needsRotation ? img.height : img.width,
          needsRotation ? img.width : img.height
        );
        ctx = canvas.getContext('2d');

        if (!ctx) {
          reject(new Error('Failed to get oriented canvas context'));
          return;
        }

        ctx.save();
        applyOrientationCorrectionToContext(ctx, metadata.orientation, img.width, img.height);
        ctx.drawImage(img, 0, 0, img.width, img.height);
        ctx.restore();
      } else {
        ctx.drawImage(img, 0, 0);
      }

      resolve(canvas);
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load image'));
    };

    img.src = url;
  });
}

// Apply orientation correction to 2D context (for regular images)
function applyOrientationCorrectionToContext(ctx, orientation, width, height) {
  switch (orientation) {
    case 2:
      ctx.translate(width, 0);
      ctx.scale(-1, 1);
      break;
    case 3:
      ctx.translate(width, height);
      ctx.rotate(Math.PI);
      break;
    case 4:
      ctx.translate(0, height);
      ctx.scale(1, -1);
      break;
    case 5:
      ctx.rotate(0.5 * Math.PI);
      ctx.scale(1, -1);
      break;
    case 6:
      ctx.rotate(0.5 * Math.PI);
      ctx.translate(0, -height);
      break;
    case 7:
      ctx.rotate(0.5 * Math.PI);
      ctx.translate(width, -height);
      ctx.scale(-1, 1);
      break;
    case 8:
      ctx.rotate(-0.5 * Math.PI);
      ctx.translate(-width, 0);
      break;
  }
}

// Find optimal quality for target size
async function findOptimalQuality(canvas, targetSizeBytes) {
  let low = 0.1;
  let high = 1.0;
  let bestQuality = 0.9;
  let bestBlob = null;
  let bestSizeDiff = Infinity;

  // Binary search for optimal quality
  for (let i = 0; i < 10; i++) {
    const midQuality = (low + high) / 2;
    const blob = await canvas.convertToBlob({ type: 'image/jpeg', quality: midQuality });

    const sizeDiff = Math.abs(blob.size - targetSizeBytes);

    if (sizeDiff < bestSizeDiff) {
      bestSizeDiff = sizeDiff;
      bestQuality = midQuality;
      bestBlob = blob;
    }

    if (blob.size > targetSizeBytes) {
      high = midQuality;
    } else {
      low = midQuality;
    }
  }

  return { quality: Math.round(bestQuality * 100), blob: bestBlob };
}

// Main message handler
self.onmessage = async function(e) {
  const { action, data } = e.data;

  try {
    switch (action) {
      case 'convert_file': {
        const { fileData, fileName, metadata, useTargetSize, targetSize, targetSizeUnit, jpgQuality, metadataOption, outputFormat } = data;

        let canvas;

        // Determine if file is HEIC/HEIF
        const isHeic = /\.(heic|heif)$/i.test(fileName) ||
                      (fileData.length > 0 && fileData[0] === 0x66 && fileData[1] === 0x74 && fileData[2] === 0x79 && fileData[3] === 0x70); // ftyp box

        if (isHeic) {
          try {
            canvas = await convertHeicToCanvas(fileData, metadata);
          } catch (err) {
            // If HEIC fallback requested, notify main thread and continue processing other files
            // @ts-ignore
            if (err && err.code === 'HEIC_FALLBACK') {
              const transferable = fileData instanceof ArrayBuffer ? fileData : fileData.buffer;
              self.postMessage({
                type: 'heic_fallback_request',
                data: {
                  fileName,
                  fileData: transferable,
                  metadata,
                  useTargetSize,
                  targetSize,
                  targetSizeUnit,
                  jpgQuality,
                  metadataOption
                }
              }, [transferable]);
              break;
            }
            throw err;
          }
        } else {
          canvas = await convertImageToCanvas(fileData, metadata);
        }

        let blob;
        let finalQuality = jpgQuality;

        // Handle PDF format by requesting main thread fallback
        if (outputFormat === 'pdf') {
          const transferable = fileData instanceof ArrayBuffer ? fileData : fileData.buffer;
          self.postMessage({
            type: 'heic_fallback_request',
            data: {
              fileName,
              fileData: transferable,
              metadata,
              useTargetSize,
              targetSize,
              targetSizeUnit,
              jpgQuality,
              metadataOption,
              outputFormat
            }
          }, [transferable]);
          break;
        }

        if (useTargetSize && outputFormat === 'jpg') {
          const targetSizeBytes = targetSize * (targetSizeUnit === 'MB' ? 1024 * 1024 : 1024);
          const result = await findOptimalQuality(canvas, targetSizeBytes);
          blob = result.blob;
          finalQuality = result.quality;
        } else {
          blob = await convertCanvasToFormat(canvas, jpgQuality, outputFormat);
        }

        // Create thumbnail
        const maxThumb = 64;
        const ratio = Math.min(maxThumb / canvas.width, maxThumb / canvas.height);
        const tW = Math.max(1, Math.round(canvas.width * ratio));
        const tH = Math.max(1, Math.round(canvas.height * ratio));

        const tCanvas = new OffscreenCanvas(tW, tH);
        const tCtx = tCanvas.getContext('2d');
        if (tCtx) {
          tCtx.drawImage(canvas, 0, 0, tW, tH);
        }
        const thumbBlob = await tCanvas.convertToBlob({ type: 'image/jpeg', quality: 0.8 });
        const thumbUrl = URL.createObjectURL(thumbBlob);

        // Convert blob to array buffer for transfer
        const arrayBuffer = await blob.arrayBuffer();

        self.postMessage({
          type: 'file_converted',
          data: {
            fileName,
            convertedBlob: arrayBuffer,
            thumbUrl,
            finalQuality: useTargetSize && outputFormat === 'jpg' ? finalQuality : undefined,
            targetSize: useTargetSize && outputFormat === 'jpg' ? targetSize : undefined,
            metadataOption,
            outputFormat: outputFormat || 'jpg',
            blobSize: arrayBuffer.byteLength
          }
        }, [arrayBuffer]);

        break;
      }

      default:
        throw new Error(`Unknown action: ${action}`);
    }
  } catch (error) {
    self.postMessage({
      type: 'error',
      error: error.message,
      fileName: data?.fileName
    });
  }
};

// Convert canvas to PNG
async function convertCanvasToPNG(canvas) {
  return await canvas.convertToBlob({ type: 'image/png' });
}

// Convert canvas to PDF (simplified version for worker)
async function convertCanvasToPDF(canvas) {
  try {
    // Lazy load PDF-lib in worker context
    // Note: In worker context, we need to handle imports differently
    // For now, we'll use a simplified approach or request main thread fallback
    throw new Error('PDF generation not available in worker, requesting main thread fallback');
  } catch (error) {
    throw new Error('PDF generation not available in worker context');
  }
}

// Convert canvas to blob based on format
async function convertCanvasToFormat(canvas, quality, format) {
  switch (format) {
    case 'png':
      return await convertCanvasToPNG(canvas);
    case 'pdf':
      return await convertCanvasToPDF(canvas);
    case 'jpg':
    default:
      return await canvas.convertToBlob({ type: 'image/jpeg', quality: quality / 100 });
  }
}

// Handle worker termination
self.onbeforeunload = function() {
  // Clean up any resources if needed
};
