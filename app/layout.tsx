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
  title: "Discord Timestamp Generator - Create Discord Timestamps & Decode Snowflakes",
  description:
    "Free Discord timestamp generator and converter. Create <t:UNIX:FORMAT> codes, decode snowflakes, and preview relative times.",
  keywords:
    "Discord timestamp generator, Discord timestamps, snowflake decoder, Discord time format, Discord timestamp tool, Discord timestamp UTC",
  authors: [{ name: "Discord Timestamp Generator" }],
  creator: "Discord Timestamp Generator",
  publisher: "Discord Timestamp Generator",
  robots: "index, follow",
  openGraph: {
    title: "Discord Timestamp Generator - Create Discord Timestamps & Decode Snowflakes",
    description:
      "Free Discord timestamp generator and converter. Create <t:UNIX:FORMAT> codes, decode snowflakes, and preview relative times.",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Discord Timestamp Generator - Create Discord Timestamps & Decode Snowflakes",
    description:
      "Free Discord timestamp generator and converter. Create <t:UNIX:FORMAT> codes, decode snowflakes, and preview relative times.",
  },
  alternates: {
    canonical: "/discord-timestamp",
  },
    generator: 'v0.app'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
      <body>
        {children}
        <Toaster />
      </body>
    </html>
  )
}
