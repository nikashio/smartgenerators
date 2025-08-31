import type { Metadata } from "next"

/**
 * Layout for WhatsApp Click-to-Chat guide blog post
 * Handles SEO metadata for the article
 */
export const metadata: Metadata = {
  title: "WhatsApp Link Generator (Click to Chat) + QR Code — Free, No Signup",
  description: "Create WhatsApp click-to-chat links and QR codes in seconds. Auto-format phone numbers, prefill messages, and track campaigns. Free tool, no signup.",
  alternates: {
    canonical: "https://smartgenerators.dev/blog/whatsapp-link-generator-click-to-chat-guide"
  },
  openGraph: {
    type: "article",
    url: "https://smartgenerators.dev/blog/whatsapp-link-generator-click-to-chat-guide",
    title: "WhatsApp Link Generator (Click to Chat) + QR Code — Free",
    description: "Build WhatsApp links and QR codes in seconds. No signup.",
    images: [
      {
        url: "https://smartgenerators.dev/placeholder.jpg",
        width: 1200,
        height: 630,
        alt: "WhatsApp Link Generator – Free"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "WhatsApp Link Generator (Click to Chat) + QR Code — Free",
    description: "Build WhatsApp links and QR codes in seconds. No signup.",
    images: ["https://smartgenerators.dev/placeholder.jpg"],
  }
}

export default function BlogPostLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
