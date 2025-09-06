"use client"

import { useEffect, useRef, useState } from "react"
import ToolHeader from "@/components/ui/tool-header"
import FeedbackForm from "@/components/ui/feedback-form"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export default function ImageGrayscaleTool() {
  const [file, setFile] = useState<File | null>(null)
  const [src, setSrc] = useState<string>("")
  const [resultUrl, setResultUrl] = useState<string>("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [format, setFormat] = useState<"png" | "jpeg">("png")
  const [quality, setQuality] = useState<number>(92)

  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const imgRef = useRef<HTMLImageElement | null>(null)

  useEffect(() => {
    if (!file) {
      setSrc("")
      setResultUrl("")
      return
    }
    const url = URL.createObjectURL(file)
    setSrc(url)
    return () => URL.revokeObjectURL(url)
  }, [file])

  const handleFile = (f: File | null) => {
    if (!f) { setFile(null); return }
    if (!f.type.startsWith("image/")) {
      alert("Please select an image file.")
      return
    }
    // Warn for HEIC/HEIF which browsers typically can't decode
    if (/heic|heif/i.test(f.type) || /\.hei[cf]$/i.test(f.name)) {
      alert("HEIC/HEIF isn't supported by browsers for preview. Please use the HEIC Converter tool or export to JPG/PNG first.")
      return
    }
    setFile(f)
  }

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] ?? null
    handleFile(f)
  }

  const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    const f = e.dataTransfer.files?.[0]
    if (f) handleFile(f)
  }

  const onDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
  }

  const loadImage = (srcUrl: string) => new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image()
    img.decoding = "async"
    // crossOrigin is harmless for object URLs; keeps same code for future remote sources
    img.crossOrigin = "anonymous"
    img.onload = () => resolve(img)
    img.onerror = (e) => reject(e)
    img.src = srcUrl
  })

  const process = async () => {
    if (!src) return
    setIsProcessing(true)
    try {
      // Always load a fresh Image and wait for it to decode to avoid race conditions
      const imgEl = await loadImage(src)

      const w = imgEl.naturalWidth
      const h = imgEl.naturalHeight
      if (!w || !h) throw new Error("Image has zero dimensions (not decoded yet)")

      // Downscale very large images to avoid memory errors
      const MAX_PIXELS = 16_000_000 // ~16 MP, safe for most browsers
      let rw = w
      let rh = h
      if (w * h > MAX_PIXELS) {
        const scale = Math.sqrt(MAX_PIXELS / (w * h))
        rw = Math.max(1, Math.round(w * scale))
        rh = Math.max(1, Math.round(h * scale))
      }

      const canvas = canvasRef.current || document.createElement("canvas")
      const ctx = canvas.getContext("2d")
      if (!ctx) return
      canvas.width = rw
      canvas.height = rh
      ctx.clearRect(0, 0, rw, rh)
      ctx.drawImage(imgEl, 0, 0, rw, rh)

      // Grayscale using luminance coefficients (sRGB Rec. 709)
      const imageData = ctx.getImageData(0, 0, rw, rh)
      const data = imageData.data
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i]
        const g = data[i + 1]
        const b = data[i + 2]
        const y = Math.round(0.2126 * r + 0.7152 * g + 0.0722 * b)
        data[i] = y
        data[i + 1] = y
        data[i + 2] = y
      }
      ctx.putImageData(imageData, 0, 0)

      const mime = format === "png" ? "image/png" : "image/jpeg"
      const q = format === "jpeg" ? Math.max(0.1, Math.min(1, quality / 100)) : undefined
      const url = canvas.toDataURL(mime, q)
      setResultUrl(url)
    } catch (e) {
      console.warn("Failed to convert image", e)
      setResultUrl("")
      alert("Failed to convert image. Please try a different file.")
    } finally {
      setIsProcessing(false)
    }
  }

  useEffect(() => {
    // Auto-process when a new image is selected
    if (src) {
      void process()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [src, format, quality])

  const download = () => {
    if (!resultUrl) return
    const a = document.createElement("a")
    const base = file?.name?.replace(/\.[^.]+$/, "") || "image"
    a.href = resultUrl
    a.download = `${base}-grayscale.${format === "png" ? "png" : "jpg"}`
    document.body.appendChild(a)
    a.click()
    a.remove()
  }

  return (
    <main>
      <ToolHeader />

      <div className="mx-auto max-w-5xl px-4">
        <nav aria-label="Breadcrumb" className="mb-4 text-sm text-gray-600 dark:text-gray-400">
          <a href="/" className="hover:underline">Home</a>
          <span className="mx-1">/</span>
          <a href="/tools" className="hover:underline">Tools</a>
          <span className="mx-1">/</span>
          <span aria-current="page">Image to Black & White</span>
        </nav>
        <div className="mb-8 text-center">
          <div className="inline-flex items-center gap-3 rounded-2xl bg-gradient-to-r from-gray-50 to-blue-50 px-6 py-3 dark:from-gray-800 dark:to-blue-900/30">
            <span className="text-2xl">🎨</span>
            <div className="text-left">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Image to Black & White</h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">Convert any image to crisp black & white (grayscale) — all in your browser, no uploads.</p>
            </div>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-5">
          {/* Left column: inputs */}
          <div className="md:col-span-2 space-y-4">
            <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900">
              <label className="mb-2 block text-sm font-medium">Upload image</label>
              <div
                onDrop={onDrop}
                onDragOver={onDragOver}
                className="flex cursor-pointer flex-col items-center justify-center gap-3 rounded-md border border-dashed border-gray-300 bg-gray-50 p-6 text-center text-sm text-gray-600 transition-colors hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-300 dark:hover:bg-gray-900"
                onClick={() => document.getElementById("file-input")?.click()}
              >
                <svg className="h-8 w-8 text-gray-400" fill="currentColor" viewBox="0 0 20 20"><path d="M4 3a2 2 0 00-2 2v6a2 2 0 002 2h3l2 3 2-3h3a2 2 0 002-2V5a2 2 0 00-2-2H4z"/></svg>
                <div><span className="font-medium text-gray-900 dark:text-white">Click to upload</span> or drag and drop</div>
                <div className="text-xs text-gray-500">PNG, JPG, JPEG, WEBP up to ~20MB</div>
                <Input id="file-input" className="hidden" type="file" accept="image/*" onChange={onFileChange} />
              </div>
              {file && (
                <div className="mt-3 text-xs text-gray-600 dark:text-gray-400">Selected: {file.name}</div>
              )}
            </div>

            <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900">
              <h3 className="mb-3 text-sm font-medium">Output</h3>
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs text-gray-500">Format</label>
                  <div className="flex gap-2">
                    <button onClick={() => setFormat("png")} className={`rounded-md px-3 py-1.5 text-sm border ${format==='png' ? 'bg-blue-600 text-white border-blue-600' : 'border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300'}`}>PNG</button>
                    <button onClick={() => setFormat("jpeg")} className={`rounded-md px-3 py-1.5 text-sm border ${format==='jpeg' ? 'bg-blue-600 text-white border-blue-600' : 'border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300'}`}>JPG</button>
                  </div>
                </div>
                {format === "jpeg" && (
                  <div>
                    <label className="mb-1 block text-xs text-gray-500">JPG quality</label>
                    <div className="flex items-center gap-2">
                      <input className="flex-1" type="range" min={50} max={100} step={1} value={quality} onChange={(e) => setQuality(parseInt(e.target.value))} />
                      <Input className="w-16" type="number" min={50} max={100} step={1} value={quality} onChange={(e) => setQuality(Math.max(50, Math.min(100, parseInt(e.target.value || '0'))))} />
                      <span className="text-xs text-gray-500">%</span>
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-4 flex items-center gap-2">
                <Button onClick={process} disabled={!src || isProcessing}>{isProcessing ? "Converting..." : "Convert to B&W"}</Button>
                <Button variant="outline" onClick={download} disabled={!resultUrl}>Download</Button>
              </div>
            </div>
          </div>

          {/* Right column: preview */}
          <div className="md:col-span-3 space-y-4">
            <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900">
              <h3 className="mb-3 text-sm font-medium">Preview</h3>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <div className="mb-2 text-xs text-gray-500">Original</div>
                  <div className="flex min-h-[220px] items-center justify-center overflow-hidden rounded-md border border-dashed border-gray-300 bg-gray-50 p-2 dark:border-gray-700 dark:bg-gray-950">
                    {src ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img ref={imgRef as any} src={src} alt="Original image" loading="lazy" decoding="async" className="max-h-[360px] w-auto max-w-full object-contain" />
                    ) : (
                      <div className="text-sm text-gray-500">Upload an image to preview</div>
                    )}
                  </div>
                </div>
                <div>
                  <div className="mb-2 text-xs text-gray-500">Black & White</div>
                  <div className="flex min-h-[220px] items-center justify-center overflow-hidden rounded-md border border-dashed border-gray-300 bg-gray-50 p-2 dark:border-gray-700 dark:bg-gray-950">
                    {resultUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={resultUrl} alt="Grayscale result" loading="lazy" decoding="async" className="max-h-[360px] w-auto max-w-full object-contain" />
                    ) : (
                      <div className="text-sm text-gray-500">Converted image will appear here</div>
                    )}
                  </div>
                </div>
              </div>
              <canvas ref={canvasRef} className="hidden" aria-hidden="true" />
            </div>

            <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900">
              <h3 className="mb-2 text-sm font-medium">Tips</h3>
              <ul className="list-disc pl-5 text-sm text-gray-600 dark:text-gray-300">
                <li>All processing happens locally in your browser — images are never uploaded.</li>
                <li>PNG preserves transparency; JPG produces smaller files with adjustable quality.</li>
                <li>Very large images may be auto‑downscaled to avoid browser memory limits.</li>
                <li>For strict black/white (no grays), apply thresholding in a future update.</li>
              </ul>
            </div>
          </div>
        </div>

        <section className="mt-8 rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <h2 className="mb-3 text-base font-semibold">FAQs</h2>
          <div className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
            <details>
              <summary className="cursor-pointer font-medium">Is this grayscale converter private?</summary>
              <div className="mt-1">Yes. All processing happens locally in your browser — your images never leave your device.</div>
            </details>
            <details>
              <summary className="cursor-pointer font-medium">What formats are supported?</summary>
              <div className="mt-1">Upload PNG, JPG/JPEG, or WebP. Export to PNG (lossless) or JPG (smaller, adjustable quality).</div>
            </details>
            <details>
              <summary className="cursor-pointer font-medium">Will my image quality change?</summary>
              <div className="mt-1">PNG preserves original quality. JPG lets you choose a quality level (50–100%) for smaller files.</div>
            </details>
            <details>
              <summary className="cursor-pointer font-medium">Can I get pure black and white (no gray)?</summary>
              <div className="mt-1">This tool uses perceptual grayscale. A threshold option for true black/white is planned.</div>
            </details>
          </div>
        </section>

        <div className="mt-10">
          <FeedbackForm toolName="Image to Black & White" />
        </div>
      </div>
    </main>
  )
}
