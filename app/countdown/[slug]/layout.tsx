import type { Metadata } from "next"
import { getEventBySlug } from "@/lib/seasonal-events"
import { notFound } from "next/navigation"

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const event = getEventBySlug(slug)
  
  if (!event) {
    return {
      title: "Event Not Found",
      description: "This countdown event could not be found."
    }
  }

  const title = `Countdown to ${event.name} ${event.emoji} – Free Timer`
  const description = event.metaDescription
  const url = `https://smartgenerators.dev/countdown/${event.slug}`

  return {
    title,
    description,
    keywords: event.keywords.join(", "),
    authors: [{ name: "Smart Generators" }],
    creator: "Smart Generators",
    publisher: "Smart Generators",
    robots: "index, follow",
    openGraph: {
      title,
      description,
      url,
      siteName: "Smart Generators",
      type: "website",
      images: [
        {
          url: "https://smartgenerators.dev/placeholder.jpg",
          width: 1200,
          height: 630,
          alt: `Countdown to ${event.name}`
        }
      ]
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["https://smartgenerators.dev/placeholder.jpg"],
      creator: "@smartgenerators"
    },
    alternates: {
      canonical: url
    }
  }
}

export default function CountdownEventLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
