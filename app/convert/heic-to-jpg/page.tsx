"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import ToolHeader from "@/components/ui/tool-header"
import FeedbackForm from "@/components/ui/feedback-form"
import { useToast } from "@/hooks/use-toast"

/**
 * HEIC to JPG Converter - Convert Apple HEIC photos to JPG format
 * Privacy-first, no upload required, works entirely in browser
 */
interface FileMetadata {
  width: number
  height: number
  orientation: number
  orientationText: string
}

interface ConvertedFile {
  originalName: string
  convertedBlob: Blob
  downloadUrl: string
  thumbUrl: string
  finalQuality?: number
  targetSize?: number
  metadataOption?: 'remove' | 'basic'
  outputFormat: 'jpg' | 'png' | 'pdf'
}

export default function HEICToJPGConverter() {
  const { toast } = useToast()
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [fileThumbnails, setFileThumbnails] = useState<Map<number, string>>(new Map())
  const [fileMetadata, setFileMetadata] = useState<Map<number, FileMetadata>>(new Map())
  const [convertedFiles, setConvertedFiles] = useState<ConvertedFile[]>([])
  const [isConverting, setIsConverting] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [conversionProgress, setConversionProgress] = useState({ current: 0, total: 0 })
  const [compactView, setCompactView] = useState(false)
  const [jpgQuality, setJpgQuality] = useState(90)
  const [useTargetSize, setUseTargetSize] = useState(false)
  const [targetSize, setTargetSize] = useState(500)
  const [targetSizeUnit, setTargetSizeUnit] = useState<'KB' | 'MB'>('KB')
  const [metadataOption, setMetadataOption] = useState<'remove' | 'basic'>('remove')
  const [outputFormat, setOutputFormat] = useState<'jpg' | 'png' | 'pdf'>('jpg')
  const [worker, setWorker] = useState<Worker | null>(null)
  const [zipSizeEstimate, setZipSizeEstimate] = useState<number>(0)
  const [isCreatingZip, setIsCreatingZip] = useState(false)
  const [isLoadingCodec, setIsLoadingCodec] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Check if a file is HEIC/HEIF by type or extension
  const isHeicFile = (file: File) => {
    const name = file.name.toLowerCase()
    const type = (file.type || '').toLowerCase()
    return type.includes('heic') || type.includes('heif') || name.endsWith('.heic') || name.endsWith('.heif')
  }

  // Get orientation text description
  const getOrientationText = (orientation: number): string => {
    switch (orientation) {
      case 1: return 'Normal'
      case 2: return 'Flip horizontal'
      case 3: return 'Rotate 180°'
      case 4: return 'Flip vertical'
      case 5: return 'Transpose'
      case 6: return 'Rotate 90° CW'
      case 7: return 'Transverse'
      case 8: return 'Rotate 90° CCW'
      default: return 'Unknown'
    }
  }

  // Apply EXIF orientation to canvas context
  const applyOrientation = (ctx: CanvasRenderingContext2D, orientation: number, width: number, height: number) => {
    switch (orientation) {
      case 2:
        ctx.translate(width, 0)
        ctx.scale(-1, 1)
        break
      case 3:
        ctx.translate(width, height)
        ctx.rotate(Math.PI)
        break
      case 4:
        ctx.translate(0, height)
        ctx.scale(1, -1)
        break
      case 5:
        ctx.rotate(0.5 * Math.PI)
        ctx.scale(1, -1)
        break
      case 6:
        ctx.rotate(0.5 * Math.PI)
        ctx.translate(0, -height)
        break
      case 7:
        ctx.rotate(0.5 * Math.PI)
        ctx.translate(width, -height)
        ctx.scale(-1, 1)
        break
      case 8:
        ctx.rotate(-0.5 * Math.PI)
        ctx.translate(-width, 0)
        break
    }
  }

  // Extract EXIF data and metadata from file
  const extractMetadata = async (file: File): Promise<FileMetadata> => {
    try {
      // @ts-ignore - exifr may not have complete types
      const exifr = await import('exifr')
      
      // For HEIC files, try to extract EXIF data
      if (isHeicFile(file)) {
        try {
          const exifData = await exifr.parse(file, {
            tiff: true,
            xmp: true,
            icc: false,
            iptc: false,
            jfif: false,
            ihdr: false,
            gps: false
          })
          
          // HEIC files might have different property names
          const width = exifData?.ImageWidth || exifData?.PixelXDimension || exifData?.ExifImageWidth || 0
          const height = exifData?.ImageLength || exifData?.ImageHeight || exifData?.PixelYDimension || exifData?.ExifImageHeight || 0
          const orientation = exifData?.Orientation || 1
          
          return {
            width,
            height,
            orientation,
            orientationText: getOrientationText(orientation)
          }
        } catch (heicError) {
          console.warn('HEIC EXIF extraction failed:', heicError)
          
          // Fallback: try to decode HEIC to get dimensions
          try {
            // @ts-ignore - heic-decode doesn't have types
            const mod = await import('heic-decode')
            const decode = (mod as any).default || (mod as any).decode
            const arrayBuf = await file.arrayBuffer()
            
            if (arrayBuf && arrayBuf.byteLength > 0) {
              const result = await decode({ buffer: arrayBuf })
              if (result && result.width && result.height) {
                return {
                  width: result.width,
                  height: result.height,
                  orientation: 1, // Default since we can't get EXIF
                  orientationText: 'Normal (estimated)'
                }
              }
            }
          } catch (decodeError) {
            console.warn('HEIC decode for metadata failed:', decodeError)
          }
        }
      } else {
        // For regular images
        const exifData = await exifr.parse(file, ['ImageWidth', 'ImageHeight', 'Orientation'])
        if (exifData && (exifData.ImageWidth || exifData.ImageHeight)) {
          return {
            width: exifData.ImageWidth || 0,
            height: exifData.ImageHeight || 0,
            orientation: exifData.Orientation || 1,
            orientationText: getOrientationText(exifData.Orientation || 1)
          }
        }
      }
    } catch (error) {
      console.warn('EXIF extraction failed:', error)
    }
    
    // Final fallback: try to get dimensions from image element for non-HEIC files
    if (!isHeicFile(file)) {
      try {
        const img = new Image()
        const url = URL.createObjectURL(file)
        await new Promise((resolve, reject) => {
          img.onload = resolve
          img.onerror = reject
          img.src = url
        })
        URL.revokeObjectURL(url)
        
        return {
          width: img.naturalWidth,
          height: img.naturalHeight,
          orientation: 1,
          orientationText: 'Normal'
        }
      } catch {
        // Silent fallback
      }
    }
    
    return {
      width: 0,
      height: 0,
      orientation: 1,
      orientationText: 'Unknown'
    }
  }

  // Generate thumbnail for image files with EXIF orientation correction
  const generateThumbnail = async (file: File, index: number): Promise<string> => {
    const metadata = await extractMetadata(file)
    
    // HEIC/HEIF: try native ImageDecoder first, otherwise lazy-load WASM fallback
    if (isHeicFile(file)) {
      try {
        // Attempt native decode via WebCodecs ImageDecoder
        // @ts-ignore - ImageDecoder may not exist in all environments
        if (typeof ImageDecoder !== 'undefined') {
          const type = (file.type && file.type.includes('heif')) ? 'image/heif' : 'image/heic'
          // @ts-ignore - TS may not know about ImageDecoder
          const decoder = new ImageDecoder({ data: await file.arrayBuffer(), type })
          const { image } = await decoder.decode()
          const srcW = (image as any).displayWidth || (image as any).codedWidth || 0
          const srcH = (image as any).displayHeight || (image as any).codedHeight || 0

          const maxSize = 64
          const ratio = Math.min(maxSize / srcW, maxSize / srcH)
          const dstW = Math.max(1, Math.round(srcW * ratio))
          const dstH = Math.max(1, Math.round(srcH * ratio))

          // Adjust canvas size for rotated orientations
          const needsRotation = [5, 6, 7, 8].includes(metadata.orientation)
          const canvas = document.createElement('canvas')
          canvas.width = needsRotation ? dstH : dstW
          canvas.height = needsRotation ? dstW : dstH
          
          const ctx = canvas.getContext('2d')
          if (ctx) {
            ctx.save()
            applyOrientation(ctx, metadata.orientation, dstW, dstH)
            // @ts-ignore drawImage supports VideoFrame in modern browsers
            ctx.drawImage(image as any, 0, 0, dstW, dstH)
            ctx.restore()
          }
          // @ts-ignore
          if (typeof image.close === 'function') image.close()
          return canvas.toDataURL('image/jpeg', 0.8)
        }
      } catch (err) {
        // ignore and fallback to WASM
      }

      try {
        // Lazy-load WASM decoder only when needed
        // @ts-ignore - no types provided by the package
        const mod = await import('heic-decode')
        const decode = (mod as any).default || (mod as any).decode
        const arrayBuf = await file.arrayBuffer()
        
        if (!arrayBuf || arrayBuf.byteLength === 0) {
          throw new Error('Empty or invalid file buffer')
        }
        
        const result = await decode({ buffer: new Uint8Array(arrayBuf) })
        
        if (!result || !result.data) {
          throw new Error('Failed to decode HEIC file')
        }
        
        const { width, height, data } = result

        // Put raw RGBA into a source canvas
        const srcCanvas = document.createElement('canvas')
        srcCanvas.width = width
        srcCanvas.height = height
        const srcCtx = srcCanvas.getContext('2d')
        if (srcCtx) {
          const imgData = new ImageData(new Uint8ClampedArray(data), width, height)
          srcCtx.putImageData(imgData, 0, 0)
        }

        // Scale down to thumbnail with orientation correction
        const maxSize = 64
        const ratio = Math.min(maxSize / width, maxSize / height)
        const dstW = Math.max(1, Math.round(width * ratio))
        const dstH = Math.max(1, Math.round(height * ratio))

        // Adjust canvas size for rotated orientations
        const needsRotation = [5, 6, 7, 8].includes(metadata.orientation)
        const dstCanvas = document.createElement('canvas')
        dstCanvas.width = needsRotation ? dstH : dstW
        dstCanvas.height = needsRotation ? dstW : dstH
        
        const dstCtx = dstCanvas.getContext('2d')
        if (dstCtx) {
          dstCtx.save()
          applyOrientation(dstCtx, metadata.orientation, dstW, dstH)
          dstCtx.drawImage(srcCanvas, 0, 0, dstW, dstH)
          dstCtx.restore()
        }

        return dstCanvas.toDataURL('image/jpeg', 0.8)
      } catch (err) {
        return ''
      }
    }

    // Generic image decode path via <img/> with orientation correction
    return await new Promise((resolve) => {
      const img = new Image()

      img.onload = () => {
        const maxSize = 64
        const ratio = Math.min(maxSize / img.width, maxSize / img.height)
        const dstW = Math.max(1, Math.round(img.width * ratio))
        const dstH = Math.max(1, Math.round(img.height * ratio))

        // Adjust canvas size for rotated orientations
        const needsRotation = [5, 6, 7, 8].includes(metadata.orientation)
        const canvas = document.createElement('canvas')
        canvas.width = needsRotation ? dstH : dstW
        canvas.height = needsRotation ? dstW : dstH
        
        const ctx = canvas.getContext('2d')
        if (ctx) {
          ctx.save()
          applyOrientation(ctx, metadata.orientation, dstW, dstH)
          ctx.drawImage(img, 0, 0, dstW, dstH)
          ctx.restore()
        }
        resolve(canvas.toDataURL('image/jpeg', 0.8))
      }

      img.onerror = () => resolve('')
      img.src = URL.createObjectURL(file)
    })
  }

  // Get file type icon based on extension
  const getFileTypeIcon = (fileName: string) => {
    const ext = fileName.toLowerCase().split('.').pop()
    switch (ext) {
      case 'heic':
      case 'heif':
        return (
          <svg className="h-5 w-5 text-purple-600 dark:text-purple-400" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
          </svg>
        )
      case 'jpg':
      case 'jpeg':
        return (
          <svg className="h-5 w-5 text-green-600 dark:text-green-400" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
          </svg>
        )
      case 'png':
        return (
          <svg className="h-5 w-5 text-blue-600 dark:text-blue-400" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
          </svg>
        )
      default:
        return (
          <svg className="h-5 w-5 text-gray-600 dark:text-gray-400" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
          </svg>
        )
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    const files = Array.from(e.dataTransfer.files)
    const acceptedFiles = files.filter(file => {
      const name = file.name.toLowerCase()
      return (
        name.endsWith('.heic') ||
        name.endsWith('.heif') ||
        name.endsWith('.jpg') ||
        name.endsWith('.jpeg') ||
        name.endsWith('.png')
      )
    })

    if (acceptedFiles.length > 0) {
      const newFiles = [...selectedFiles, ...acceptedFiles]
      setSelectedFiles(newFiles)

      // Auto-enable compact view for large batches
      if (newFiles.length > 30) {
        setCompactView(true)
      }

      // Generate thumbnails and extract metadata for new files
      acceptedFiles.forEach(async (file, index) => {
        const globalIndex = selectedFiles.length + index
        try {
          const [thumbnail, metadata] = await Promise.all([
            generateThumbnail(file, globalIndex),
            extractMetadata(file)
          ])
          
          if (thumbnail) {
            setFileThumbnails(prev => new Map(prev.set(globalIndex, thumbnail)))
          }
          setFileMetadata(prev => new Map(prev.set(globalIndex, metadata)))
        } catch (error) {
          console.warn('Failed to process file', file.name, error)
        }
      })
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    const acceptedFiles = files.filter(file => {
      const name = file.name.toLowerCase()
      return (
        name.endsWith('.heic') ||
        name.endsWith('.heif') ||
        name.endsWith('.jpg') ||
        name.endsWith('.jpeg') ||
        name.endsWith('.png')
      )
    })

    if (acceptedFiles.length > 0) {
      const newFiles = [...selectedFiles, ...acceptedFiles]
      setSelectedFiles(newFiles)

      // Auto-enable compact view for large batches
      if (newFiles.length > 30) {
        setCompactView(true)
      }

      // Generate thumbnails and extract metadata for new files
      acceptedFiles.forEach(async (file, index) => {
        const globalIndex = selectedFiles.length + index
        try {
          const [thumbnail, metadata] = await Promise.all([
            generateThumbnail(file, globalIndex),
            extractMetadata(file)
          ])
          
          if (thumbnail) {
            setFileThumbnails(prev => new Map(prev.set(globalIndex, thumbnail)))
          }
          setFileMetadata(prev => new Map(prev.set(globalIndex, metadata)))
        } catch (error) {
          console.warn('Failed to process file', file.name, error)
        }
      })
    }
  }

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index))
    setFileThumbnails(prev => {
      const newMap = new Map(prev)
      newMap.delete(index)
      // Re-index remaining thumbnails
      const reIndexedMap = new Map()
      Array.from(newMap.entries()).forEach(([oldIndex, thumbnail], newIndex) => {
        if (oldIndex > index) {
          reIndexedMap.set(newIndex, thumbnail)
        } else if (oldIndex < index) {
          reIndexedMap.set(oldIndex, thumbnail)
        }
      })
      return reIndexedMap
    })
    setFileMetadata(prev => {
      const newMap = new Map(prev)
      newMap.delete(index)
      // Re-index remaining metadata
      const reIndexedMap = new Map()
      Array.from(newMap.entries()).forEach(([oldIndex, metadata], newIndex) => {
        if (oldIndex > index) {
          reIndexedMap.set(newIndex, metadata)
        } else if (oldIndex < index) {
          reIndexedMap.set(oldIndex, metadata)
        }
      })
      return reIndexedMap
    })
  }

  const clearAllFiles = () => {
    setSelectedFiles([])
    setFileThumbnails(new Map())
    setFileMetadata(new Map())
    // Clean up converted files
    convertedFiles.forEach(file => {
      URL.revokeObjectURL(file.downloadUrl)
    })
    setConvertedFiles([])
  }

    const handleConvert = async () => {
    if (selectedFiles.length === 0 || isConverting) return

    setIsConverting(true)
    setConversionProgress({ current: 0, total: selectedFiles.length })
    const newConvertedFiles: ConvertedFile[] = []

    try {
      for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i]
        const metadata = fileMetadata.get(i) || { width: 0, height: 0, orientation: 1, orientationText: 'Normal' }

        setConversionProgress({ current: i + 1, total: selectedFiles.length })

        try {
          let canvas: HTMLCanvasElement

          if (isHeicFile(file)) {
            // Convert HEIC/HEIF to JPG
            canvas = await convertHeicToCanvas(file, metadata)
          } else {
            // Convert other formats to JPG with orientation correction
            canvas = await convertImageToCanvas(file, metadata)
          }

          let blob: Blob
          let finalQuality = jpgQuality

          if (useTargetSize && outputFormat === 'jpg') {
            // Calculate target size in bytes (only for JPG format)
            const targetSizeBytes = targetSize * (targetSizeUnit === 'MB' ? 1024 * 1024 : 1024)

            // Find optimal quality to reach target size
            const result = await findOptimalQuality(canvas, targetSizeBytes)
            blob = result.blob
            finalQuality = result.quality
          } else {
            // Convert canvas to selected format
            blob = await convertCanvasToFormat(canvas, jpgQuality)
          }

          // Get file extension based on output format
          const getFileExtension = (format: string) => {
            switch (format) {
              case 'png': return 'png'
              case 'pdf': return 'pdf'
              case 'jpg':
              default: return 'jpg'
            }
          }

          const originalName = file.name.replace(/\.(heic|heif|png|jpg|jpeg)$/i, '')
          const extension = getFileExtension(outputFormat)
          const downloadUrl = URL.createObjectURL(blob)

          // Create a small thumbnail from the result canvas for the converted list
          const maxThumb = 64
          const ratio = Math.min(maxThumb / canvas.width, maxThumb / canvas.height)
          const tW = Math.max(1, Math.round(canvas.width * ratio))
          const tH = Math.max(1, Math.round(canvas.height * ratio))
          const tCanvas = document.createElement('canvas')
          tCanvas.width = tW
          tCanvas.height = tH
          const tCtx = tCanvas.getContext('2d')
          if (tCtx) {
            tCtx.drawImage(canvas, 0, 0, tW, tH)
          }
          const thumbUrl = tCanvas.toDataURL('image/jpeg', 0.8)

          newConvertedFiles.push({
            originalName,
            convertedBlob: blob,
            downloadUrl,
            thumbUrl,
            finalQuality: useTargetSize && outputFormat === 'jpg' ? finalQuality : undefined,
            targetSize: useTargetSize && outputFormat === 'jpg' ? targetSize : undefined,
            metadataOption,
            outputFormat
          })
        } catch (error) {
          console.error(`Failed to convert ${file.name}:`, error)
        }
      }
      
      setConvertedFiles(newConvertedFiles)
    } finally {
      setIsConverting(false)
      setConversionProgress({ current: 0, total: 0 })
    }
  }

  // Convert HEIC file to canvas with orientation correction
  const convertHeicToCanvas = async (file: File, metadata: FileMetadata): Promise<HTMLCanvasElement> => {
    // Try native ImageDecoder first
    try {
      // @ts-ignore - ImageDecoder may not exist in all environments
      if (typeof ImageDecoder !== 'undefined') {
        const type = (file.type && file.type.includes('heif')) ? 'image/heif' : 'image/heic'
        // @ts-ignore - TS may not know about ImageDecoder
        const decoder = new ImageDecoder({ data: await file.arrayBuffer(), type })
        const { image } = await decoder.decode()
        const srcW = (image as any).displayWidth || (image as any).codedWidth || metadata.width
        const srcH = (image as any).displayHeight || (image as any).codedHeight || metadata.height

        // Adjust canvas size for rotated orientations
        const needsRotation = [5, 6, 7, 8].includes(metadata.orientation)
        const canvas = document.createElement('canvas')
        canvas.width = needsRotation ? srcH : srcW
        canvas.height = needsRotation ? srcW : srcH
        
        const ctx = canvas.getContext('2d')
        if (ctx) {
          ctx.save()
          applyOrientation(ctx, metadata.orientation, srcW, srcH)
          // @ts-ignore drawImage supports VideoFrame in modern browsers
          ctx.drawImage(image as any, 0, 0, srcW, srcH)
          ctx.restore()
        }
        // @ts-ignore
        if (typeof image.close === 'function') image.close()
        return canvas
      }
    } catch (err) {
      // Fallback to WASM
    }

    // WASM fallback
    try {
      // @ts-ignore - no types provided by the package
      const mod = await import('heic-decode')
      const decode = (mod as any).default || (mod as any).decode
      const arrayBuf = await file.arrayBuffer()
      
      if (!arrayBuf || arrayBuf.byteLength === 0) {
        throw new Error('Empty or invalid file buffer')
      }
      
      const result = await decode({ buffer: new Uint8Array(arrayBuf) })
      
      if (!result || !result.data) {
        throw new Error('Failed to decode HEIC file')
      }
      
      const { width, height, data } = result

      // Put raw RGBA into a source canvas
      const srcCanvas = document.createElement('canvas')
      srcCanvas.width = width
      srcCanvas.height = height
      const srcCtx = srcCanvas.getContext('2d')
      if (srcCtx) {
        const imgData = new ImageData(new Uint8ClampedArray(data), width, height)
        srcCtx.putImageData(imgData, 0, 0)
      }

      // Apply orientation correction
      const needsRotation = [5, 6, 7, 8].includes(metadata.orientation)
      const canvas = document.createElement('canvas')
      canvas.width = needsRotation ? height : width
      canvas.height = needsRotation ? width : height
      
      const ctx = canvas.getContext('2d')
      if (ctx) {
        ctx.save()
        applyOrientation(ctx, metadata.orientation, width, height)
        ctx.drawImage(srcCanvas, 0, 0, width, height)
        ctx.restore()
      }

      return canvas
    } catch (error) {
      console.error('WASM HEIC decode failed:', error)
      throw new Error(`Failed to decode HEIC file: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  // Convert regular image file to canvas with orientation correction
  const convertImageToCanvas = async (file: File, metadata: FileMetadata): Promise<HTMLCanvasElement> => {
    return new Promise((resolve, reject) => {
      const img = new Image()

      img.onload = () => {
        const needsRotation = [5, 6, 7, 8].includes(metadata.orientation)
        const canvas = document.createElement('canvas')
        canvas.width = needsRotation ? img.height : img.width
        canvas.height = needsRotation ? img.width : img.height

        const ctx = canvas.getContext('2d')
        if (ctx) {
          ctx.save()
          applyOrientation(ctx, metadata.orientation, img.width, img.height)
          ctx.drawImage(img, 0, 0, img.width, img.height)
          ctx.restore()
        }
        resolve(canvas)
      }

      img.onerror = () => reject(new Error('Failed to load image'))
      img.src = URL.createObjectURL(file)
    })
  }

  // Find optimal quality to reach target size using binary search
  const findOptimalQuality = async (canvas: HTMLCanvasElement, targetSizeBytes: number): Promise<{ quality: number; blob: Blob }> => {
    let low = 0.1
    let high = 1.0
    let bestQuality = 0.9
    let bestBlob: Blob | null = null
    let bestSizeDiff = Infinity

    // Binary search for 10 iterations to find optimal quality
    for (let i = 0; i < 10; i++) {
      const midQuality = (low + high) / 2
      const testBlob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob((blob) => {
          if (blob) resolve(blob)
          else reject(new Error('Failed to create blob'))
        }, 'image/jpeg', midQuality)
      })

      const sizeDiff = Math.abs(testBlob.size - targetSizeBytes)

      if (sizeDiff < bestSizeDiff) {
        bestSizeDiff = sizeDiff
        bestQuality = midQuality
        bestBlob = testBlob
      }

      // Adjust search bounds
      if (testBlob.size > targetSizeBytes) {
        high = midQuality
      } else {
        low = midQuality
      }
    }

    return { quality: Math.round(bestQuality * 100), blob: bestBlob! }
  }

  // Process metadata based on user choice
  const processMetadata = async (canvas: HTMLCanvasElement, originalFile: File, quality: number, metadata: FileMetadata | undefined): Promise<Blob> => {
    if (metadataOption === 'remove') {
      // Simply convert canvas to blob - no EXIF data will be included
      return new Promise((resolve, reject) => {
        canvas.toBlob((blob) => {
          if (blob) resolve(blob)
          else reject(new Error('Failed to create blob'))
        }, 'image/jpeg', quality / 100)
      })
    } else {
      // Keep basic metadata - for now, we'll just return the blob as-is since canvas.toBlob doesn't preserve EXIF
      // In a production implementation, you would use a library like piexifjs to add minimal EXIF
      // For this demo, we'll note that basic metadata preservation would require additional libraries
      return new Promise((resolve, reject) => {
        canvas.toBlob((blob) => {
          if (blob) resolve(blob)
          else reject(new Error('Failed to create blob'))
        }, 'image/jpeg', quality / 100)
      })
    }
  }

  // Convert canvas to PNG blob
  const convertCanvasToPNG = async (canvas: HTMLCanvasElement): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (blob) resolve(blob)
        else reject(new Error('Failed to create PNG blob'))
      }, 'image/png')
    })
  }

  // Convert canvas to PDF with single image per page
  const convertCanvasToPDF = async (canvas: HTMLCanvasElement): Promise<Blob> => {
    try {
      // Lazy load PDF-lib
      const { PDFDocument, rgb } = await import('pdf-lib')

      // Create a new PDF document
      const pdfDoc = await PDFDocument.create()

      // Get canvas dimensions
      const canvasWidth = canvas.width
      const canvasHeight = canvas.height

      // Calculate PDF page size (A4 by default, but adjust to fit image)
      const pageWidth = 595.28 // A4 width in points
      const pageHeight = 841.89 // A4 height in points

      // Calculate scaling to fit image on page while maintaining aspect ratio
      const scaleX = pageWidth / canvasWidth
      const scaleY = pageHeight / canvasHeight
      const scale = Math.min(scaleX, scaleY)

      const scaledWidth = canvasWidth * scale
      const scaledHeight = canvasHeight * scale

      // Center the image on the page
      const x = (pageWidth - scaledWidth) / 2
      const y = (pageHeight - scaledHeight) / 2

      // Add a page to the document
      const page = pdfDoc.addPage([pageWidth, pageHeight])

      // Convert canvas to PNG data URL for embedding
      const pngBlob = await convertCanvasToPNG(canvas)
      const pngArrayBuffer = await pngBlob.arrayBuffer()
      const pngImage = await pdfDoc.embedPng(pngArrayBuffer)

      // Draw the image on the page
      page.drawImage(pngImage, {
        x,
        y,
        width: scaledWidth,
        height: scaledHeight,
      })

      // Serialize the PDF document to bytes
      const pdfBytes = await pdfDoc.save()
      return new Blob([pdfBytes], { type: 'application/pdf' })
    } catch (error) {
      console.error('PDF generation failed:', error)
      throw new Error(`Failed to generate PDF: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  // Convert canvas to blob based on selected format
  const convertCanvasToFormat = async (canvas: HTMLCanvasElement, quality: number): Promise<Blob> => {
    switch (outputFormat) {
      case 'png':
        return await convertCanvasToPNG(canvas)
      case 'pdf':
        return await convertCanvasToPDF(canvas)
      case 'jpg':
      default:
        return new Promise((resolve, reject) => {
          canvas.toBlob((blob) => {
            if (blob) resolve(blob)
            else reject(new Error('Failed to create blob'))
          }, 'image/jpeg', quality / 100)
        })
    }
  }

  // Initialize Web Worker
  const initializeWorker = () => {
    if (typeof window !== 'undefined' && !worker) {
      try {
        const newWorker = new Worker('/workers/image-converter.js')
        newWorker.onmessage = handleWorkerMessage
        newWorker.onerror = (error) => {
          console.error('Worker error:', error)
          setIsConverting(false)
        }
        setWorker(newWorker)
      } catch (error) {
        console.warn('Web Worker not supported, falling back to main thread')
      }
    }
  }

  // Handle messages from Web Worker
  const handleWorkerMessage = (e: MessageEvent) => {
    const { type, data, error, fileName } = e.data

    if (type === 'file_converted') {
      const originalName = data.fileName.replace(/\.(heic|heif|png|jpg|jpeg)$/i, '')
      const downloadUrl = URL.createObjectURL(new Blob([data.convertedBlob]))

      const newConvertedFile = {
        originalName,
        convertedBlob: new Blob([data.convertedBlob]),
        downloadUrl,
        thumbUrl: data.thumbUrl,
        finalQuality: data.finalQuality,
        targetSize: data.targetSize,
        metadataOption: data.metadataOption,
        outputFormat: data.outputFormat || 'jpg'
      }

      setConvertedFiles(prev => [...prev, newConvertedFile])
      setConversionProgress(prev => ({
        current: prev.current + 1,
        total: prev.total
      }))

      // Update ZIP size estimate
      setZipSizeEstimate(prev => prev + data.blobSize)

      // Check if conversion is complete
      const updatedProgress = {
        current: conversionProgress.current + 1,
        total: conversionProgress.total
      }

      if (updatedProgress.current >= updatedProgress.total) {
        // Show success toast when all files are converted
        const totalSize = convertedFiles.reduce((sum, file) => sum + file.convertedBlob.size, data.blobSize)
        const avgSizeMB = totalSize / (1024 * 1024) / updatedProgress.total

        toast({
          title: "Conversion Complete! 🎉",
          description: `${updatedProgress.total} file${updatedProgress.total > 1 ? 's' : ''} converted successfully. Average size: ${avgSizeMB.toFixed(2)} MB each.`,
        })

        // Hide the converting indicator
        setIsConverting(false)
      }
    } else if (type === 'heic_fallback_request') {
      // Worker requested main-thread HEIC fallback (convert just this file)
      convertHeicFallbackOnMainThread(data)
    } else if (type === 'error') {
      console.error(`Conversion error for ${fileName}:`, error)
      setConversionProgress(prev => {
        const updatedProgress = {
          current: prev.current + 1,
          total: prev.total
        }
        
        // Check if all files are processed (including failed ones)
        if (updatedProgress.current >= updatedProgress.total) {
          setIsConverting(false)
        }
        
        return updatedProgress
      })

      toast({
        title: "Conversion Error",
        description: `Failed to convert ${fileName}. Please try again.`,
        variant: "destructive",
      })
    }
  }

  // Lazy load codecs for main thread fallback
  const loadCodecsForMainThread = async () => {
    setIsLoadingCodec(true)
    try {
      // Pre-load HEIC decoder if needed
      if (selectedFiles.some(file => isHeicFile(file))) {
        await import('heic-decode' as any)
      }
    } catch (error) {
      console.warn('Failed to load codecs:', error)
    } finally {
      setIsLoadingCodec(false)
    }
  }

  // Convert files using Web Worker
  const convertFilesWithWorker = async () => {
    if (!worker) {
      console.warn('Worker not available, using fallback method')
      await loadCodecsForMainThread()
      await handleConvert()
      return
    }

    setIsConverting(true)
    setConvertedFiles([])
    setZipSizeEstimate(0)
    setConversionProgress({ current: 0, total: selectedFiles.length })

    for (const file of selectedFiles) {
      try {
        const metadata = fileMetadata.get(selectedFiles.indexOf(file)) || {
          width: 0, height: 0, orientation: 1, orientationText: 'Normal'
        }

        const fileData = await file.arrayBuffer()

        worker.postMessage({
          action: 'convert_file',
          data: {
            fileData,
            fileName: file.name,
            metadata,
            useTargetSize,
            targetSize,
            targetSizeUnit,
            jpgQuality,
            metadataOption,
            outputFormat
          }
        })
      } catch (error) {
        console.error(`Failed to process ${file.name}:`, error)
        setConversionProgress(prev => ({
          current: prev.current + 1,
          total: prev.total
        }))
      }
    }
  }

  // Handle a single HEIC fallback conversion on the main thread (from worker request)
  const convertHeicFallbackOnMainThread = async (payload: any) => {
    try {
      // Rebuild File from ArrayBuffer
      const arrayBuffer: ArrayBuffer = payload.fileData
      const u8 = new Uint8Array(arrayBuffer)
      const file = new File([u8], payload.fileName, { type: 'image/heic' })

      // Ensure codecs are present
      await loadCodecsForMainThread()

      // Build canvas using existing HEIC path
      const canvas = await convertHeicToCanvas(file, payload.metadata)

      // Choose quality based on target setting and format
      let blob: Blob
      let finalQuality = jpgQuality
      if (payload.useTargetSize && payload.outputFormat === 'jpg') {
        const targetSizeBytes = payload.targetSize * (payload.targetSizeUnit === 'MB' ? 1024 * 1024 : 1024)
        const result = await findOptimalQuality(canvas, targetSizeBytes)
        blob = result.blob
        finalQuality = result.quality
      } else {
        blob = await convertCanvasToFormat(canvas, jpgQuality)
      }

      // Create thumb
      const maxThumb = 64
      const ratio = Math.min(maxThumb / canvas.width, maxThumb / canvas.height)
      const tW = Math.max(1, Math.round(canvas.width * ratio))
      const tH = Math.max(1, Math.round(canvas.height * ratio))
      const tCanvas = document.createElement('canvas')
      tCanvas.width = tW
      tCanvas.height = tH
      const tCtx = tCanvas.getContext('2d')
      if (tCtx) tCtx.drawImage(canvas, 0, 0, tW, tH)
      const thumbUrl = tCanvas.toDataURL('image/jpeg', 0.8)

      const originalName = payload.fileName.replace(/\.(heic|heif|png|jpg|jpeg)$/i, '')
      const downloadUrl = URL.createObjectURL(blob)

      setConvertedFiles((prev) => [
        ...prev,
        {
          originalName,
          convertedBlob: blob,
          downloadUrl,
          thumbUrl,
          finalQuality: payload.useTargetSize && payload.outputFormat === 'jpg' ? finalQuality : undefined,
          targetSize: payload.useTargetSize && payload.outputFormat === 'jpg' ? payload.targetSize : undefined,
          metadataOption,
          outputFormat: payload.outputFormat || 'jpg'
        }
      ])

      // Update progress and ZIP estimate
      setZipSizeEstimate((prev) => prev + blob.size)
      setConversionProgress((prev) => {
        const updatedProgress = { current: prev.current + 1, total: prev.total }
        
        // Check if all files are converted
        if (updatedProgress.current >= updatedProgress.total) {
          setIsConverting(false)
        }
        
        return updatedProgress
      })
    } catch (err) {
      console.error('HEIC fallback conversion failed:', err)
      toast({ title: 'HEIC Decode Failed', description: `Could not decode ${payload.fileName}.`, variant: 'destructive' })
      setConversionProgress((prev) => {
        const updatedProgress = { current: prev.current + 1, total: prev.total }
        
        // Check if all files are processed (including failed ones)
        if (updatedProgress.current >= updatedProgress.total) {
          setIsConverting(false)
        }
        
        return updatedProgress
      })
    }
  }

  // Create ZIP file and download
  const createAndDownloadZip = async () => {
    if (convertedFiles.length === 0) return

    setIsCreatingZip(true)

    try {
      // Lazy load JSZip
      const JSZip = (await import('jszip')).default
      const zip = new JSZip()

      // Add files to ZIP
      convertedFiles.forEach((file, index) => {
        const fileName = `${file.originalName}-converted.jpg`
        zip.file(fileName, file.convertedBlob)
      })

      // Generate ZIP
      const zipBlob = await zip.generateAsync({
        type: 'blob',
        compression: 'DEFLATE',
        compressionOptions: { level: 6 }
      })

      // Download ZIP
      const url = URL.createObjectURL(zipBlob)
      const link = document.createElement('a')
      link.href = url
      link.download = `converted-images-${new Date().toISOString().split('T')[0]}.zip`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

    } catch (error) {
      console.error('Failed to create ZIP:', error)
      toast({
        title: "ZIP Creation Failed",
        description: "Failed to create ZIP file. Please try downloading individual files.",
        variant: "destructive",
      })
    } finally {
      setIsCreatingZip(false)
    }

    // Show success toast
    toast({
      title: "ZIP Download Ready! 📦",
      description: `Downloaded ${convertedFiles.length} files as a ZIP archive.`,
    })
  }

  // Initialize worker on mount and clean up on unmount
  useEffect(() => {
    initializeWorker()

    return () => {
      if (worker) {
        worker.terminate()
      }
    }
  }, [])

  // Update worker message handler when dependencies change
  useEffect(() => {
    if (worker) {
      worker.onmessage = handleWorkerMessage
    }
  }, [worker, convertedFiles.length])

  const downloadFile = (convertedFile: ConvertedFile) => {
    const getFileExtension = (format: string) => {
      switch (format) {
        case 'png': return 'png'
        case 'pdf': return 'pdf'
        case 'jpg':
        default: return 'jpg'
      }
    }

    const link = document.createElement('a')
    link.href = convertedFile.downloadUrl
    link.download = `${convertedFile.originalName}.${getFileExtension(convertedFile.outputFormat)}`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const downloadAllFiles = () => {
    convertedFiles.forEach(file => downloadFile(file))
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 dark:from-gray-950 dark:via-gray-900 dark:to-blue-950">
      <ToolHeader />

      <main className="mx-auto max-w-md px-4 py-8">
        {/* Title Section */}
        <div className="mb-8 text-center">
          <h1 className="mb-3 text-3xl font-bold text-gray-900 dark:text-white">
            <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              HEIC to JPG
            </span>{" "}
            Converter (No Uploads)
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Convert HEIC, HEIF, JPG, and PNG images instantly. Works entirely in your browser with privacy-first processing.
          </p>

          {/* Privacy Copy */}
          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg dark:bg-blue-900/20 dark:border-blue-800">
            <div className="flex items-center gap-2 text-blue-800 dark:text-blue-200">
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
              </svg>
              <span className="text-sm font-medium">
                All conversions happen in your browser. Files never leave your device.
              </span>
            </div>
          </div>
        </div>

        {/* Drag & Drop Area */}
        <div className="mb-6">
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`relative cursor-pointer rounded-2xl border-2 border-dashed p-8 text-center transition-all duration-300 ease-in-out ${
              isDragging
                ? "border-blue-400 bg-blue-50 scale-105 shadow-lg dark:border-blue-600 dark:bg-blue-950/30"
                : "border-gray-300 bg-white/80 hover:border-blue-400 hover:bg-blue-50/50 hover:shadow-md dark:border-gray-600 dark:bg-gray-900/80 dark:hover:border-blue-600 dark:hover:bg-blue-950/30"
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept=".heic,.heif,.jpg,.jpeg,.png"
              onChange={handleFileSelect}
              className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
            />

            <div className="flex flex-col items-center gap-4">
              <div className={`flex h-16 w-16 items-center justify-center rounded-2xl transition-all duration-300 ${
                isDragging
                  ? "bg-blue-100 scale-110 shadow-lg dark:bg-blue-900/30"
                  : "bg-gray-100 dark:bg-gray-800"
              }`}>
                <svg
                  className={`h-8 w-8 transition-all duration-300 ${
                    isDragging
                      ? "text-blue-600 scale-110 dark:text-blue-400"
                      : "text-gray-600 dark:text-gray-400"
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                  />
                </svg>
              </div>

              <div>
                <p className="text-lg font-medium text-gray-900 dark:text-white">
                  {isDragging ? "Drop your image files here" : "Drag & drop image files"}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Supports HEIC, HEIF, JPG, JPEG, PNG • or click to browse
                </p>
              </div>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-2 text-sm font-semibold text-white transition-all hover:from-blue-700 hover:to-indigo-700 hover:shadow-lg"
              >
                Choose Files
              </button>
            </div>
          </div>
        </div>

        {/* Selected Files List */}
        {selectedFiles.length > 0 && (
          <div className="mb-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Selected Files ({selectedFiles.length})
              </h3>
              <div className="flex items-center gap-3">
                {selectedFiles.length > 15 && (
                  <button
                    onClick={() => setCompactView(!compactView)}
                    className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                  >
                    {compactView ? 'Detailed view' : 'Compact view'}
                  </button>
                )}
                <button
                  onClick={clearAllFiles}
                  className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                >
                  Clear all
                </button>
              </div>
            </div>

            {/* Show summary for large batches */}
            {selectedFiles.length > 10 && (
              <div className="mb-4 rounded-lg bg-blue-50/80 p-3 text-sm text-blue-800 dark:bg-blue-900/30 dark:text-blue-200">
                <div className="flex items-center gap-2">
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  <span>
                    Large batch: {selectedFiles.length} files • Total size: {(selectedFiles.reduce((sum, f) => sum + f.size, 0) / 1024 / 1024).toFixed(1)} MB
                    {selectedFiles.length > 20 && " • Processing may take a few moments"}
                  </span>
                </div>
              </div>
            )}

            <div className={`space-y-3 ${selectedFiles.length > 5 ? 'max-h-96 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 dark:scrollbar-thumb-gray-600 dark:scrollbar-track-gray-800' : ''}`}>
              {selectedFiles.map((file, index) => {
                const thumbnail = fileThumbnails.get(index)
                const metadata = fileMetadata.get(index)
                const isImage = file.type.startsWith('image/')

                return (
                  <div
                    key={index}
                    className={`flex items-center gap-4 rounded-xl border border-gray-200/60 bg-white/90 shadow-sm transition-all hover:shadow-md hover:border-gray-300/60 dark:border-gray-700/60 dark:bg-gray-900/90 dark:hover:border-gray-600/60 ${
                      compactView ? 'p-2' : 'p-4'
                    }`}
                  >
                    {/* Thumbnail or Icon */}
                    <div className={`relative flex items-center justify-center overflow-hidden rounded-lg border border-gray-200/50 bg-gray-50 dark:border-gray-700/50 dark:bg-gray-800/50 ${
                      compactView ? 'h-8 w-8' : 'h-12 w-12'
                    }`}>
                      {thumbnail ? (
                        <img
                          src={thumbnail}
                          alt={`Thumbnail of ${file.name}`}
                          className="h-full w-full object-cover"
                        />
                      ) : isImage ? (
                        <div className="flex h-6 w-6 items-center justify-center">
                          {getFileTypeIcon(file.name)}
                        </div>
                      ) : (
                        <div className="flex h-6 w-6 items-center justify-center">
                          {getFileTypeIcon(file.name)}
                        </div>
                      )}

                      {/* File type indicator */}
                      <div className="absolute -bottom-1 -right-1 rounded-full bg-gray-100 px-1.5 py-0.5 text-xs font-medium text-gray-600 dark:bg-gray-800 dark:text-gray-400">
                        {file.name.split('.').pop()?.toUpperCase()}
                      </div>
                    </div>

                    {/* File Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="truncate text-sm font-medium text-gray-900 dark:text-white">
                          {file.name}
                        </p>
                        {/* Info tooltip */}
                        {metadata && !compactView && (
                          <div className="group relative">
                            <svg 
                              className="h-4 w-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 cursor-help" 
                              fill="currentColor" 
                              viewBox="0 0 20 20"
                            >
                              <path 
                                fillRule="evenodd" 
                                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" 
                                clipRule="evenodd" 
                              />
                            </svg>
                            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 dark:bg-gray-700">
                              <div className="text-center">
                                <div>{metadata.width} × {metadata.height}px</div>
                                <div>Orientation: {metadata.orientationText}</div>
                              </div>
                              <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900 dark:border-t-gray-700"></div>
                            </div>
                          </div>
                        )}
                      </div>
                      {!compactView && (
                        <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                          <span>{(file.size / 1024 / 1024).toFixed(2)} MB</span>
                          <span>•</span>
                          <span>{file.type || 'Unknown type'}</span>
                          {metadata && metadata.width > 0 && (
                            <>
                              <span>•</span>
                              <span>{metadata.width} × {metadata.height}</span>
                            </>
                          )}
                        </div>
                      )}
                      {compactView && (
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {(file.size / 1024 / 1024).toFixed(1)} MB
                        </div>
                      )}
                    </div>

                    {/* Remove Button */}
                    <button
                      onClick={() => removeFile(index)}
                      className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/50 dark:hover:text-red-400"
                      aria-label={`Remove ${file.name}`}
                      title={`Remove ${file.name}`}
                    >
                      <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Output Format Selection */}
        {selectedFiles.length > 0 && (
          <div className="mb-6 rounded-2xl border border-gray-200/70 bg-white/90 p-6 shadow-sm backdrop-blur-sm dark:border-gray-700/60 dark:bg-gray-900/90">
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg">
                  <svg className="h-5 w-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                  Output Format
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  { 
                    value: 'jpg', 
                    label: 'JPG', 
                    description: 'Compressed, web-friendly',
                    icon: (
                      <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
                      </svg>
                    ),
                    gradient: 'from-emerald-500 to-green-600',
                    bgGradient: 'from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20',
                    borderColor: 'border-emerald-200 dark:border-emerald-700',
                    selectedBorder: 'border-emerald-500 dark:border-emerald-400',
                    textColor: 'text-emerald-700 dark:text-emerald-300'
                  },
                  { 
                    value: 'png', 
                    label: 'PNG', 
                    description: 'Lossless, high quality',
                    icon: (
                      <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
                      </svg>
                    ),
                    gradient: 'from-blue-500 to-indigo-600',
                    bgGradient: 'from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20',
                    borderColor: 'border-blue-200 dark:border-blue-700',
                    selectedBorder: 'border-blue-500 dark:border-blue-400',
                    textColor: 'text-blue-700 dark:text-blue-300'
                  },
                  { 
                    value: 'pdf', 
                    label: 'PDF', 
                    description: 'Single image per page',
                    icon: (
                      <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
                      </svg>
                    ),
                    gradient: 'from-red-500 to-rose-600',
                    bgGradient: 'from-red-50 to-rose-50 dark:from-red-900/20 dark:to-rose-900/20',
                    borderColor: 'border-red-200 dark:border-red-700',
                    selectedBorder: 'border-red-500 dark:border-red-400',
                    textColor: 'text-red-700 dark:text-red-300'
                  }
                ].map((format) => {
                  const isSelected = outputFormat === format.value
                  return (
                    <label 
                      key={format.value} 
                      className={`
                        relative flex flex-col items-center p-6 rounded-2xl border-2 transition-all duration-200 cursor-pointer
                        bg-gradient-to-br ${format.bgGradient}
                        ${isSelected 
                          ? `${format.selectedBorder} shadow-lg scale-105` 
                          : `${format.borderColor} hover:border-gray-300 dark:hover:border-gray-600 hover:shadow-md hover:scale-102`
                        }
                      `}
                    >
                      {/* Selection indicator */}
                      {isSelected && (
                        <div className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center shadow-lg">
                          <svg className="h-3 w-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}

                      <input
                        type="radio"
                        name="outputFormat"
                        value={format.value}
                        checked={isSelected}
                        onChange={(e) => setOutputFormat(e.target.value as 'jpg' | 'png' | 'pdf')}
                        className="sr-only"
                      />

                      {/* Icon */}
                      <div className={`h-12 w-12 rounded-xl bg-gradient-to-r ${format.gradient} flex items-center justify-center text-white shadow-lg mb-3`}>
                        {format.icon}
                      </div>

                      {/* Format name */}
                      <div className={`text-lg font-bold mb-1 ${format.textColor}`}>
                        {format.label}
                      </div>

                      {/* Description */}
                      <div className="text-sm text-gray-600 dark:text-gray-400 text-center leading-relaxed">
                        {format.description}
                      </div>

                      {/* Selection ring effect */}
                      {isSelected && (
                        <div className="absolute inset-0 rounded-2xl ring-4 ring-purple-500/20 dark:ring-purple-400/20" />
                      )}
                    </label>
                  )
                })}
              </div>
            </div>
          </div>
        )}

        {/* Quality Slider */}
        {selectedFiles.length > 0 && outputFormat !== 'png' && (
          <div className="mb-6 rounded-2xl border border-gray-200/70 bg-white/90 p-6 shadow-sm backdrop-blur-sm dark:border-gray-700/60 dark:bg-gray-900/90">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 flex items-center justify-center">
                    <svg className="h-4 w-4 text-blue-600 dark:text-blue-400" viewBox="0 0 20 20" fill="currentColor"><path d="M2 10a8 8 0 1116 0 8 8 0 01-16 0zm8-5a1 1 0 00-1 1v3.382l-1.447.724a1 1 0 10.894 1.788l2-1A1 1 0 0011 10V6a1 1 0 00-1-1z"/></svg>
                  </div>
                  <label htmlFor="quality-slider" className="text-sm font-semibold text-gray-900 dark:text-white">
                    JPG Quality
                  </label>
                </div>
                <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                  {jpgQuality}%
                </span>
              </div>

              <div className="relative">
                <input
                  id="quality-slider"
                  type="range"
                  min="1"
                  max="100"
                  value={jpgQuality}
                  onChange={(e) => setJpgQuality(parseInt(e.target.value))}
                  disabled={useTargetSize}
                  className={`w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 slider ${useTargetSize ? 'opacity-50 cursor-not-allowed' : ''}`}
                  style={{
                    background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${jpgQuality}%, #e5e7eb ${jpgQuality}%, #e5e7eb 100%)`
                  }}
                />
                <style jsx>{`
                  .slider::-webkit-slider-thumb {
                    appearance: none;
                    height: 20px;
                    width: 20px;
                    border-radius: 50%;
                    background: #3b82f6;
                    cursor: pointer;
                    border: 2px solid #ffffff;
                    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
                  }
                  .slider::-moz-range-thumb {
                    height: 20px;
                    width: 20px;
                    border-radius: 50%;
                    background: #3b82f6;
                    cursor: pointer;
                    border: 2px solid #ffffff;
                    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
                  }
                `}</style>
              </div>

              {!useTargetSize && (
                <>
                  <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                    <span>Lower quality (smaller file)</span>
                    <span>Higher quality (larger file)</span>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                    <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                    <span>
                      {jpgQuality >= 90 ? 'Excellent quality, larger files' :
                       jpgQuality >= 75 ? 'Good quality, balanced size' :
                       jpgQuality >= 50 ? 'Medium quality, smaller files' :
                       'Lower quality, smallest files'}
                    </span>
                  </div>
                </>
              )}

              {/* Target Size Toggle */}
              <div className="border-t border-gray-200/70 pt-4 dark:border-gray-700/60">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setUseTargetSize(!useTargetSize)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        useTargetSize ? 'bg-green-600' : 'bg-gray-200 dark:bg-gray-700'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          useTargetSize ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                    <label className="text-sm font-medium text-gray-900 dark:text-white">
                      Target size
                    </label>
                  </div>
                  {useTargetSize && (
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min="1"
                        max={targetSizeUnit === 'MB' ? 50 : 10000}
                        value={targetSize}
                        onChange={(e) => setTargetSize(Math.max(1, parseInt(e.target.value) || 1))}
                        className="w-16 rounded border border-gray-300 px-2 py-1 text-sm dark:border-gray-600 dark:bg-gray-800"
                      />
                      <select
                        value={targetSizeUnit}
                        onChange={(e) => setTargetSizeUnit(e.target.value as 'KB' | 'MB')}
                        className="rounded border border-gray-300 px-2 py-1 text-sm dark:border-gray-600 dark:bg-gray-800"
                      >
                        <option value="KB">KB</option>
                        <option value="MB">MB</option>
                      </select>
                    </div>
                  )}
                </div>

                {useTargetSize && (
                  <div className="mt-2 text-xs text-gray-600 dark:text-gray-400">
                    <div className="flex items-center gap-2">
                      <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                      </svg>
                      <span>
                        Quality will be automatically adjusted to reach ~{targetSize} {targetSizeUnit} (±10% tolerance)
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Metadata Options */}
              <div className="border-t border-gray-200/70 pt-4 dark:border-gray-700/60">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-gray-900 dark:text-white">
                      Metadata Handling
                    </label>
                  </div>

                  <div className="flex gap-3">
                    <label className="flex-1 flex items-center gap-3 p-3 rounded-lg border border-gray-200/60 bg-white/60 transition-all hover:border-gray-300/60 dark:border-gray-700/60 dark:bg-gray-900/60 cursor-pointer">
                      <input
                        type="radio"
                        name="metadata"
                        value="remove"
                        checked={metadataOption === 'remove'}
                        onChange={(e) => setMetadataOption(e.target.value as 'remove' | 'basic')}
                        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                      />
                      <div className="flex-1">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          Remove all metadata
                        </div>
                        <div className="text-xs text-gray-600 dark:text-gray-400">
                          Strip all EXIF, GPS, and other metadata (recommended for privacy)
                        </div>
                      </div>
                    </label>

                    <label className="flex-1 flex items-center gap-3 p-3 rounded-lg border border-gray-200/60 bg-white/60 transition-all hover:border-gray-300/60 dark:border-gray-700/60 dark:bg-gray-900/60 cursor-pointer">
                      <input
                        type="radio"
                        name="metadata"
                        value="basic"
                        checked={metadataOption === 'basic'}
                        onChange={(e) => setMetadataOption(e.target.value as 'remove' | 'basic')}
                        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                      />
                      <div className="flex-1">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          Keep basic metadata
                        </div>
                        <div className="text-xs text-gray-600 dark:text-gray-400">
                          Preserve date taken and orientation (smaller privacy impact)
                        </div>
                      </div>
                    </label>
                  </div>

                  <div className="text-xs text-gray-600 dark:text-gray-400">
                    <div className="flex items-center gap-2">
                      <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                      </svg>
                      <span>
                        {metadataOption === 'remove'
                          ? 'All metadata will be completely removed for maximum privacy'
                          : 'Only date taken and orientation will be preserved'
                        }
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Convert Button */}
        <div className="mb-6">
          <button
            onClick={async () => {
              setIsLoadingCodec(true)
              try {
                initializeWorker()
                await convertFilesWithWorker()
              } finally {
                setIsLoadingCodec(false)
              }
            }}
            disabled={selectedFiles.length === 0 || isConverting || isLoadingCodec}
            className={`w-full rounded-xl px-6 py-3 text-sm font-semibold transition-all ${
              selectedFiles.length === 0 || isConverting || isLoadingCodec
                ? "cursor-not-allowed bg-gray-300 text-gray-500 dark:bg-gray-700 dark:text-gray-400"
                : "bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:from-green-700 hover:to-emerald-700 hover:shadow-lg"
            }`}
          >
            {isConverting ? (
              <div className="flex items-center justify-center gap-2">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                <span>Converting... ({conversionProgress.current}/{conversionProgress.total})</span>
              </div>
            ) : isLoadingCodec ? (
              <div className="flex items-center justify-center gap-2">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                Loading codecs...
              </div>
            ) : selectedFiles.length === 0 ? (
              "Select image files to convert"
            ) : (
              `Convert ${selectedFiles.length} file${selectedFiles.length > 1 ? "s" : ""} to JPG`
            )}
          </button>

          {/* CPU Usage Tip for Large Batches */}
          {selectedFiles.length > 50 && (
            <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg dark:bg-amber-900/20 dark:border-amber-800">
              <div className="flex items-center gap-2">
                <svg className="h-4 w-4 text-amber-600 dark:text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <span className="text-sm text-amber-800 dark:text-amber-200">
                  Large batch detected! Processing may take a few moments and use significant CPU resources.
                  Consider processing in smaller batches for better performance.
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Converted Files List */}
        {convertedFiles.length > 0 && (
          <div className="mb-12">
            <div className="mb-4 rounded-2xl border border-gray-200/70 bg-white/80 dark:border-gray-700/60 dark:bg-gray-900/70 overflow-hidden">
              {/* Header Section */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200/50 dark:border-gray-700/50">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 flex items-center justify-center">
                    <svg className="h-4 w-4 text-green-600 dark:text-green-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Converted Files ({convertedFiles.length})
                    </h3>
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <span className="text-green-600 dark:text-green-400 font-medium">
                        {convertedFiles.length} files
                      </span>
                      <span>•</span>
                      <span>
                        {(convertedFiles.reduce((sum, file) => sum + file.convertedBlob.size, 0) / 1024 / 1024).toFixed(1)} MB total
                      </span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setConvertedFiles([])
                    setZipSizeEstimate(0)
                    toast({
                      title: "List Cleared",
                      description: "Converted files list has been cleared.",
                    })
                  }}
                  className="rounded-lg bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                  title="Clear all converted files"
                >
                  <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
              
              {/* Action Section */}
              <div className="px-4 py-3 bg-gray-50/50 dark:bg-gray-800/50">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {zipSizeEstimate > 0 && (
                      <span>ZIP size: <span className="font-medium">{(zipSizeEstimate / 1024 / 1024).toFixed(1)} MB</span></span>
                    )}
                  </div>
                  <button
                    onClick={createAndDownloadZip}
                    disabled={isCreatingZip}
                    className={`rounded-lg px-4 py-2 text-sm font-semibold transition-all ${
                      isCreatingZip
                        ? "cursor-not-allowed bg-blue-400/70 text-white dark:bg-blue-600/60"
                        : "bg-blue-600 text-white hover:bg-blue-700 hover:shadow-md dark:bg-blue-500 dark:hover:bg-blue-600"
                    }`}
                  >
                    {isCreatingZip ? (
                      <div className="flex items-center gap-2">
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                        Creating ZIP...
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        Download All (.zip)
                      </div>
                    )}
                  </button>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              {convertedFiles.map((convertedFile, index) => (
                <div
                  key={index}
                  className="flex items-center gap-4 rounded-xl border border-green-200/60 bg-green-50/50 p-4 shadow-sm transition-all hover:shadow-md hover:border-green-300/60 dark:border-green-700/60 dark:bg-green-900/20 dark:hover:border-green-600/60"
                >
                  {/* Thumbnail */}
                  <div className="relative flex h-12 w-12 items-center justify-center overflow-hidden rounded-lg border border-green-200/60 bg-white/60 dark:border-green-700/60 dark:bg-green-900/20">
                    {convertedFile.thumbUrl ? (
                      <img src={convertedFile.thumbUrl} alt="Converted thumbnail" className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-6 w-6 items-center justify-center">
                        <svg className="h-6 w-6 text-green-600 dark:text-green-400" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                  </div>

                  {/* File Info */}
                  <div className="flex-1 min-w-0">
                    <p className="truncate text-sm font-medium text-gray-900 dark:text-white">
                      {convertedFile.originalName}.{convertedFile.outputFormat === 'jpg' ? 'jpg' : convertedFile.outputFormat === 'png' ? 'png' : 'pdf'}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                      <span>{(convertedFile.convertedBlob.size / 1024 / 1024).toFixed(2)} MB</span>
                      <span>•</span>
                      <span>{convertedFile.outputFormat.toUpperCase()}</span>
                      {convertedFile.finalQuality && (
                        <>
                          <span>•</span>
                          <span>{convertedFile.finalQuality}% quality</span>
                        </>
                      )}
                      <span>•</span>
                      <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${
                        convertedFile.metadataOption === 'remove'
                          ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                          : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                      }`}>
                        {convertedFile.metadataOption === 'remove' ? 'No metadata' : 'Basic metadata'}
                      </span>
                      <span>•</span>
                      <span className="text-green-600 dark:text-green-400">Converted</span>
                    </div>
                    {convertedFile.targetSize && (
                      <div className="mt-1 text-xs text-blue-600 dark:text-blue-400">
                        Target: ~{convertedFile.targetSize} {targetSizeUnit}
                      </div>
                    )}
                  </div>

                  {/* Download Button */}
                  <button
                    onClick={() => downloadFile(convertedFile)}
                    className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600 text-white transition-colors hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
                    aria-label={`Download ${convertedFile.originalName}.${convertedFile.outputFormat === 'jpg' ? 'jpg' : convertedFile.outputFormat === 'png' ? 'png' : 'pdf'}`}
                    title={`Download ${convertedFile.originalName}.${convertedFile.outputFormat === 'jpg' ? 'jpg' : convertedFile.outputFormat === 'png' ? 'png' : 'pdf'}`}
                  >
                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}


        {/* Feedback Section */}
        <div className="mt-12">
          <FeedbackForm toolName="HEIC to JPG Converter" defaultCollapsed={true} />
        </div>
      </main>
    </div>
  )
}
