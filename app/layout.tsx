import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

/**
 * Root layout with SEO metadata and structured data for homepage
 * Provides global font and CSS configuration
 */
export const metadata: Metadata = {
  title: "Smart Generators – Free Online Tools (Discord Timestamps, WhatsApp Links, and More)",
  description: "Smart Generators is a hub of free, privacy-first online tools like Discord Timestamp Generator and WhatsApp Link Generator. No signup, no ads.",
  keywords: [
    "free online tools",
    "discord timestamp generator", 
    "whatsapp link generator",
    "privacy-first tools",
    "no signup tools",
    "online generators",
    "timestamp converter",
    "chat link creator"
  ],
  authors: [{ name: "Smart Generators" }],
  creator: "Smart Generators",
  publisher: "Smart Generators",
  robots: "index, follow",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://smartgenerators.dev",
    title: "Smart Generators – Free Online Tools",
    description: "Hub of free, privacy-first online tools like Discord Timestamp Generator and WhatsApp Link Generator. No signup, no ads.",
    siteName: "Smart Generators",
  },
  twitter: {
    card: "summary_large_image",
    title: "Smart Generators – Free Online Tools",
    description: "Hub of free, privacy-first online tools like Discord Timestamp Generator and WhatsApp Link Generator. No signup, no ads.",
  },
  alternates: {
    canonical: "https://smartgenerators.dev",
  },
  icons: {
    icon: "/logo.png",
    apple: "/logo.png",
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              name: "Smart Generators",
              description: "Hub of free, privacy-first online tools for everyday problems",
              url: "https://smartgenerators.dev",
              logo: "https://smartgenerators.dev/logo.png",
              potentialAction: {
                "@type": "SearchAction",
                target: {
                  "@type": "EntryPoint",
                  urlTemplate: "https://smartgenerators.dev/?q={search_term_string}"
                },
                "query-input": "required name=search_term_string"
              },
              mainEntity: [
                {
                  "@type": "SoftwareApplication",
                  name: "Discord Timestamp Generator",
                  description: "Generate Discord timestamp codes, preview times in UTC/local, decode Snowflake IDs",
                  url: "https://smartgenerators.dev/discord-timestamp",
                  applicationCategory: "UtilitiesApplication",
                  operatingSystem: "Any",
                  offers: {
                    "@type": "Offer",
                    price: "0",
                    priceCurrency: "USD"
                  }
                },
                {
                  "@type": "SoftwareApplication", 
                  name: "Chat Link Generator",
                  description: "Create WhatsApp, Telegram, Messenger & Discord deep links with optional QR codes",
                  url: "https://smartgenerators.dev/chat-link-generator",
                  applicationCategory: "UtilitiesApplication",
                  operatingSystem: "Any",
                  offers: {
                    "@type": "Offer",
                    price: "0",
                    priceCurrency: "USD"
                  }
                },
                {
                  "@type": "SoftwareApplication",
                  name: "Add to Calendar Link Generator",
                  description: "Create calendar links and downloadable .ics files for Google, Outlook, Apple Calendar, and more",
                  url: "https://smartgenerators.dev/add-to-calendar",
                  applicationCategory: "UtilitiesApplication",
                  operatingSystem: "Any",
                  offers: {
                    "@type": "Offer",
                    price: "0",
                    priceCurrency: "USD"
                  }
                },
                {
                  "@type": "SoftwareApplication",
                  name: "Countdown Timer Generator",
                  description: "Create free countdown timers for events, launches, exams, or streams with shareable links",
                  url: "https://smartgenerators.dev/countdown",
                  applicationCategory: "UtilitiesApplication",
                  operatingSystem: "Any",
                  offers: {
                    "@type": "Offer",
                    price: "0",
                    priceCurrency: "USD"
                  }
                }
              ]
            })
          }}
        />
        <script defer data-domain="smartgenerators.dev" src="https://plausible.io/js/script.js"></script>
      </head>
      <body className={inter.className}>{children}</body>
    </html>
  )
}