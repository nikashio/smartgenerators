import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Add to Calendar Link Generator – Google, Outlook, Apple | Free Tool",
  description:
    "Free Add to Calendar link generator. Create Google, Outlook, Yahoo links and downloadable .ics files with reminders, attendees, and recurrence – privacy-first.",
  keywords: [
    "add to calendar",
    "calendar link generator",
    "Google Calendar link",
    "Outlook calendar link",
    ".ics generator",
    "download ics",
    "create calendar event",
    "recurring event rrule",
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
    title: "Add to Calendar Link Generator – Google, Outlook, Apple | Free Tool",
    description:
      "Create multi-calendar links and .ics files with reminders and recurrence. 100% free and browser-based.",
    url: "https://smartgenerators.dev/add-to-calendar",
    siteName: "Smart Generators",
    images: [
      {
        url: "https://smartgenerators.dev/og-add-to-calendar.png",
        width: 1200,
        height: 630,
        alt: "Add to Calendar Link Generator",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Add to Calendar Link Generator – Google, Outlook, Apple | Free Tool",
    description:
      "Generate Google/Outlook/Yahoo links and .ics files with recurrence and reminders.",
    images: ["https://smartgenerators.dev/og-add-to-calendar.png"],
  },
  alternates: {
    canonical: "https://smartgenerators.dev/add-to-calendar",
  },
}

export default function AddToCalendarLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}


