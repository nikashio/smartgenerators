"use client"

import React, { useEffect, useRef, useState } from "react"

export type CropRect = { x: number; y: number; w: number; h: number }

type Props = {
  src: string | null
  onCropChange?: (crop: CropRect | null) => void
  className?: string
}

type Handle =
  | "none"
  | "move"
  | "n"
  | "s"
  | "e"
  | "w"
  | "ne"
  | "nw"
  | "se"
  | "sw"

export default function CropCanvas({ src, onCropChange, className }: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const [img, setImg] = useState<HTMLImageElement | null>(null)
  const [imgSize, setImgSize] = useState<{ w: number; h: number } | null>(null)
  const [crop, setCrop] = useState<CropRect | null>(null) // in image coordinates

  // view transform
  const [view, setView] = useState({
    cw: 560,
    ch: 360,
    scale: 1,
    ox: 0,
    oy: 0,
  })

  const [drag, setDrag] = useState<{
    mode: Handle
    startX: number
    startY: number
    startCrop?: CropRect | null
  } | null>(null)

  // load image when src changes
  useEffect(() => {
    let revoked: string | null = null
    if (!src) {
      setImg(null)
      setImgSize(null)
      setCrop(null)
      return
    }
    const image = new Image()
    image.decoding = "async"
    image.crossOrigin = "anonymous"
    image.onload = () => {
      setImg(image)
      setImgSize({ w: image.naturalWidth, h: image.naturalHeight })
      // default crop to centered square-ish region (70% of shortest side)
      const sw = image.naturalWidth
      const sh = image.naturalHeight
      const size = Math.floor(Math.min(sw, sh) * 0.8)
      const cx = Math.floor((sw - size) / 2)
      const cy = Math.floor((sh - size) / 2)
      const next = { x: cx, y: cy, w: size, h: size }
      setCrop(next)
      onCropChange?.(next)
      layout(image.naturalWidth, image.naturalHeight)
    }
    image.onerror = () => {
      setImg(null)
      setImgSize(null)
      setCrop(null)
    }
    image.src = src
    // If src is an object URL, let the page manage revocation. Just in case, we don't revoke here.
    return () => {
      if (revoked) URL.revokeObjectURL(revoked)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [src])

  // layout canvas to device pixel ratio and compute view transform
  const layout = (iw?: number, ih?: number) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const dpr = typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1
    // Try to use CSS size from parent, fallback to defaults
    const parent = canvas.parentElement
    const cssW = Math.max(320, Math.min(700, parent?.clientWidth || 560))
    const cssH = 360
    canvas.style.width = cssW + "px"
    canvas.style.height = cssH + "px"
    canvas.width = Math.floor(cssW * dpr)
    canvas.height = Math.floor(cssH * dpr)
    const w = canvas.width
    const h = canvas.height
    const srcW = iw ?? imgSize?.w ?? 1
    const srcH = ih ?? imgSize?.h ?? 1
    const scale = Math.min(w / srcW, h / srcH)
    const ox = Math.floor((w - srcW * scale) / 2)
    const oy = Math.floor((h - srcH * scale) / 2)
    setView({ cw: w, ch: h, scale, ox, oy })
  }

  useEffect(() => {
    layout()
    const onResize = () => layout()
    window.addEventListener("resize", onResize)
    return () => window.removeEventListener("resize", onResize)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [imgSize?.w, imgSize?.h])

  // Convert canvas coords to image coords
  const toImageCoords = (vx: number, vy: number) => {
    const x = (vx - view.ox) / view.scale
    const y = (vy - view.oy) / view.scale
    return { x, y }
  }

  const clampCrop = (c: CropRect): CropRect => {
    const iw = imgSize?.w || 1
    const ih = imgSize?.h || 1
    const x = Math.max(0, Math.min(iw - 1, c.x))
    const y = Math.max(0, Math.min(ih - 1, c.y))
    const w = Math.max(10, Math.min(iw - x, c.w))
    const h = Math.max(10, Math.min(ih - y, c.h))
    return { x, y, w, h }
  }

  // Interaction
  const handleAt = (vx: number, vy: number): Handle => {
    if (!crop) return "none"
    const cx = crop.x * view.scale + view.ox
    const cy = crop.y * view.scale + view.oy
    const cw = crop.w * view.scale
    const ch = crop.h * view.scale
    const pad = Math.max(6, 8 * (view.scale))
    const inside = vx >= cx && vy >= cy && vx <= cx + cw && vy <= cy + ch
    // corners
    const near = (x: number, y: number) => Math.hypot(vx - x, vy - y) <= pad
    if (near(cx, cy)) return "nw"
    if (near(cx + cw, cy)) return "ne"
    if (near(cx, cy + ch)) return "sw"
    if (near(cx + cw, cy + ch)) return "se"
    // edges
    if (inside && Math.abs(vy - cy) <= pad) return "n"
    if (inside && Math.abs(vy - (cy + ch)) <= pad) return "s"
    if (inside && Math.abs(vx - cx) <= pad) return "w"
    if (inside && Math.abs(vx - (cx + cw)) <= pad) return "e"
    return inside ? "move" : "none"
  }

  const onDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!crop) return
    const rect = (e.target as HTMLCanvasElement).getBoundingClientRect()
    const vx = (e.clientX - rect.left) * (view.cw / rect.width)
    const vy = (e.clientY - rect.top) * (view.ch / rect.height)
    const mode = handleAt(vx, vy)
    setDrag({ mode, startX: vx, startY: vy, startCrop: { ...crop } })
  }

  const onMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const rect = canvas.getBoundingClientRect()
    const vx = (e.clientX - rect.left) * (view.cw / rect.width)
    const vy = (e.clientY - rect.top) * (view.ch / rect.height)
    if (drag && drag.startCrop && crop) {
      const dx = (vx - drag.startX) / view.scale
      const dy = (vy - drag.startY) / view.scale
      let next = { ...drag.startCrop }
      switch (drag.mode) {
        case "move":
          next.x = drag.startCrop.x + dx
          next.y = drag.startCrop.y + dy
          break
        case "n":
          next.y = drag.startCrop.y + dy
          next.h = drag.startCrop.h - dy
          break
        case "s":
          next.h = drag.startCrop.h + dy
          break
        case "w":
          next.x = drag.startCrop.x + dx
          next.w = drag.startCrop.w - dx
          break
        case "e":
          next.w = drag.startCrop.w + dx
          break
        case "nw":
          next.x = drag.startCrop.x + dx
          next.y = drag.startCrop.y + dy
          next.w = drag.startCrop.w - dx
          next.h = drag.startCrop.h - dy
          break
        case "ne":
          next.y = drag.startCrop.y + dy
          next.w = drag.startCrop.w + dx
          next.h = drag.startCrop.h - dy
          break
        case "sw":
          next.x = drag.startCrop.x + dx
          next.w = drag.startCrop.w - dx
          next.h = drag.startCrop.h + dy
          break
        case "se":
          next.w = drag.startCrop.w + dx
          next.h = drag.startCrop.h + dy
          break
        default:
          break
      }
      // Normalize to keep positive sizes
      if (next.w < 0) {
        next.x = next.x + next.w
        next.w = Math.abs(next.w)
      }
      if (next.h < 0) {
        next.y = next.y + next.h
        next.h = Math.abs(next.h)
      }
      next = clampCrop(next)
      setCrop(next)
      onCropChange?.(next)
    }
    // update cursor
    const mode = handleAt(vx, vy)
    const c =
      mode === "move"
        ? "move"
        : mode === "n" || mode === "s"
        ? "ns-resize"
        : mode === "e" || mode === "w"
        ? "ew-resize"
        : mode === "ne" || mode === "sw"
        ? "nesw-resize"
        : mode === "nw" || mode === "se"
        ? "nwse-resize"
        : "default"
    canvas.style.cursor = c
  }

  const onUp = () => setDrag(null)

  // draw
  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext("2d")
    if (!canvas || !ctx) return
    ctx.clearRect(0, 0, view.cw, view.ch)
    // background
    ctx.fillStyle = "#0b1220"
    ctx.fillRect(0, 0, view.cw, view.ch)

    if (img && imgSize) {
      const dw = imgSize.w * view.scale
      const dh = imgSize.h * view.scale
      ctx.imageSmoothingEnabled = true
      ctx.imageSmoothingQuality = "high"
      ctx.drawImage(img, 0, 0, imgSize.w, imgSize.h, view.ox, view.oy, dw, dh)

      if (crop) {
        const rx = crop.x * view.scale + view.ox
        const ry = crop.y * view.scale + view.oy
        const rw = crop.w * view.scale
        const rh = crop.h * view.scale

        // darken outside
        ctx.save()
        ctx.fillStyle = "rgba(0,0,0,0.5)"
        ctx.beginPath()
        ctx.rect(0, 0, view.cw, view.ch)
        ctx.rect(rx, ry, rw, rh)
        ctx.fill("evenodd")
        ctx.restore()

        // border
        ctx.save()
        ctx.strokeStyle = "#00e5ff"
        ctx.lineWidth = Math.max(1, 2 * view.scale)
        ctx.strokeRect(rx, ry, rw, rh)
        ctx.restore()

        // handles
        ctx.save()
        ctx.fillStyle = "#00e5ff"
        const s = Math.max(6, 8 * view.scale)
        const points: [number, number][] = [
          [rx, ry],
          [rx + rw, ry],
          [rx, ry + rh],
          [rx + rw, ry + rh],
        ]
        for (const [px, py] of points) {
          ctx.beginPath()
          ctx.arc(px, py, s, 0, Math.PI * 2)
          ctx.fill()
        }
        ctx.restore()
      }
    }
  }, [img, imgSize, crop, view])

  const resetCrop = () => {
    if (!imgSize) return
    const next = { x: 0, y: 0, w: imgSize.w, h: imgSize.h }
    setCrop(next)
    onCropChange?.(next)
  }

  return (
    <div className={className}>
      <div className="mb-2 flex justify-between text-xs text-gray-500 dark:text-gray-400">
        <div>
          {imgSize && crop
            ? `Image: ${imgSize.w}×${imgSize.h} • Crop: ${Math.round(crop.w)}×${Math.round(crop.h)}`
            : "No image loaded"}
        </div>
        <button
          type="button"
          onClick={resetCrop}
          className="rounded border border-gray-300 px-2 py-1 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
          disabled={!imgSize}
        >
          Reset crop
        </button>
      </div>
      <canvas
        ref={canvasRef}
        className="h-[360px] w-full rounded-md border border-gray-300 dark:border-gray-700"
        onMouseDown={onDown}
        onMouseMove={onMove}
        onMouseUp={onUp}
        onMouseLeave={onUp}
        aria-label="Crop editor"
      />
    </div>
  )
}

