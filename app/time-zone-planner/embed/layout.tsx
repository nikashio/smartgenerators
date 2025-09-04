import { Metadata } from "next"

/**
 * Layout for Time Zone Meeting Planner embed widget
 * Provides metadata for embeddable planner widget
 */
export const metadata: Metadata = {
  title: "Meeting Planner Widget – Time Zone Meeting Planner | Smart Generators",
  description:
    "Embeddable meeting planner widget for websites. Show meeting times across time zones.",
  keywords: [
    "meeting planner widget",
    "embeddable time zone planner",
    "meeting scheduler widget", 
    "timezone meeting embed",
  ],
  authors: [{ name: "Smart Generators" }],
  creator: "Smart Generators",
  publisher: "Smart Generators",
  robots: {
    index: false,
    follow: false,
  },
  icons: {
    icon: "/logo.png",
    apple: "/logo.png",
  }
}

export default function TimeZonePlannerEmbedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
