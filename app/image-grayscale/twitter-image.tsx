import { ImageResponse } from "next/og"

export const runtime = "edge"
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "flex-start",
          background: "linear-gradient(135deg,#0f172a,#0b1220)",
          color: "white",
          padding: "64px",
          fontFamily: "Inter, ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto",
        }}
      >
        <div style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 16,
          borderRadius: 20,
          padding: "12px 20px",
          background: "rgba(16,185,129,0.15)",
          fontSize: 28,
        }}>
          <div style={{ fontSize: 36 }}>🎨</div>
          <div style={{ opacity: 0.9 }}>Smart Generators</div>
        </div>
        <div style={{ height: 24 }} />
        <div style={{ fontSize: 72, fontWeight: 800, letterSpacing: -1 }}>
          Image to Black & White
        </div>
        <div style={{ height: 12 }} />
        <div style={{ fontSize: 32, opacity: 0.85 }}>
          Convert images to grayscale — no uploads
        </div>
        <div style={{ height: 28 }} />
        <div style={{ fontSize: 28, opacity: 0.7 }}>smartgenerators.dev/image-grayscale</div>
      </div>
    ),
    {
      ...size,
    }
  )
}
