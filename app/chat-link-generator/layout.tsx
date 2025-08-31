import type { Metadata } from "next"
import type React from "react"

export const metadata: Metadata = {
  title: "WhatsApp Link Generator (Click to Chat) – Telegram, Messenger & Discord | Free Tool",
  description:
    "Create WhatsApp click-to-chat links, Telegram deep links, Messenger m.me links, and Discord invites. Free, fast, no signup. Generate QR codes and shareable links instantly.",
  keywords:
    "WhatsApp link generator, click to chat, Telegram deep links, Messenger m.me links, Discord invites, QR code generator, chat links, messaging links",
  authors: [{ name: "Smart Generators" }],
  creator: "Smart Generators",
  publisher: "Smart Generators",
  robots: "index, follow",
  openGraph: {
    title: "WhatsApp Link Generator (Click to Chat) – Telegram, Messenger & Discord | Free Tool",
    description:
      "Create WhatsApp click-to-chat links, Telegram deep links, Messenger m.me links, and Discord invites. Free, fast, no signup.",
    type: "website",
    locale: "en_US",
    url: "https://smartgenerators.dev/chat-link-generator",
    siteName: "Smart Generators",
  },
  twitter: {
    card: "summary_large_image",
    title: "WhatsApp Link Generator (Click to Chat) – Telegram, Messenger & Discord | Free Tool",
    description:
      "Create WhatsApp click-to-chat links, Telegram deep links, Messenger m.me links, and Discord invites. Free, fast, no signup.",
  },
  alternates: {
    canonical: "/chat-link-generator",
  },
}

export default function ChatLinkGeneratorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
