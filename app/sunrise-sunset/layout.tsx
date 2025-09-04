/**
 * Layout for sunrise-sunset pages
 * Provides SEO metadata for the sunrise-sunset calculator
 */

import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Sunrise & Sunset Calculator | Smart Generators",
  description: "Calculate sunrise, sunset, and golden hour times for any city worldwide. Download ICS calendar files or subscribe to daily updates. Free solar time calculator.",
  keywords: [
    "sunrise calculator",
    "sunset calculator", 
    "golden hour calculator",
    "solar time calculator",
    "sunrise sunset times",
    "calendar export ICS",
    "solar calculator",
    "sun times"
  ],
  openGraph: {
    title: "Sunrise & Sunset Calculator",
    description: "Calculate sunrise, sunset, and golden hour times for any city worldwide. Free solar time calculator with calendar export.",
    type: "website",
    siteName: "Smart Generators"
  },
  twitter: {
    card: "summary",
    title: "Sunrise & Sunset Calculator",
    description: "Calculate sunrise, sunset, and golden hour times for any city worldwide. Free solar calculator."
  },
  alternates: {
    canonical: "https://smartgenerators.dev/sunrise-sunset"
  }
}

export default function SunriseSunsetLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
