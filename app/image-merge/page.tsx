"use client"

import { useEffect, useRef, useState } from "react"
import ToolHeader from "@/components/ui/tool-header"
import FeedbackForm from "@/components/ui/feedback-form"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import CropCanvas, { type CropRect } from "@/components/CropCanvas"

export default function ImageMergeTool() {
  const [fileA, setFileA] = useState<File | null>(null)
  const [fileB, setFileB] = useState<File | null>(null)
  const [srcA, setSrcA] = useState<string>("")
  const [srcB, setSrcB] = useState<string>("")
  const [cropA, setCropA] = useState<CropRect | null>(null)
  const [cropB, setCropB] = useState<CropRect | null>(null)
  const [format, setFormat] = useState<"png" | "jpeg">("png")
  const [quality, setQuality] = useState<number>(92)
  const [outputHeight, setOutputHeight] = useState<number>(800)
  const [gutter, setGutter] = useState<number>(0)
  const [bg, setBg] = useState<string>("#ffffff")
  const [swap, setSwap] = useState<boolean>(false)
  const [resultUrl, setResultUrl] = useState<string>("")
  const [isProcessing, setIsProcessing] = useState(false)

  const resultCanvasRef = useRef<HTMLCanvasElement | null>(null)

  useEffect(() => {
    if (!fileA) { setSrcA(""); return }
    const url = URL.createObjectURL(fileA)
    setSrcA(url)
    return () => URL.revokeObjectURL(url)
  }, [fileA])

  useEffect(() => {
    if (!fileB) { setSrcB(""); return }
    const url = URL.createObjectURL(fileB)
    setSrcB(url)
    return () => URL.revokeObjectURL(url)
  }, [fileB])

  const handleFile = (setter: (f: File | null) => void) => (f: File | null) => {
    if (!f) { setter(null); return }
    if (!f.type.startsWith("image/")) { alert("Please select an image file."); return }
    if (/heic|heif/i.test(f.type) || /\.hei[cf]$/i.test(f.name)) {
      alert("HEIC/HEIF isn't supported for preview. Use the HEIC Converter tool first.")
      return
    }
    setter(f)
  }

  const onDrop = (setter: (f: File | null) => void) => (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    const f = e.dataTransfer.files?.[0]
    if (f) handleFile(setter)(f)
  }
  const onDragOver = (e: React.DragEvent<HTMLDivElement>) => e.preventDefault()

  const loadImage = (srcUrl: string) => new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image()
    img.decoding = "async"
    img.crossOrigin = "anonymous"
    img.onload = () => resolve(img)
    img.onerror = (e) => reject(e)
    img.src = srcUrl
  })

  const merge = async () => {
    if (!srcA || !srcB || !cropA || !cropB) return
    setIsProcessing(true)
    try {
      const [imgA, imgB] = await Promise.all([loadImage(srcA), loadImage(srcB)])

      const h = Math.max(50, Math.min(4000, Math.round(outputHeight)))
      const wA = Math.max(1, Math.round((cropA.w / cropA.h) * h))
      const wB = Math.max(1, Math.round((cropB.w / cropB.h) * h))
      const g = Math.max(0, Math.round(gutter))
      const canvas = resultCanvasRef.current || document.createElement("canvas")
      const ctx = canvas.getContext("2d")
      if (!ctx) return
      canvas.width = wA + g + wB
      canvas.height = h
      // fill background
      ctx.fillStyle = bg
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      ctx.imageSmoothingEnabled = true
      ctx.imageSmoothingQuality = "high"

      if (!swap) {
        // draw A then B
        ctx.drawImage(
          imgA,
          Math.round(cropA.x),
          Math.round(cropA.y),
          Math.round(cropA.w),
          Math.round(cropA.h),
          0,
          0,
          wA,
          h
        )
        ctx.drawImage(
          imgB,
          Math.round(cropB.x),
          Math.round(cropB.y),
          Math.round(cropB.w),
          Math.round(cropB.h),
          wA + g,
          0,
          wB,
          h
        )
      } else {
        // draw B then A (swap sides)
        ctx.drawImage(
          imgB,
          Math.round(cropB.x),
          Math.round(cropB.y),
          Math.round(cropB.w),
          Math.round(cropB.h),
          0,
          0,
          wB,
          h
        )
        ctx.drawImage(
          imgA,
          Math.round(cropA.x),
          Math.round(cropA.y),
          Math.round(cropA.w),
          Math.round(cropA.h),
          wB + g,
          0,
          wA,
          h
        )
      }

      const mime = format === "png" ? "image/png" : "image/jpeg"
      const q = format === "jpeg" ? Math.max(0.1, Math.min(1, quality / 100)) : undefined
      const url = canvas.toDataURL(mime, q)
      setResultUrl(url)
    } catch (e) {
      console.warn("Failed to merge", e)
      alert("Failed to merge images. Try smaller images or different crops.")
      setResultUrl("")
    } finally {
      setIsProcessing(false)
    }
  }

  useEffect(() => {
    if (srcA && srcB && cropA && cropB) {
      void merge()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [srcA, srcB, cropA, cropB, outputHeight, gutter, bg, format, quality])

  const download = () => {
    if (!resultUrl) return
    const a = document.createElement("a")
    const baseA = fileA?.name?.replace(/\.[^.]+$/, "") || "imageA"
    const baseB = fileB?.name?.replace(/\.[^.]+$/, "") || "imageB"
    a.href = resultUrl
    a.download = `${baseA}-${baseB}-merged.${format === "png" ? "png" : "jpg"}`
    document.body.appendChild(a)
    a.click()
    a.remove()
  }

  return (
    <main>
      <ToolHeader />
      <div className="mx-auto max-w-6xl px-4">
        <nav aria-label="Breadcrumb" className="mb-4 text-sm text-gray-600 dark:text-gray-400">
          <a href="/" className="hover:underline">Home</a>
          <span className="mx-1">/</span>
          <a href="/tools" className="hover:underline">Tools</a>
          <span className="mx-1">/</span>
          <span aria-current="page">Image Merge (Side-by-Side)</span>
        </nav>

        <div className="mb-8 text-center">
          <div className="inline-flex items-center gap-3 rounded-2xl bg-gradient-to-r from-gray-50 to-blue-50 px-6 py-3 dark:from-gray-800 dark:to-blue-900/30">
            <span className="text-2xl">🧩</span>
            <div className="text-left">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Merge Two Images Side-by-Side</h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">Upload two images, adjust crops by dragging, and export a perfectly aligned side-by-side image — all locally.</p>
            </div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Left: Image A */}
          <div className="space-y-4">
            <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900">
              <label className="mb-2 block text-sm font-medium">Image A</label>
              <div
                onDrop={onDrop(setFileA)}
                onDragOver={onDragOver}
                className="flex cursor-pointer flex-col items-center justify-center gap-3 rounded-md border border-dashed border-gray-300 bg-gray-50 p-6 text-center text-sm text-gray-600 transition-colors hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-300 dark:hover:bg-gray-900"
                onClick={() => document.getElementById("file-a")?.click()}
              >
                <svg className="h-8 w-8 text-gray-400" fill="currentColor" viewBox="0 0 20 20"><path d="M4 3a2 2 0 00-2 2v6a2 2 0 002 2h3l2 3 2-3h3a2 2 0 002-2V5a2 2 0 00-2-2H4z"/></svg>
                <div><span className="font-medium text-gray-900 dark:text-white">Click to upload</span> or drag and drop</div>
                <div className="text-xs text-gray-500">PNG, JPG, JPEG, WEBP up to ~20MB</div>
                <Input id="file-a" className="hidden" type="file" accept="image/*" onChange={(e) => handleFile(setFileA)(e.target.files?.[0] ?? null)} />
              </div>
              {fileA && <div className="mt-3 text-xs text-gray-600 dark:text-gray-400">Selected: {fileA.name}</div>}
            </div>
            <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900">
              <h3 className="mb-2 text-sm font-medium">Crop & Align (A)</h3>
              {srcA ? (
                <CropCanvas src={srcA} onCropChange={setCropA} />
              ) : (
                <div className="flex h-[360px] items-center justify-center rounded-md border border-dashed border-gray-300 bg-gray-50 text-sm text-gray-500 dark:border-gray-700 dark:bg-gray-950">Upload Image A to start</div>
              )}
            </div>
          </div>

          {/* Right: Image B and result */}
          <div className="space-y-4">
            <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900">
              <label className="mb-2 block text-sm font-medium">Image B</label>
              <div
                onDrop={onDrop(setFileB)}
                onDragOver={onDragOver}
                className="flex cursor-pointer flex-col items-center justify-center gap-3 rounded-md border border-dashed border-gray-300 bg-gray-50 p-6 text-center text-sm text-gray-600 transition-colors hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-300 dark:hover:bg-gray-900"
                onClick={() => document.getElementById("file-b")?.click()}
              >
                <svg className="h-8 w-8 text-gray-400" fill="currentColor" viewBox="0 0 20 20"><path d="M4 3a2 2 0 00-2 2v6a2 2 0 002 2h3l2 3 2-3h3a2 2 0 002-2V5a2 2 0 00-2-2H4z"/></svg>
                <div><span className="font-medium text-gray-900 dark:text-white">Click to upload</span> or drag and drop</div>
                <div className="text-xs text-gray-500">PNG, JPG, JPEG, WEBP up to ~20MB</div>
                <Input id="file-b" className="hidden" type="file" accept="image/*" onChange={(e) => handleFile(setFileB)(e.target.files?.[0] ?? null)} />
              </div>
              {fileB && <div className="mt-3 text-xs text-gray-600 dark:text-gray-400">Selected: {fileB.name}</div>}
            </div>

            <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900">
              <h3 className="mb-2 text-sm font-medium">Crop & Align (B)</h3>
              {srcB ? (
                <CropCanvas src={srcB} onCropChange={setCropB} />
              ) : (
                <div className="flex h-[360px] items-center justify-center rounded-md border border-dashed border-gray-300 bg-gray-50 text-sm text-gray-500 dark:border-gray-700 dark:bg-gray-950">Upload Image B to start</div>
              )}
            </div>
          </div>
        </div>

        {/* Output controls and preview */}
        <div className="mt-8 grid gap-6 lg:grid-cols-3">
          <div className="space-y-4 lg:col-span-1">
            <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900">
              <h3 className="mb-3 text-sm font-medium">Output</h3>
              <div className="grid gap-3">
                <div>
                  <label className="mb-1 block text-xs text-gray-500">Format</label>
                  <div className="flex gap-2">
                    <button onClick={() => setFormat("png")} className={`rounded-md px-3 py-1.5 text-sm border ${format==='png' ? 'bg-blue-600 text-white border-blue-600' : 'border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300'}`}>PNG</button>
                    <button onClick={() => setFormat("jpeg")} className={`rounded-md px-3 py-1.5 text-sm border ${format==='jpeg' ? 'bg-blue-600 text-white border-blue-600' : 'border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300'}`}>JPG</button>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <input id="swap" type="checkbox" checked={swap} onChange={(e) => setSwap(e.target.checked)} />
                  <label htmlFor="swap" className="text-sm">Swap left/right</label>
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
                <div>
                  <label className="mb-1 block text-xs text-gray-500">Output height (px)</label>
                  <div className="flex items-center gap-2">
                    <input className="flex-1" type="range" min={200} max={2000} step={10} value={outputHeight} onChange={(e) => setOutputHeight(parseInt(e.target.value))} />
                    <Input className="w-20" type="number" min={100} max={4000} step={10} value={outputHeight} onChange={(e) => setOutputHeight(Math.max(100, Math.min(4000, parseInt(e.target.value || '0'))))} />
                  </div>
                </div>
                <div>
                  <label className="mb-1 block text-xs text-gray-500">Gutter (space between, px)</label>
                  <div className="flex items-center gap-2">
                    <input className="flex-1" type="range" min={0} max={200} step={1} value={gutter} onChange={(e) => setGutter(parseInt(e.target.value))} />
                    <Input className="w-20" type="number" min={0} max={500} step={1} value={gutter} onChange={(e) => setGutter(Math.max(0, Math.min(500, parseInt(e.target.value || '0'))))} />
                  </div>
                </div>
                <div>
                  <label className="mb-1 block text-xs text-gray-500">Background</label>
                  <div className="flex items-center gap-2">
                    <input type="color" value={bg} onChange={(e) => setBg(e.target.value)} />
                    <Input className="w-36" type="text" value={bg} onChange={(e) => setBg(e.target.value)} />
                  </div>
                </div>
              </div>
              <div className="mt-4 flex items-center gap-2">
                <Button onClick={merge} disabled={!srcA || !srcB || !cropA || !cropB || isProcessing}>{isProcessing ? "Merging..." : "Merge Images"}</Button>
                <Button variant="outline" onClick={download} disabled={!resultUrl}>Download</Button>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900">
              <h3 className="mb-3 text-sm font-medium">Preview</h3>
              <div className="flex min-h-[220px] items-center justify-center overflow-hidden rounded-md border border-dashed border-gray-300 bg-gray-50 p-2 dark:border-gray-700 dark:bg-gray-950">
                {resultUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={resultUrl} alt="Merged result" loading="lazy" decoding="async" className="max-h-[480px] w-auto max-w-full object-contain" />
                ) : (
                  <div className="text-sm text-gray-500">Merged image will appear here</div>
                )}
              </div>
              <canvas ref={resultCanvasRef} className="hidden" aria-hidden="true" />
            </div>
          </div>
        </div>

        <section className="mt-8 rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <h2 className="mb-3 text-base font-semibold">Tips</h2>
          <ul className="list-disc pl-5 text-sm text-gray-600 dark:text-gray-300">
            <li>Drag the corners or edges of the crop box to adjust each image manually.</li>
            <li>Use the output height slider to scale both crops to the same height.</li>
            <li>Increase the gutter to add spacing between the two images.</li>
            <li>All processing happens locally in your browser — nothing is uploaded.</li>
          </ul>
        </section>

        <div className="mt-10">
          <FeedbackForm toolName="Image Merge (Side-by-Side)" />
        </div>
      </div>
    </main>
  )
}
