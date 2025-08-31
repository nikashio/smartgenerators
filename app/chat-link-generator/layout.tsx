import type { Metadata } from "next"
import type React from "react"

export const metadata: Metadata = {
  title: "WhatsApp Link Generator (Click to Chat) – Telegram, Messenger & Discord | Free Tool",
  description:
    "Free WhatsApp link generator – create click‑to‑chat links for WhatsApp, Telegram, Messenger and Discord with QR codes, no signup required. Generate messaging links instantly.",
  keywords: [
    "WhatsApp link generator",
    "click to chat",
    "WhatsApp chat link",
    "Telegram deep links",
    "Messenger m.me links", 
    "Discord invites",
    "QR code generator",
    "chat links",
    "messaging links",
    "wa.me generator",
    "telegram bot links",
    "facebook messenger links"
  ],
  authors: [{ name: "Smart Generators" }],
  creator: "Smart Generators",
  publisher: "Smart Generators",
  robots: "index, follow",
  openGraph: {
    title: "WhatsApp Link Generator (Click to Chat) – Telegram, Messenger & Discord | Free Tool",
    description:
      "Free WhatsApp link generator – create click‑to‑chat links for WhatsApp, Telegram, Messenger and Discord with QR codes, no signup required.",
    type: "website",
    locale: "en_US",
    url: "https://smartgenerators.dev/chat-link-generator",
    siteName: "Smart Generators",
    images: [
      {
        url: "https://smartgenerators.dev/og-chat-link-generator.png",
        width: 1200,
        height: 630,
        alt: "Chat Link Generator Tool for WhatsApp, Telegram, Messenger & Discord",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "WhatsApp Link Generator (Click to Chat) – Telegram, Messenger & Discord | Free Tool",
    description:
      "Free WhatsApp link generator – create click‑to‑chat links for WhatsApp, Telegram, Messenger and Discord with QR codes, no signup required.",
    images: ["https://smartgenerators.dev/og-chat-link-generator.png"],
  },
  alternates: {
    canonical: "https://smartgenerators.dev/chat-link-generator",
  },
}

export default function ChatLinkGeneratorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
