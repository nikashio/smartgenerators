import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "HEIC to JPG Converter – Free, No Uploads | Privacy First",
  description:
    "Convert Apple HEIC/HEIF photos to JPG in your browser. Private, fast, and free — no uploads or sign‑in.",
  keywords: [
    "HEIC to JPG",
    "HEIF to JPG",
    "convert HEIC",
    "iPhone photo to JPG",
    "HEIC converter",
    "online HEIC to JPEG",
  ],
  robots: "index, follow",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://smartgenerators.dev/convert/heic-to-jpg",
    title: "HEIC to JPG Converter – No Uploads",
    description:
      "Fast, private HEIC→JPG conversion in your browser. No uploads.",
    siteName: "Smart Generators",
    images: [
      { url: "https://smartgenerators.dev/placeholder.jpg", width: 1200, height: 630, alt: "HEIC to JPG Converter" },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "HEIC to JPG Converter – No Uploads",
    description: "Convert HEIC photos to JPG locally in your browser.",
    images: ["https://smartgenerators.dev/placeholder.jpg"],
  },
  alternates: {
    canonical: "https://smartgenerators.dev/convert/heic-to-jpg",
  },
}

export default function HeicToJpgLayout({ children }: { children: React.ReactNode }) {
  return children
}

