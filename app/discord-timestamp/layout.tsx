import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Discord Timestamp Generator – Dynamic Time Displays | Free",
  description:
    "Free Discord timestamp generator – create dynamic timestamps that show relative time (like '2 minutes ago') or exact dates. Perfect for events, reminders, and scheduling in Discord servers.",
  keywords: [
    "Discord timestamp generator", "Discord timestamps", "Discord time formatting", "Discord <t:", 
    "relative time Discord", "Discord event timestamps", "Discord date formatting", "Unix timestamp Discord",
    "Discord time converter", "Discord bot timestamps", "Discord markdown time", "Discord relative time"
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
    title: "Discord Timestamp Generator – Dynamic Time Displays | Free",
    description:
      "Free Discord timestamp generator – create dynamic timestamps that show relative time (like '2 minutes ago') or exact dates. Perfect for events, reminders, and scheduling in Discord servers.",
    url: "https://smartgenerators.dev/discord-timestamp",
    siteName: "Smart Generators",
    images: [
      {
        url: "https://smartgenerators.dev/og-discord-timestamp.png",
        width: 1200,
        height: 630,
        alt: "Discord Timestamp Generator Tool",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Discord Timestamp Generator – Dynamic Time Displays | Free",
    description:
      "Free Discord timestamp generator – create dynamic timestamps that show relative time (like '2 minutes ago') or exact dates. Perfect for events, reminders, and scheduling in Discord servers.",
    images: ["https://smartgenerators.dev/og-discord-timestamp.png"],
  },
  alternates: {
    canonical: "https://smartgenerators.dev/discord-timestamp",
  },
}

export default function DiscordTimestampLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
