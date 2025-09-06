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

// Convert regular image to canvas with orientation correction (worker-safe)
async function convertImageToCanvas(fileData, metadata, mimeType) {
  if (typeof createImageBitmap !== 'function') {
    throw new Error('NO_IMAGE_DECODE_IN_WORKER');
  }
  const blob = new Blob([fileData], { type: mimeType || 'image/*' });
  const bitmap = await createImageBitmap(blob);

  const srcW = bitmap.width;
  const srcH = bitmap.height;

  const needsRotation = metadata && [5, 6, 7, 8].includes(metadata.orientation);
  const canvas = new OffscreenCanvas(needsRotation ? srcH : srcW, needsRotation ? srcW : srcH);
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Failed to get canvas context');

  ctx.save();
  applyOrientationCorrectionToContext(ctx, (metadata && metadata.orientation) || 1, srcW, srcH);
  ctx.drawImage(bitmap, 0, 0, srcW, srcH);
  ctx.restore();
  if (typeof bitmap.close === 'function') bitmap.close();
  return canvas;
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
        const { fileData, fileName, originalType, metadata, useTargetSize, targetSize, targetSizeUnit, jpgQuality, metadataOption, outputFormat } = data;

        // Early fallback for PDF output (handled on main thread)
        if (outputFormat === 'pdf') {
          const transferable = fileData instanceof ArrayBuffer ? fileData : fileData.buffer;
          self.postMessage({
            type: 'heic_fallback_request',
            data: {
              fileName,
              fileData: transferable,
              originalType,
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
                  originalType,
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
          try {
            canvas = await convertImageToCanvas(fileData, metadata, originalType);
          } catch (err) {
            const transferable = fileData instanceof ArrayBuffer ? fileData : fileData.buffer;
            self.postMessage({
              type: 'heic_fallback_request',
              data: {
                fileName,
                fileData: transferable,
                originalType,
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
              originalType,
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
          blob = await convertCanvasToFormat(canvas, jpgQuality, outputFormat, data.pngCompression || 'off');
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

// Lossy PNG via JPEG intermediate to approximate a quality slider
async function convertCanvasToPNGWithQuality(canvas, quality) {
  // Create JPEG first
  const jpegBlob = await canvas.convertToBlob({ type: 'image/jpeg', quality: Math.min(1, Math.max(0.01, quality / 100)) });
  // Decode JPEG
  if (typeof createImageBitmap !== 'function') {
    // No safe decode path in worker; fall back to main thread
    throw new Error('NO_IMAGE_DECODE_IN_WORKER');
  }
  const bitmap = await createImageBitmap(jpegBlob);
  const c = new OffscreenCanvas(bitmap.width, bitmap.height);
  const cx = c.getContext('2d');
  if (!cx) throw new Error('Failed to get canvas context');
  cx.drawImage(bitmap, 0, 0);
  if (typeof bitmap.close === 'function') bitmap.close();
  return await c.convertToBlob({ type: 'image/png' });
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
function applyPngCompressionToCanvas(srcCanvas, level) {
  const width = srcCanvas.width, height = srcCanvas.height;
  const canvas = new OffscreenCanvas(width, height);
  const ctx = canvas.getContext('2d');
  if (!ctx) return srcCanvas;
  ctx.drawImage(srcCanvas, 0, 0);
  const img = ctx.getImageData(0, 0, width, height);
  const data = img.data;
  const bayer = [ [0,8,2,10], [12,4,14,6], [3,11,1,9], [15,7,13,5] ];
  const cfg = level === 'light' ? {r:5,g:6,b:5,d:true} : level === 'medium' ? {r:4,g:5,b:4,d:true} : {r:3,g:3,b:2,d:true};
  const quant = (v,bits,th) => { const levels=(1<<bits)-1; const vv = Math.max(0,Math.min(255, v + (cfg.d? th-8:0))); const q=Math.round((vv/255)*levels); return Math.round((q/levels)*255); };
  for (let y=0;y<height;y++) {
    for (let x=0;x<width;x++) {
      const i=(y*width+x)*4; const th=bayer[y%4][x%4];
      data[i]   = quant(data[i],   cfg.r, th);
      data[i+1] = quant(data[i+1], cfg.g, th);
      data[i+2] = quant(data[i+2], cfg.b, th);
    }
  }
  ctx.putImageData(img,0,0);
  return canvas;
}

async function convertCanvasToFormat(canvas, quality, format, pngCompression) {
  switch (format) {
    case 'png':
      // Apply optional compression first, then optional lossy re-encode if quality < 100
      const baseCanvas = (pngCompression && pngCompression !== 'off') ? applyPngCompressionToCanvas(canvas, pngCompression) : canvas;
      if (quality < 100) {
        try { return await convertCanvasToPNGWithQuality(baseCanvas, quality); } catch { return await convertCanvasToPNG(baseCanvas); }
      }
      return await convertCanvasToPNG(baseCanvas);
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
