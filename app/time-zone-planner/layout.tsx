import { Metadata } from "next"

// Force dynamic rendering for this route segment to avoid SSG on client pages
export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: "Time Zone Meeting Planner – Schedule Across Time Zones | Free Tool",
  description:
    "Free time zone meeting planner. Find overlapping meeting times across multiple time zones, share schedules, and add to calendar – privacy-first tool.",
  keywords: [
    "time zone meeting planner",
    "schedule across time zones",
    "meeting time finder",
    "timezone scheduler",
    "cross-timezone meetings",
    "calendar time zone",
    "meeting coordinator",
    "remote team scheduling",
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
    title: "Time Zone Meeting Planner – Schedule Across Time Zones | Free Tool",
    description:
      "Find the best meeting times across multiple time zones. 100% free and browser-based.",
    url: "https://smartgenerators.dev/time-zone-planner",
    siteName: "Smart Generators",
    images: [
      {
        url: "https://smartgenerators.dev/placeholder.jpg",
        width: 1200,
        height: 630,
        alt: "Time Zone Meeting Planner",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Time Zone Meeting Planner – Schedule Across Time Zones | Free Tool",
    description:
      "Schedule meetings across multiple time zones with ease.",
    images: ["https://smartgenerators.dev/placeholder.jpg"],
  },
  alternates: {
    canonical: "https://smartgenerators.dev/time-zone-planner",
  },
  icons: {
    icon: "/logo.png",
    apple: "/logo.png",
  }
}

export default function TimeZonePlannerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
