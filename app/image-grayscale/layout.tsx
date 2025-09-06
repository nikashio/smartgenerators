import type { Metadata } from "next"
import React from "react"

export const metadata: Metadata = {
  title: "Image to Black & White – Grayscale Converter (No Uploads) | Free",
  description:
    "Convert images to clean grayscale entirely in your browser. Private, fast, and free.",
  keywords: [
    "grayscale converter",
    "black and white image",
    "image to grayscale",
    "photo to black and white",
    "online grayscale tool",
    "black and white converter",
    "grayscale photo converter",
    "make photo black and white",
    "convert color image to black and white",
    "no upload image editor",
  ],
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      maxSnippet: -1,
      maxImagePreview: "large",
      maxVideoPreview: -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://smartgenerators.dev/image-grayscale",
    title: "Image to Black & White – Grayscale Converter",
    description: "Convert images to grayscale in your browser. No uploads.",
    siteName: "Smart Generators",
    images: [
      { url: "https://smartgenerators.dev/image-grayscale/opengraph-image", width: 1200, height: 630, alt: "Grayscale Converter Tool" },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Image to Black & White – Grayscale Converter",
    description: "Convert images to grayscale locally in your browser.",
    images: ["https://smartgenerators.dev/image-grayscale/twitter-image"],
  },
  alternates: {
    canonical: "https://smartgenerators.dev/image-grayscale",
  },
}

export default function ImageGrayscaleLayout({ children }: { children: React.ReactNode }) {
  const ldJson = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "Image to Black & White (Grayscale Converter)",
    applicationCategory: "MultimediaApplication",
    operatingSystem: "Any",
    description: "Convert images to clean grayscale entirely in your browser. Private, fast, and free.",
    url: "https://smartgenerators.dev/image-grayscale",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    featureList: ["Privacy-first (local)", "PNG/JPG output", "Drag-and-drop uploads"],
    image: "https://smartgenerators.dev/image-grayscale/opengraph-image",
    publisher: {
      "@type": "Organization",
      name: "Smart Generators",
      logo: "https://smartgenerators.dev/logo.png"
    }
  }

  const breadcrumbs = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://smartgenerators.dev" },
      { "@type": "ListItem", position: 2, name: "Tools", item: "https://smartgenerators.dev/tools" },
      { "@type": "ListItem", position: 3, name: "Image to Black & White", item: "https://smartgenerators.dev/image-grayscale" },
    ],
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(ldJson) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbs) }}
      />
      {children}
    </>
  )
}
