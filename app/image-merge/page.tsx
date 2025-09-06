"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import ToolHeader from "@/components/ui/tool-header"
import FeedbackForm from "@/components/ui/feedback-form"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

type Orientation = "horizontal" | "vertical"
type VAlign = "top" | "center" | "bottom" // for horizontal merge
type HAlign = "left" | "center" | "right" // for vertical merge
type AutoScale = "none" | "match-height" | "match-width"

export default function ImageMergeTool() {
  const [fileA, setFileA] = useState<File | null>(null)
  const [fileB, setFileB] = useState<File | null>(null)
  const [srcA, setSrcA] = useState<string>("")
  const [srcB, setSrcB] = useState<string>("")
  const [orientation, setOrientation] = useState<Orientation>("horizontal")
  const [verticalAlign, setVerticalAlign] = useState<VAlign>("center")
  const [horizontalAlign, setHorizontalAlign] = useState<HAlign>("center")
  const [secondFirst, setSecondFirst] = useState(false)
  const [autoScale, setAutoScale] = useState<AutoScale>("none")
  const [scaleA, setScaleA] = useState<number>(100)
  const [scaleB, setScaleB] = useState<number>(100)
  const [offsetA, setOffsetA] = useState<number>(0) // cross-axis offset
  const [offsetB, setOffsetB] = useState<number>(0)
  const [activeImage, setActiveImage] = useState<'A' | 'B'>('A')
  const [resultUrl, setResultUrl] = useState<string>("")
  const [isMerging, setIsMerging] = useState(false)
  const [previewZoom, setPreviewZoom] = useState<number>(100)
  const [snapCenter, setSnapCenter] = useState<boolean>(true)
  const [snapEdges, setSnapEdges] = useState<boolean>(true)
  const [snapThreshold, setSnapThreshold] = useState<number>(6)

  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const containerRef = useRef<HTMLDivElement | null>(null)

  const [layout, setLayout] = useState<
    | null
    | {
        orientation: Orientation
        canvasW: number
        canvasH: number
        first: { x: number; y: number; w: number; h: number }
        second: { x: number; y: number; w: number; h: number }
        baseA: number // base cross-axis position before offset and shift
        baseB: number
        shift: number // shift applied to avoid clipping (e.g., -minTop or -minLeft)
      }
  >(null)

  const [dragging, setDragging] = useState<null | { target: 'A' | 'B'; startX: number; startY: number; startOffset: number }>(null)

  useEffect(() => {
    if (fileA) {
      const url = URL.createObjectURL(fileA)
      setSrcA(url)
      return () => URL.revokeObjectURL(url)
    } else {
      setSrcA("")
    }
  }, [fileA])

  useEffect(() => {
    if (fileB) {
      const url = URL.createObjectURL(fileB)
      setSrcB(url)
      return () => URL.revokeObjectURL(url)
    } else {
      setSrcB("")
    }
  }, [fileB])

  const canMerge = useMemo(() => !!(srcA && srcB), [srcA, srcB])

  const loadImage = (src: string) =>
    new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image()
      img.onload = () => resolve(img)
      img.onerror = reject
      img.src = src
    })

  const doMerge = async () => {
    if (!canMerge || isMerging) return
    setIsMerging(true)
    try {
      const [img1, img2] = await Promise.all([loadImage(srcA), loadImage(srcB)])

      const first = secondFirst ? img2 : img1
      const second = secondFirst ? img1 : img2

      const canvas = canvasRef.current || document.createElement("canvas")
      const ctx = canvas.getContext("2d")
      if (!ctx) return

      // Apply per-image user scale first
      const fW0 = first.naturalWidth, fH0 = first.naturalHeight
      const sW0 = second.naturalWidth, sH0 = second.naturalHeight
      let fW = Math.max(1, Math.round(fW0 * (scaleA / 100)))
      let fH = Math.max(1, Math.round(fH0 * (scaleA / 100)))
      let sW = Math.max(1, Math.round(sW0 * (scaleB / 100)))
      let sH = Math.max(1, Math.round(sH0 * (scaleB / 100)))

      // Auto-scale to match dimension if requested
      if (autoScale === "match-height") {
        const targetH = Math.max(fH, sH)
        const fMul = targetH / fH
        const sMul = targetH / sH
        fH = Math.round(fH * fMul); fW = Math.round(fW * fMul)
        sH = Math.round(sH * sMul); sW = Math.round(sW * sMul)
      } else if (autoScale === "match-width") {
        const targetW = Math.max(fW, sW)
        const fMul = targetW / fW
        const sMul = targetW / sW
        fW = Math.round(fW * fMul); fH = Math.round(fH * fMul)
        sW = Math.round(sW * sMul); sH = Math.round(sH * sMul)
      }

      if (orientation === "horizontal") {
        const totalW = fW + sW
        const baseH = Math.max(fH, sH)

        let y1 = verticalAlign === "top" ? 0 : verticalAlign === "bottom" ? baseH - fH : Math.round((baseH - fH) / 2)
        let y2 = verticalAlign === "top" ? 0 : verticalAlign === "bottom" ? baseH - sH : Math.round((baseH - sH) / 2)

        // Apply user offsets (vertical)
        y1 += offsetA
        y2 += offsetB

        const minTop = Math.min(0, y1, y2)
        const maxBottom = Math.max(baseH, y1 + fH, y2 + sH)
        const totalH = maxBottom - minTop

        canvas.width = totalW
        canvas.height = totalH
        ctx.clearRect(0, 0, totalW, totalH)

        ctx.drawImage(first, 0, y1 - minTop, fW, fH)
        ctx.drawImage(second, fW, y2 - minTop, sW, sH)

        setLayout({
          orientation: 'horizontal',
          canvasW: totalW,
          canvasH: totalH,
          first: { x: 0, y: y1 - minTop, w: fW, h: fH },
          second: { x: fW, y: y2 - minTop, w: sW, h: sH },
          baseA: y1 - offsetA - minTop, // reverse offset and shift
          baseB: y2 - offsetB - minTop,
          shift: -minTop,
        })
      } else {
        const baseW = Math.max(fW, sW)
        const totalH = fH + sH

        let x1 = horizontalAlign === "left" ? 0 : horizontalAlign === "right" ? baseW - fW : Math.round((baseW - fW) / 2)
        let x2 = horizontalAlign === "left" ? 0 : horizontalAlign === "right" ? baseW - sW : Math.round((baseW - sW) / 2)

        // Apply user offsets (horizontal)
        x1 += offsetA
        x2 += offsetB

        const minLeft = Math.min(0, x1, x2)
        const maxRight = Math.max(baseW, x1 + fW, x2 + sW)
        const totalW = maxRight - minLeft

        canvas.width = totalW
        canvas.height = totalH
        ctx.clearRect(0, 0, totalW, totalH)

        ctx.drawImage(first, x1 - minLeft, 0, fW, fH)
        ctx.drawImage(second, x2 - minLeft, fH, sW, sH)

        setLayout({
          orientation: 'vertical',
          canvasW: totalW,
          canvasH: totalH,
          first: { x: x1 - minLeft, y: 0, w: fW, h: fH },
          second: { x: x2 - minLeft, y: fH, w: sW, h: sH },
          baseA: x1 - offsetA - minLeft,
          baseB: x2 - offsetB - minLeft,
          shift: -minLeft,
        })
      }

      const dataUrl = canvas.toDataURL("image/png")
      setResultUrl(dataUrl)
    } catch (e) {
      console.warn("Failed to merge images", e)
      setResultUrl("")
    } finally {
      setIsMerging(false)
    }
  }

  useEffect(() => {
    // Auto-merge when inputs or options change
    if (canMerge) {
      void doMerge()
    } else {
      setResultUrl("")
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [srcA, srcB, orientation, verticalAlign, horizontalAlign, secondFirst, autoScale, scaleA, scaleB, offsetA, offsetB])

  // Drag to fine-tune offsets (cross-axis only for now)
  const getMousePos = (e: React.MouseEvent) => {
    const rect = canvasRef.current?.getBoundingClientRect()
    if (!rect) return { x: 0, y: 0 }
    const scale = previewZoom / 100
    return {
      x: (e.clientX - rect.left) / scale,
      y: (e.clientY - rect.top) / scale,
    }
  }

  const onMouseDown = (e: React.MouseEvent) => {
    if (!layout) return
    const pos = getMousePos(e)
    const inFirst = pos.x >= layout.first.x && pos.x <= layout.first.x + layout.first.w && pos.y >= layout.first.y && pos.y <= layout.first.y + layout.first.h
    const inSecond = pos.x >= layout.second.x && pos.x <= layout.second.x + layout.second.w && pos.y >= layout.second.y && pos.y <= layout.second.y + layout.second.h
    const target = inSecond ? 'B' : inFirst ? 'A' : null
    if (!target) return

    setActiveImage(target)
    setDragging({ target, startX: pos.x, startY: pos.y, startOffset: target === 'A' ? offsetA : offsetB })
  }

  const applySnappingAbs = (
    proposedOffset: number,
    params: { selfBase: number; selfSize: number; otherBase: number; otherSize: number }
  ) => {
    let value = proposedOffset
    const thr = snapThreshold
    const selfPos = params.selfBase + value
    const otherPos = params.otherBase + (/* other offset already included in base param */ 0)
    if (snapEdges) {
      // start align
      if (Math.abs(selfPos - otherPos) <= thr) value = params.otherBase - params.selfBase
      // end align
      const selfEnd = params.selfBase + params.selfSize + value
      const otherEnd = params.otherBase + params.otherSize
      if (Math.abs(selfEnd - otherEnd) <= thr) value = (params.otherBase + params.otherSize) - (params.selfBase + params.selfSize)
    }
    if (snapCenter) {
      const selfC = params.selfBase + params.selfSize / 2 + value
      const otherC = params.otherBase + params.otherSize / 2
      if (Math.abs(selfC - otherC) <= thr) value = (params.otherBase + params.otherSize / 2) - (params.selfBase + params.selfSize / 2)
    }
    return value
  }

  const onMouseMove = (e: React.MouseEvent) => {
    if (!dragging || !layout) return
    const pos = getMousePos(e)
    const deltaY = pos.y - dragging.startY
    const deltaX = pos.x - dragging.startX

    if (orientation === 'horizontal') {
      let next = Math.round(dragging.startOffset + deltaY)
      if (dragging.target === 'A') {
        next = applySnappingAbs(next, {
          selfBase: layout.baseA,
          selfSize: layout.first.h,
          otherBase: layout.baseB + (offsetB),
          otherSize: layout.second.h,
        })
      } else {
        next = applySnappingAbs(next, {
          selfBase: layout.baseB,
          selfSize: layout.second.h,
          otherBase: layout.baseA + (offsetA),
          otherSize: layout.first.h,
        })
      }
      dragging.target === 'A' ? setOffsetA(next) : setOffsetB(next)
    } else {
      let next = Math.round(dragging.startOffset + deltaX)
      if (dragging.target === 'A') {
        next = applySnappingAbs(next, {
          selfBase: layout.baseA,
          selfSize: layout.first.w,
          otherBase: layout.baseB + (offsetB),
          otherSize: layout.second.w,
        })
      } else {
        next = applySnappingAbs(next, {
          selfBase: layout.baseB,
          selfSize: layout.second.w,
          otherBase: layout.baseA + (offsetA),
          otherSize: layout.first.w,
        })
      }
      dragging.target === 'A' ? setOffsetA(next) : setOffsetB(next)
    }
  }

  const onMouseUp = () => setDragging(null)

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (!canMerge) return
    const step = e.shiftKey ? 10 : 1
    if (orientation === 'horizontal') {
      if (e.key === 'ArrowUp') { e.preventDefault(); activeImage === 'A' ? setOffsetA(offsetA - step) : setOffsetB(offsetB - step) }
      if (e.key === 'ArrowDown') { e.preventDefault(); activeImage === 'A' ? setOffsetA(offsetA + step) : setOffsetB(offsetB + step) }
    } else {
      if (e.key === 'ArrowLeft') { e.preventDefault(); activeImage === 'A' ? setOffsetA(offsetA - step) : setOffsetB(offsetB - step) }
      if (e.key === 'ArrowRight') { e.preventDefault(); activeImage === 'A' ? setOffsetA(offsetA + step) : setOffsetB(offsetB + step) }
    }
  }

  const onWheelZoom = (e: React.WheelEvent<HTMLDivElement>) => {
    // Hold Ctrl/Cmd or Shift to zoom instead of scroll
    if (!(e.ctrlKey || e.metaKey || e.shiftKey)) return
    e.preventDefault()
    const delta = e.deltaY > 0 ? -5 : 5
    setPreviewZoom((z) => Math.max(25, Math.min(400, z + delta)))
  }

  const handleDownload = () => {
    if (!resultUrl) return
    const link = document.createElement("a")
    link.href = resultUrl
    link.download = orientation === "horizontal" ? "merged-horizontal.png" : "merged-vertical.png"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const swapImages = () => setSecondFirst((v) => !v)

  const clearAll = () => {
    setFileA(null)
    setFileB(null)
    setSecondFirst(false)
    setResultUrl("")
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-950 dark:to-gray-900 text-gray-900 dark:text-gray-100">
      <ToolHeader />
      <div className="mx-auto max-w-5xl px-4 pb-20">
        <section className="mb-8">
          <h1 className="text-2xl font-semibold tracking-tight">Merge Images</h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Upload two images, choose layout, alignment, scaling, and fine‑tune positioning. Works fully in your browser.
          </p>
        </section>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-4">
            {/* Dropzone */}
            <div
              className="rounded-lg border border-dashed border-gray-300 bg-gray-50 p-4 text-center text-sm text-gray-600 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-300"
              onDragOver={(e) => { e.preventDefault(); e.dataTransfer.dropEffect = "copy" }}
              onDrop={(e) => {
                e.preventDefault()
                const files = Array.from(e.dataTransfer.files || [])
                const imgs = files.filter(f => f.type.startsWith("image/"))
                if (imgs[0]) setFileA(imgs[0])
                if (imgs[1]) setFileB(imgs[1])
              }}
            >
              Drag and drop two images here, or use the pickers below.
            </div>

            <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900">
              <label className="mb-2 block text-sm font-medium">First image</label>
              <Input
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => {
                  const files = Array.from(e.target.files || [])
                  const imgs = files.filter((f) => f.type.startsWith("image/"))
                  if (imgs[0]) setFileA(imgs[0])
                  if (imgs[1]) setFileB(imgs[1])
                  if (!imgs[0]) setFileA(null)
                }}
              />
              {srcA ? (
                <div className="mt-3 overflow-hidden rounded-md border border-gray-200 dark:border-gray-800">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={srcA} alt="First preview" className="max-h-56 w-full object-contain bg-gray-50 dark:bg-gray-950" />
                </div>
              ) : (
                <p className="mt-2 text-xs text-gray-500">PNG, JPG, or WEBP. Max ~20MB suggested.</p>
              )}
            </div>

            <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900">
              <label className="mb-2 block text-sm font-medium">Second image</label>
              <Input
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => {
                  const files = Array.from(e.target.files || [])
                  const imgs = files.filter((f) => f.type.startsWith("image/"))
                  if (imgs[0]) setFileB(imgs[0])
                  if (imgs[1]) setFileA(imgs[1])
                  if (!imgs[0]) setFileB(null)
                }}
              />
              {srcB ? (
                <div className="mt-3 overflow-hidden rounded-md border border-gray-200 dark:border-gray-800">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={srcB} alt="Second preview" className="max-h-56 w-full object-contain bg-gray-50 dark:bg-gray-950" />
                </div>
              ) : (
                <p className="mt-2 text-xs text-gray-500">PNG, JPG, or WEBP. Max ~20MB suggested.</p>
              )}
            </div>

            <div className="flex items-center gap-2">
              <Button variant="secondary" onClick={swapImages} disabled={!canMerge}>Swap order</Button>
              <Button variant="ghost" onClick={clearAll}>Clear</Button>
            </div>

            {/* Per-image controls */}
            <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900">
              <h3 className="mb-3 text-sm font-medium">Per-image fine‑tuning</h3>
              <div className="grid gap-6 sm:grid-cols-2">
                {/* Image 1 */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between gap-3">
                    <div className="text-sm font-medium">Image 1</div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" onClick={() => { setScaleA(100); setOffsetA(0); }}>Reset</Button>
                      <button className={`rounded px-2 py-1 text-xs ${activeImage==='A'?'bg-blue-600 text-white':'bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300'}`} onClick={(e) => { e.preventDefault(); setActiveImage('A') }}>Active</button>
                  </div>
                  </div>
                  <div className="grid items-center gap-2 sm:grid-cols-[1fr_auto_auto]">
                    <label className="text-xs text-gray-500">Scale</label>
                    <input type="range" min={10} max={300} step={1} value={scaleA} onChange={(e) => setScaleA(parseInt(e.target.value))} className="w-full sm:col-start-1 sm:col-end-2" />
                    <input type="number" min={10} max={300} step={1} value={scaleA} onChange={(e) => setScaleA(Math.max(10, Math.min(300, parseInt(e.target.value||'0'))))} className="w-20 rounded border border-gray-300 bg-transparent px-2 py-1 text-sm dark:border-gray-700 sm:col-start-2" />
                    <span className="text-xs text-gray-500 sm:col-start-3">%</span>
                  </div>
                  <div className="grid items-center gap-2 sm:grid-cols-[1fr_auto_auto]">
                    <label className="text-xs text-gray-500">{orientation === 'horizontal' ? 'Vertical offset' : 'Horizontal offset'}</label>
                    <input type="range" min={-500} max={500} step={1} value={offsetA} onChange={(e) => setOffsetA(parseInt(e.target.value))} className="w-full sm:col-start-1 sm:col-end-2" />
                    <input type="number" min={-500} max={500} step={1} value={offsetA} onChange={(e) => setOffsetA(Math.max(-500, Math.min(500, parseInt(e.target.value||'0'))))} className="w-20 rounded border border-gray-300 bg-transparent px-2 py-1 text-sm dark:border-gray-700 sm:col-start-2" />
                    <span className="text-xs text-gray-500 sm:col-start-3">px</span>
                  </div>
                </div>

                {/* Image 2 */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between gap-3">
                    <div className="text-sm font-medium">Image 2</div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" onClick={() => { setScaleB(100); setOffsetB(0); }}>Reset</Button>
                      <button className={`rounded px-2 py-1 text-xs ${activeImage==='B'?'bg-blue-600 text-white':'bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300'}`} onClick={(e) => { e.preventDefault(); setActiveImage('B') }}>Active</button>
                    </div>
                  </div>
                  <div className="grid items-center gap-2 sm:grid-cols-[1fr_auto_auto]">
                    <label className="text-xs text-gray-500">Scale</label>
                    <input type="range" min={10} max={300} step={1} value={scaleB} onChange={(e) => setScaleB(parseInt(e.target.value))} className="w-full sm:col-start-1 sm:col-end-2" />
                    <input type="number" min={10} max={300} step={1} value={scaleB} onChange={(e) => setScaleB(Math.max(10, Math.min(300, parseInt(e.target.value||'0'))))} className="w-20 rounded border border-gray-300 bg-transparent px-2 py-1 text-sm dark:border-gray-700 sm:col-start-2" />
                    <span className="text-xs text-gray-500 sm:col-start-3">%</span>
                  </div>
                  <div className="grid items-center gap-2 sm:grid-cols-[1fr_auto_auto]">
                    <label className="text-xs text-gray-500">{orientation === 'horizontal' ? 'Vertical offset' : 'Horizontal offset'}</label>
                    <input type="range" min={-500} max={500} step={1} value={offsetB} onChange={(e) => setOffsetB(parseInt(e.target.value))} className="w-full sm:col-start-1 sm:col-end-2" />
                    <input type="number" min={-500} max={500} step={1} value={offsetB} onChange={(e) => setOffsetB(Math.max(-500, Math.min(500, parseInt(e.target.value||'0'))))} className="w-20 rounded border border-gray-300 bg-transparent px-2 py-1 text-sm dark:border-gray-700 sm:col-start-2" />
                    <span className="text-xs text-gray-500 sm:col-start-3">px</span>
                  </div>
                </div>
              </div>
              <p className="mt-2 text-xs text-gray-500">Offsets move images on the cross‑axis. Use order, alignment, and scaling for main placement. Click “Active” to select which image arrow keys will adjust.</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium">Layout</label>
                  <Select value={orientation} onValueChange={(v) => setOrientation(v as Orientation)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose layout" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="horizontal">Horizontal (side by side)</SelectItem>
                      <SelectItem value="vertical">Vertical (stacked)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium">Auto-scale</label>
                  <Select value={autoScale} onValueChange={(v) => setAutoScale(v as AutoScale)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Auto-scale option" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      <SelectItem value="match-height">Match heights</SelectItem>
                      <SelectItem value="match-width">Match widths</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {orientation === "horizontal" ? (
                  <div>
                    <label className="mb-2 block text-sm font-medium">Vertical align</label>
                    <Select value={verticalAlign} onValueChange={(v) => setVerticalAlign(v as VAlign)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Align images" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="top">Top</SelectItem>
                        <SelectItem value="center">Center</SelectItem>
                        <SelectItem value="bottom">Bottom</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                ) : (
                  <div>
                    <label className="mb-2 block text-sm font-medium">Horizontal align</label>
                    <Select value={horizontalAlign} onValueChange={(v) => setHorizontalAlign(v as HAlign)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Align images" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="left">Left</SelectItem>
                        <SelectItem value="center">Center</SelectItem>
                        <SelectItem value="right">Right</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
            </div>

            {/* Editor controls */}
            <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900">
              <h3 className="mb-4 text-sm font-medium">Editor</h3>
              <div className="grid gap-4 sm:grid-cols-3">
                {/* Zoom control */}
                <div className="sm:col-span-2">
                  <label className="mb-2 block text-xs font-medium text-gray-500">Preview zoom</label>
                  <div className="flex items-center gap-3">
                    <Button type="button" variant="outline" size="sm" onClick={() => setPreviewZoom((z) => Math.max(25, z - 10))} aria-label="Zoom out">−</Button>
                    <input className="flex-1" type="range" min={25} max={400} step={5} value={previewZoom} onChange={(e) => setPreviewZoom(parseInt(e.target.value))} aria-label="Preview zoom slider" />
                    <Button type="button" variant="outline" size="sm" onClick={() => setPreviewZoom((z) => Math.min(400, z + 10))} aria-label="Zoom in">+</Button>
                    <Input className="w-20" type="number" min={25} max={400} step={5} value={previewZoom} onChange={(e) => setPreviewZoom(Math.max(25, Math.min(400, parseInt(e.target.value || '0'))))} aria-label="Preview zoom percent" />
                    <Button type="button" variant="ghost" size="sm" onClick={() => setPreviewZoom(100)}>Reset</Button>
                  </div>
                </div>

                {/* Snap controls */}
                <div className="sm:col-span-1">
                  <label className="mb-2 block text-xs font-medium text-gray-500">Snap to</label>
                  <div className="flex flex-wrap items-center gap-2">
                    <button type="button" onClick={() => setSnapCenter((v) => !v)} className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors border ${snapCenter ? 'bg-blue-600 text-white border-blue-600' : 'border-gray-300 dark:border-gray-700 bg-transparent text-gray-700 dark:text-gray-300'}`}>Center</button>
                    <button type="button" onClick={() => setSnapEdges((v) => !v)} className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors border ${snapEdges ? 'bg-blue-600 text-white border-blue-600' : 'border-gray-300 dark:border-gray-700 bg-transparent text-gray-700 dark:text-gray-300'}`}>Edges</button>
                    <div className="ml-auto flex items-center gap-2">
                      <span className="text-xs text-gray-500">Threshold</span>
                      <Input className="w-16" type="number" min={0} max={50} step={1} value={snapThreshold} onChange={(e) => setSnapThreshold(Math.max(0, Math.min(50, parseInt(e.target.value || '0'))))} aria-label="Snap threshold in pixels" />
                      <span className="text-xs text-gray-500">px</span>
                    </div>
                  </div>
                </div>
              </div>
              <p className="mt-3 text-xs text-gray-500">Drag an image on the preview to fine‑tune its {orientation === 'horizontal' ? 'vertical' : 'horizontal'} offset. Use arrow keys to nudge the Active image (Shift for 10px steps).</p>
            </div>

            <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-sm font-medium">Preview</h2>
                <div className="flex items-center gap-2">
                  <Button onClick={doMerge} disabled={!canMerge || isMerging}>
                    {isMerging ? "Merging..." : "Re-merge"}
                  </Button>
                  <Button variant="outline" onClick={handleDownload} disabled={!resultUrl}>Download PNG</Button>
                </div>
              </div>
              <div
                ref={containerRef}
                className="flex items-center justify-center overflow-auto rounded-md border border-dashed border-gray-300 bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-950"
                onWheel={onWheelZoom}
              >
                {canMerge ? (
                  <div className="relative" style={{ transform: `scale(${previewZoom/100})`, transformOrigin: 'top left' }}>
                    <canvas
                      ref={canvasRef}
                      onMouseDown={onMouseDown}
                      onMouseMove={onMouseMove}
                      onMouseUp={onMouseUp}
                      onMouseLeave={onMouseUp}
                      className={`block max-h-[80vh] ${dragging ? 'cursor-grabbing' : 'cursor-grab'}`}
                      aria-label="Merged preview canvas"
                      tabIndex={0}
                      onKeyDown={onKeyDown}
                    />
                  </div>
                ) : (
                  <div className="text-center text-sm text-gray-500">Upload two images to see the merged preview.</div>
                )}
              </div>
              {secondFirst && (
                <p className="mt-2 text-xs text-gray-500">Order: second image is placed first.</p>
              )}
            </div>
          </div>
        </div>

        <div className="mt-10">
          <FeedbackForm toolName="Image Merge" />
        </div>
      </div>
    </main>
  )
}
