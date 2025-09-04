import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Countdown Timer View – Shareable Live Countdown Display | Smart Generators",
  description:
    "View live countdown timers from shared links. Clean, distraction-free countdown display perfect for events, launches, and deadlines.",
  keywords: [
    "countdown view",
    "shared countdown",
    "live countdown timer",
    "countdown display",
    "event countdown view",
    "shareable timer",
    "countdown link view"
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
    title: "Countdown Timer View – Shareable Live Countdown Display",
    description:
      "View live countdown timers from shared links. Clean, distraction-free countdown display.",
    url: "https://smartgenerators.dev/countdown/view",
    siteName: "Smart Generators",
    images: [
      {
        url: "https://smartgenerators.dev/placeholder.jpg",
        width: 1200,
        height: 630,
        alt: "Countdown Timer View - Live Display",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Countdown Timer View – Shareable Live Countdown Display",
    description:
      "View live countdown timers from shared links. Clean, distraction-free countdown display.",
    images: ["https://smartgenerators.dev/placeholder.jpg"],
  },
  alternates: {
    canonical: "https://smartgenerators.dev/countdown/view",
  },
  icons: {
    icon: "/logo.png",
    apple: "/logo.png",
  }
}

export default function CountdownViewLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
