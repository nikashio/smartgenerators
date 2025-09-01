import type { Metadata } from "next"

/**
 * Layout for Countdown Timer Generator with comprehensive SEO
 * Handles metadata for the countdown timer tool
 */
export const metadata: Metadata = {
  title: "Countdown Timer Generator – Free Online Countdown & Embeddable Widget",
  description: "Create a free countdown timer for events, launches, exams, or streams. Shareable link, embeddable widget, no signup required.",
  keywords: [
    "countdown timer",
    "event countdown",
    "countdown generator",
    "free countdown timer",
    "countdown widget",
    "embeddable countdown",
    "event timer",
    "launch countdown",
    "exam countdown",
    "stream countdown",
    "countdown clock",
    "timer generator"
  ],
  authors: [{ name: "Smart Generators" }],
  creator: "Smart Generators",
  publisher: "Smart Generators",
  robots: "index, follow",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://smartgenerators.dev/countdown",
    title: "Countdown Timer Generator – Free Online Countdown & Embeddable Widget",
    description: "Create a free countdown timer for events, launches, exams, or streams. Shareable link, embeddable widget, no signup required.",
    siteName: "Smart Generators",
    images: [
      {
        url: "https://smartgenerators.dev/placeholder.jpg",
        width: 1200,
        height: 630,
        alt: "Countdown Timer Generator – Free Online Tool"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "Countdown Timer Generator – Free Online Countdown & Embeddable Widget",
    description: "Create a free countdown timer for events, launches, exams, or streams. Shareable link, embeddable widget, no signup required.",
    images: ["https://smartgenerators.dev/placeholder.jpg"],
  },
  alternates: {
    canonical: "https://smartgenerators.dev/countdown",
  }
}

export default function CountdownLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
