import { Metadata } from "next"

/**
 * Layout for Time Zone Meeting Planner shared view page
 * Provides metadata for shared planner links
 */
export const metadata: Metadata = {
  title: "Shared Meeting Planner – Time Zone Scheduler",
  description:
    "View shared meeting times across multiple time zones. Find the perfect meeting time for your team.",
  keywords: [
    "shared meeting planner",
    "time zone meeting times", 
    "team scheduling",
    "cross timezone meeting",
    "meeting time finder",
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
    title: "Shared Meeting Planner – Time Zone Scheduler",
    description:
      "View shared meeting times across multiple time zones.",
    url: "https://smartgenerators.dev/time-zone-planner/view",
    siteName: "Smart Generators",
    images: [
      {
        url: "https://smartgenerators.dev/placeholder.jpg",
        width: 1200,
        height: 630,
        alt: "Shared Meeting Planner",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Shared Meeting Planner – Time Zone Scheduler",
    description:
      "View shared meeting times across multiple time zones.",
    images: ["https://smartgenerators.dev/placeholder.jpg"],
  },
  icons: {
    icon: "/logo.png",
    apple: "/logo.png",
  }
}

export default function TimeZonePlannerViewLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
