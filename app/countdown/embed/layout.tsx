import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Countdown Embed Widget – Embeddable Timer for Websites",
  description:
    "Embeddable countdown timer widget for websites. Lightweight 360x200px iframe widget with customizable themes. Perfect for events, launches, and deadlines.",
  keywords: [
    "countdown embed",
    "embeddable countdown",
    "countdown widget",
    "iframe countdown",
    "website countdown timer",
    "embed countdown timer",
    "countdown iframe widget"
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
    title: "Countdown Embed Widget – Embeddable Timer for Websites",
    description:
      "Embeddable countdown timer widget for websites. Lightweight 360x200px iframe widget with customizable themes.",
    url: "https://smartgenerators.dev/countdown/embed",
    siteName: "Smart Generators",
    images: [
      {
        url: "https://smartgenerators.dev/placeholder.jpg",
        width: 1200,
        height: 630,
        alt: "Countdown Timer Embed Widget",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Countdown Embed Widget – Embeddable Timer for Websites",
    description:
      "Embeddable countdown timer widget for websites. Lightweight 360x200px iframe widget.",
    images: ["https://smartgenerators.dev/placeholder.jpg"],
  },
  alternates: {
    canonical: "https://smartgenerators.dev/countdown/embed",
  },
  icons: {
    icon: "/logo.png",
    apple: "/logo.png",
  }
}

export default function CountdownEmbedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
