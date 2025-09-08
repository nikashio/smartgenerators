import type { Metadata } from "next"
import React from "react"

export const metadata: Metadata = {
  title: "Merge Two Images Side-by-Side | Free Online Tool",
  description:
    "Upload two images, adjust crops by dragging, and export a perfectly aligned side-by-side image. Private, fast, and free.",
  keywords: [
    "merge images",
    "side by side image",
    "combine photos",
    "image collage",
    "manual crop",
    "drag and drop image tool",
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
    url: "https://smartgenerators.dev/image-merge",
    title: "Merge Two Images Side-by-Side",
    description: "Upload two images, crop manually, and export side-by-side.",
    siteName: "Smart Generators",
  },
  twitter: {
    card: "summary_large_image",
    title: "Merge Two Images Side-by-Side",
    description: "Upload, crop, and export — private and fast.",
  },
  alternates: {
    canonical: "https://smartgenerators.dev/image-merge",
  },
}

export default function ImageMergeLayout({ children }: { children: React.ReactNode }) {
  const ldJson = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "Image Merge (Side-by-Side)",
    applicationCategory: "MultimediaApplication",
    operatingSystem: "Any",
    description: "Upload two images, adjust crops, and export a side-by-side image.",
    url: "https://smartgenerators.dev/image-merge",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    featureList: ["Drag-to-crop", "PNG/JPG output", "Local processing"],
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
      { "@type": "ListItem", position: 3, name: "Image Merge (Side-by-Side)", item: "https://smartgenerators.dev/image-merge" },
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

