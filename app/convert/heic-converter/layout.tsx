import { Metadata } from "next"

export const metadata: Metadata = {
  title: "HEIC Converter – JPG/PNG/PDF (No Uploads) | Privacy First",
  description:
    "Convert HEIC/HEIF images to JPG, PNG, or PDF — no uploads. Fast, private, and browser-based with batch support.",
  keywords: [
    "image format converter", "HEIC to JPG converter", "HEIC converter", "Apple HEIC to JPG",
    "convert HEIC", "HEIC to JPEG", "iPhone photo converter", "HEIC format converter",
    "online HEIC converter", "free HEIC converter", "convert HEIC photos", "HEIC to PNG",
    "JPG to PNG converter", "PNG to JPG converter", "image converter online"
  ],
  authors: [{ name: "Smart Generators" }],
  creator: "Smart Generators",
  publisher: "Smart Generators",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    title: "HEIC Converter – JPG/PNG/PDF (No Uploads) | Privacy First",
    description:
      "Convert HEIC/HEIF to JPG, PNG, or PDF — private, fast, and entirely in your browser.",
    url: "https://smartgenerators.dev/convert/heic-converter",
    siteName: "Smart Generators",
    images: [
      {
        url: "https://smartgenerators.dev/og-heic-converter.png",
        width: 1200,
        height: 630,
        alt: "Image Format Converter Tool",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "HEIC Converter – JPG/PNG/PDF (No Uploads)",
    description:
      "Convert HEIC/HEIF to JPG, PNG, or PDF in your browser. No uploads.",
    images: ["https://smartgenerators.dev/og-heic-converter.png"],
  },
  alternates: {
    canonical: "https://smartgenerators.dev/convert/heic-converter",
  },
}

export default function HEICConverterLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      {/* SoftwareApplication Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            "name": "HEIC Converter (JPG/PNG/PDF)",
            "applicationCategory": "WebApplication",
            "operatingSystem": "Any",
            "description": "Convert HEIC/HEIF to JPG, PNG, or PDF — privacy-first, no uploads, runs entirely in your browser.",
            "url": "https://smartgenerators.dev/convert/heic-converter",
            "provider": {
              "@type": "Organization",
              "name": "Smart Generators",
              "url": "https://smartgenerators.dev"
            },
            "offers": {
              "@type": "Offer",
              "price": "0",
              "priceCurrency": "USD"
            },
            "featureList": [
              "Convert HEIC to JPG/PNG/PDF",
              "Batch processing",
              "Privacy-first (no uploads)",
              "Browser-based processing",
              "Target size optimization",
              "Metadata control"
            ]
          })
        }}
      />

      {/* FAQPage Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": [
              {
                "@type": "Question",
                "name": "Does this tool work offline?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Yes! The HEIC converter works entirely offline once loaded. All processing happens in your browser, so your files never leave your device."
                }
              },
              {
                "@type": "Question",
                "name": "Is my data private and secure?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Absolutely! All conversions happen locally in your browser. Your images never get uploaded to any server. The tool uses Web Workers for efficient processing without compromising your privacy."
                }
              },
              {
                "@type": "Question",
                "name": "How do I use the HEIC converter?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Simply drag and drop your HEIC/HEIF/JPG/PNG files onto the converter, or click 'Choose Files' to select them. Choose JPG, PNG, or PDF, adjust settings if needed, then click 'Convert'."
                }
              }
            ]
          })
        }}
      />

      {children}
    </>
  )
}
