/**
 * Root layout and SEO metadata for the application. Sets up global fonts/styles and the toaster.
 */
import type React from "react"
import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import "./globals.css"
import { Toaster } from "@/components/ui/toaster"

const geistSans = Geist({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-geist-sans",
})

const geistMono = Geist_Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-geist-mono",
})

export const metadata: Metadata = {
  title: "Discord Timestamp Generator - Free Tool for Discord Time Formatting",
  description:
    "Generate Discord timestamps instantly with natural language input. Create <t:UNIX:FORMAT> codes, decode snowflakes, and share time-synced messages across timezones. 100% free tool.",
  keywords:
    "Discord timestamp generator, Discord timestamps, snowflake decoder, Discord time format, Discord timestamp tool, Discord timestamp UTC",
  authors: [{ name: "Discord Timestamp Generator" }],
  creator: "Discord Timestamp Generator",
  publisher: "Discord Timestamp Generator",
  robots: "index, follow",
  openGraph: {
    title: "Discord Timestamp Generator - Free Tool for Discord Time Formatting",
    description:
      "Generate Discord timestamps instantly with natural language input. Create <t:UNIX:FORMAT> codes, decode snowflakes, and share time-synced messages across timezones. 100% free tool.",
    type: "website",
    locale: "en_US",
    url: "https://smartgenerators.dev",
    siteName: "Smart Generators",
  },
  twitter: {
    card: "summary_large_image",
    title: "Discord Timestamp Generator - Free Tool for Discord Time Formatting",
    description:
      "Generate Discord timestamps instantly with natural language input. Create <t:UNIX:FORMAT> codes, decode snowflakes, and share time-synced messages across timezones. 100% free tool.",
  },
  alternates: {
    canonical: "/",
  },
    generator: 'v0.app'
}

/** Root layout component that wraps all pages with HTML/body and global providers. */
export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "Discord Timestamp Generator",
    "description": "Generate Discord timestamps instantly with natural language input. Create <t:UNIX:FORMAT> codes, decode snowflakes, and share time-synced messages across timezones.",
    "url": "https://smartgenerators.dev",
    "applicationCategory": "DeveloperApplication",
    "operatingSystem": "Web",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    },
    "featureList": [
      "Natural language time input parsing",
      "Discord timestamp generation",
      "Snowflake ID decoding",
      "Multiple timestamp formats",
      "Real-time preview",
      "Timezone support"
    ],
    "creator": {
      "@type": "Organization",
      "name": "Smart Generators"
    }
  }

  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      </head>
      <body>
        {children}
        <Toaster />
      </body>
    </html>
  )
}
