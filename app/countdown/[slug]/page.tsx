"use client"

import type React from "react"
import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { notFound, useSearchParams } from "next/navigation"
import { getEventBySlug, type SeasonalEvent } from "@/lib/seasonal-events"
import { useToast } from "@/hooks/use-toast"

// Helper function to get event-specific information
function getEventInfo(event: SeasonalEvent): string {
  const eventInfoMap: Record<string, string> = {
    "christmas-2025": "It is celebrated worldwide as both a religious holiday and a cultural event, with traditions including gift-giving, festive meals, decorations, and gatherings with loved ones.",
    "new-year-2026": "New Year's Eve is a time for reflection, resolutions, and celebration as people worldwide welcome fresh beginnings and new opportunities.",
    "valentines-day-2026": "Valentine's Day celebrates romance, love, and affection between intimate companions, with traditions of giving flowers, chocolates, and heartfelt gifts.",
    "halloween-2025": "Halloween is celebrated with trick-or-treating, costume parties, haunted houses, and spooky decorations as people embrace the fun and frightening side of the holiday.",
    "thanksgiving-2025": "Thanksgiving is a cherished American holiday that brings families together for gratitude, traditional feasts featuring turkey, and creating lasting memories.",
    "easter-2026": "Easter celebrates the resurrection of Jesus Christ and marks the end of Lent for Christians worldwide, with traditions including egg hunts and family gatherings.",
    "ramadan-2026": "Ramadan is the ninth month of the Islamic calendar, observed by Muslims worldwide as a sacred month of fasting, prayer, reflection, and community.",
    "eid-al-fitr-2026": "Eid al-Fitr marks the end of Ramadan with joyous celebrations, special prayers, family gatherings, gift-giving, and acts of charity.",
    "diwali-2025": "Diwali, the Festival of Lights, is one of the most important Hindu celebrations, symbolizing the victory of light over darkness with oil lamps, fireworks, and sweets.",
    "hanukkah-2025": "Hanukkah commemorates the rededication of the Second Temple in Jerusalem and celebrates the miracle of oil with the lighting of the menorah and traditional foods.",
    "super-bowl-2026": "The Super Bowl is the biggest sporting event in America, featuring the NFL championship game, spectacular halftime shows, and memorable commercials watched by over 100 million viewers.",
    "olympics-2028": "The Summer Olympics bring together the world's greatest athletes for two weeks of inspiring competition, record-breaking performances, and unforgettable moments.",
    "world-cup-2026": "The FIFA World Cup is the world's most watched sporting event, showcasing the best football talent from every continent in the ultimate global celebration.",
    "uefa-euro-2028": "UEFA Euro is Europe's premier football championship, featuring the continent's best national teams in a month-long celebration of football excellence.",
    "black-friday-2025": "Black Friday kicks off the holiday shopping season with massive discounts, doorbusters deals, and limited-time offers across retailers worldwide.",
    "cyber-monday-2025": "Cyber Monday is the biggest online shopping day of the year, featuring exclusive digital deals, flash sales, and deep discounts on electronics and software.",
    "prime-day-2026": "Amazon Prime Day offers Prime members exclusive access to thousands of lightning deals, deep discounts, and special launches across all product categories.",
    "iphone-17-launch": "Apple's annual September event showcases the latest iPhone innovations, featuring cutting-edge technology, camera improvements, and design updates.",
    "taylor-swift-tour-2026": "Taylor Swift's tours are cultural phenomena featuring spectacular productions, surprise songs, and career-spanning setlists for millions of Swifties worldwide.",
    "coachella-2026": "Coachella is an iconic music and arts festival in the California desert, known for its diverse lineup, fashion, celebrity sightings, and art installations."
  }
  
  return eventInfoMap[event.slug] || "This event brings people together for celebration and creates lasting memories."
}

interface Props {
  params: Promise<{ slug: string }>
}

/**
 * Public SEO-friendly countdown page for seasonal events
 * Example: /countdown/christmas-2025
 */
export default function PublicCountdownPage({ params }: Props) {
  const searchParams = useSearchParams()
  const isEmbed = searchParams.get('embed') === '1'
  
  const [event, setEvent] = useState<SeasonalEvent | null>(null)
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    expired: false
  })
  const [embedCode, setEmbedCode] = useState("")
  const [shareUrl, setShareUrl] = useState("")
  const [copySuccess, setCopySuccess] = useState("")
  const [isDarkMode, setIsDarkMode] = useState(false)

  const { toast } = useToast()

  // Initialize event data
  useEffect(() => {
    const initializeEvent = async () => {
      const { slug } = await params
      const eventData = getEventBySlug(slug)
      if (!eventData) {
        notFound()
        return
      }
      setEvent(eventData)

      // Generate share and embed code
      const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://smartgenerators.dev'
      const viewer = `${baseUrl}/countdown/view?event=${encodeURIComponent(eventData.name)}&date=${encodeURIComponent(eventData.date)}&theme=${isDarkMode ? 'dark' : 'light'}`
      setShareUrl(viewer)
      const embed = `<iframe src="${baseUrl}/countdown/${eventData.slug}?embed=1" width="400" height="200" frameborder="0" style="border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.1);"></iframe>`
      setEmbedCode(embed)

      // Theme detection
      if (typeof window !== 'undefined') {
        const savedTheme = localStorage.getItem("theme")
        const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches
        
        if (savedTheme === "dark" || (!savedTheme && systemPrefersDark)) {
          setIsDarkMode(true)
          document.documentElement.classList.add("dark")
        } else {
          setIsDarkMode(false)
          document.documentElement.classList.remove("dark")
        }
      }
    }

    initializeEvent()
  }, [params])

  // Calculate time left
  const calculateTimeLeft = useCallback(() => {
    if (!event) return

    const target = new Date(event.date)
    const now = new Date()
    const difference = target.getTime() - now.getTime()

    if (difference <= 0) {
      setTimeLeft({
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0,
        expired: true
      })
      return
    }

    const days = Math.floor(difference / (1000 * 60 * 60 * 24))
    const hours = Math.floor((difference / (1000 * 60 * 60)) % 24)
    const minutes = Math.floor((difference / 1000 / 60) % 60)
    const seconds = Math.floor((difference / 1000) % 60)

    setTimeLeft({
      days,
      hours,
      minutes,
      seconds,
      expired: false
    })
  }, [event])

  // Update countdown every second
  useEffect(() => {
    if (!event) return

    calculateTimeLeft()
    const interval = setInterval(calculateTimeLeft, 1000)
    return () => clearInterval(interval)
  }, [event, calculateTimeLeft])

  // Copy to clipboard
  const copyToClipboard = async (text: string, type: string) => {
    if (!text) return

    try {
      await navigator.clipboard.writeText(text)
      setCopySuccess(type)
      setTimeout(() => setCopySuccess(""), 2000)
      toast({
        title: "Copied!",
        description: `${type} copied to clipboard`,
      })
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to copy to clipboard",
        variant: "destructive",
      })
    }
  }

  // Toggle theme
  const toggleTheme = () => {
    const newTheme = !isDarkMode
    setIsDarkMode(newTheme)
    localStorage.setItem("theme", newTheme ? "dark" : "light")

    if (newTheme) {
      document.documentElement.classList.add("dark")
    } else {
      document.documentElement.classList.remove("dark")
    }
  }

  // Add structured data
  useEffect(() => {
    if (!event || typeof window === 'undefined') return

    const structuredData = {
      "@context": "https://schema.org",
      "@type": "Event",
      "name": event.name,
      "description": event.description,
      "startDate": event.date,
      "url": `https://smartgenerators.dev/countdown/${event.slug}`,
      "eventStatus": "https://schema.org/EventScheduled",
      "organizer": {
        "@type": "Organization",
        "name": "Smart Generators",
        "url": "https://smartgenerators.dev"
      }
    }

    const faqStructuredData = {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": [
        {
          "@type": "Question",
          "name": `How many days until ${event.name}?`,
          "acceptedAnswer": {
            "@type": "Answer",
            "text": `Our countdown shows the exact number of days, hours, minutes, and seconds left until ${new Date(event.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}.`
          }
        },
        {
          "@type": "Question",
          "name": "Can I embed this countdown on my website?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": `Yes! Use the embed code provided on this page to display the live countdown to ${event.name} on your site or blog.`
          }
        },
        {
          "@type": "Question",
          "name": "Does the countdown work worldwide?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Yes. The countdown is timezone-aware, so it works no matter where you are."
          }
        },
        {
          "@type": "Question",
          "name": "What happens when the countdown ends?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": `When ${event.name} arrives, the countdown will display "${event.emoji} ${getEndMessage(event.name)}!"`
          }
        }
      ]
    }

    const script1 = document.createElement('script')
    script1.type = 'application/ld+json'
    script1.textContent = JSON.stringify(structuredData)
    document.head.appendChild(script1)

    const script2 = document.createElement('script')
    script2.type = 'application/ld+json'
    script2.textContent = JSON.stringify(faqStructuredData)
    document.head.appendChild(script2)

    return () => {
      if (script1.parentNode) script1.parentNode.removeChild(script1)
      if (script2.parentNode) script2.parentNode.removeChild(script2)
    }
  }, [event])

  // Helper function to get event-specific end message
  function getEndMessage(eventName: string): string {
    const endMessageMap: Record<string, string> = {
      "Christmas 2025": "Merry Christmas 2025",
      "New Year 2026": "Happy New Year 2026",
      "Valentine's Day 2026": "Happy Valentine's Day 2026",
      "Halloween 2025": "Happy Halloween 2025",
      "Thanksgiving 2025": "Happy Thanksgiving 2025",
      "Easter 2026": "Happy Easter 2026",
      "Ramadan 2026": "Ramadan Mubarak 2026",
      "Eid al-Fitr 2026": "Eid Mubarak 2026",
      "Diwali 2025": "Happy Diwali 2025",
      "Hanukkah 2025": "Happy Hanukkah 2025",
      "Super Bowl LX 2026": "Super Bowl LX Has Started",
      "Olympics 2028 Los Angeles": "Olympics 2028 Has Begun",
      "FIFA World Cup 2026": "World Cup 2026 Has Kicked Off",
      "UEFA Euro 2028": "Euro 2028 Has Started",
      "Black Friday 2025": "Black Friday Deals Are Live",
      "Cyber Monday 2025": "Cyber Monday Deals Are Live",
      "Amazon Prime Day 2026": "Prime Day Deals Are Live",
      "iPhone 17 Launch": "iPhone 17 Is Here",
      "Taylor Swift Tour 2026": "Taylor Swift Tour Has Started",
      "Coachella 2026": "Coachella 2026 Has Begun",
      "Independence Day 2025": "Happy Independence Day 2025",
      "Lunar New Year 2026": "Happy Lunar New Year 2026",
      "Mardi Gras 2026": "Happy Mardi Gras 2026",
      "St. Patrick's Day 2026": "Happy St. Patrick's Day 2026",
      "Cinco de Mayo 2026": "Happy Cinco de Mayo 2026",
      "Wimbledon 2026": "Wimbledon 2026 Has Started",
      "Tour de France 2026": "Tour de France 2026 Has Begun",
      "Back to School 2025": "Back to School 2025 Is Here",
      "Samsung Galaxy S26 Launch": "Galaxy S26 Is Here",
      "Burning Man 2025": "Burning Man 2025 Has Started"
    };
    
    const eventKey = eventName.split(' ')[0].toLowerCase();
    for (const key in endMessageMap) {
      if (key.toLowerCase().includes(eventKey)) {
        return endMessageMap[key];
      }
    }
    return `${eventName} Has Started`;
  }

  if (!event) {
    return <div>Loading...</div>
  }

  // Embed view - minimal layout
  if (isEmbed) {
    return (
      <div className="min-h-[200px] bg-gradient-to-br from-gray-50 via-white to-blue-50 dark:from-gray-950 dark:via-gray-900 dark:to-blue-950 p-4">
        <div className="text-center">
          {/* Event Title */}
          <h3 className="mb-4 text-xl font-bold text-gray-900 dark:text-white">
            {event.emoji} {event.name}
          </h3>

          {/* Countdown Display */}
          {timeLeft.expired ? (
            <div className="font-bold text-green-600 text-2xl">
              ✅ {event.name} Started!
            </div>
          ) : (
            <div className="grid grid-cols-4 gap-2 mb-4">
              <div className="bg-white/80 dark:bg-gray-800/80 rounded-lg p-2 shadow-md">
                <div className="font-bold text-xl text-gray-900 dark:text-white">{timeLeft.days}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Days</div>
              </div>
              <div className="bg-white/80 dark:bg-gray-800/80 rounded-lg p-2 shadow-md">
                <div className="font-bold text-xl text-gray-900 dark:text-white">{timeLeft.hours}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Hours</div>
              </div>
              <div className="bg-white/80 dark:bg-gray-800/80 rounded-lg p-2 shadow-md">
                <div className="font-bold text-xl text-gray-900 dark:text-white">{timeLeft.minutes}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Minutes</div>
              </div>
              <div className="bg-white/80 dark:bg-gray-800/80 rounded-lg p-2 shadow-md">
                <div className="font-bold text-xl text-gray-900 dark:text-white">{timeLeft.seconds}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Seconds</div>
              </div>
            </div>
          )}

                    {/* Powered by link */}
          <div className="text-sm text-black dark:text-white">
            <a
              href="https://smartgenerators.dev"
              target="_blank"
              rel="noopener noreferrer"
              className="text-black dark:text-white hover:text-blue-600 dark:hover:text-blue-400"
            >
              Powered by SmartGenerators.dev
            </a>
          </div>
        </div>
      </div>
    )
  }

  // Full page view
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 dark:from-gray-950 dark:via-gray-900 dark:to-blue-950">
      <div className="mx-auto max-w-6xl px-4 py-12">
        {/* Header */}
        <header className="relative mb-12 text-center">
          <div className="mb-6">
            <Link href="/" className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-blue-50 to-indigo-50 px-4 py-2 text-sm font-medium text-black dark:text-white transition-colors hover:from-blue-100 hover:to-indigo-100 dark:from-blue-900/20 dark:to-indigo-900/20">
              <span className="text-lg">⏳</span>
              Smart Generators
            </Link>
          </div>

          {/* Theme Toggle */}
          <div className="absolute top-0 right-0">
            <button
              onClick={toggleTheme}
              className="h-10 w-10 rounded-full border border-gray-200/50 bg-white/80 text-sm backdrop-blur-sm transition-all hover:bg-gray-50 hover:shadow-md dark:border-gray-700/50 dark:bg-gray-900/80 dark:hover:bg-gray-800"
              aria-label={`Switch to ${isDarkMode ? "light" : "dark"} mode`}
            >
              <span className="sr-only">{isDarkMode ? "Switch to light mode" : "Switch to dark mode"}</span>
              <span role="img" aria-hidden="true">{isDarkMode ? "🌙" : "☀️"}</span>
            </button>
          </div>
          
          <h1 className="mb-6 text-5xl font-bold tracking-tight sm:text-6xl lg:text-7xl">
            <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
              Countdown to {event.name}
            </span>
            <span className="block text-3xl sm:text-4xl lg:text-5xl text-gray-900 dark:text-white">{event.emoji}</span>
          </h1>

          <p className="mx-auto mb-8 max-w-2xl text-2xl text-gray-600 dark:text-gray-300">
            {event.description}
          </p>
        </header>

        <main>
          {/* Countdown Display */}
          <section className="mb-12 rounded-3xl border border-gray-200/50 bg-white/80 p-8 shadow-2xl shadow-gray-900/5 backdrop-blur-sm dark:border-gray-700/50 dark:bg-gray-900/80 dark:shadow-black/20">
            <div className="text-center">
              {timeLeft.expired ? (
                <div className="font-bold text-green-600 text-5xl mb-4">
                  ✅ {event.name} Started!
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 mb-8">
                  <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl p-6 text-white shadow-lg">
                    <div className="tabular-nums font-bold text-4xl sm:text-5xl">{timeLeft.days}</div>
                    <div className="text-blue-100 text-lg">Day{timeLeft.days !== 1 ? 's' : ''}</div>
                  </div>
                  <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl p-6 text-white shadow-lg">
                    <div className="tabular-nums font-bold text-4xl sm:text-5xl">{timeLeft.hours}</div>
                    <div className="text-blue-100 text-lg">Hour{timeLeft.hours !== 1 ? 's' : ''}</div>
                  </div>
                  <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl p-6 text-white shadow-lg">
                    <div className="tabular-nums font-bold text-4xl sm:text-5xl">{timeLeft.minutes}</div>
                    <div className="text-blue-100 text-lg">Minute{timeLeft.minutes !== 1 ? 's' : ''}</div>
                  </div>
                  <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl p-6 text-white shadow-lg">
                    <div className="tabular-nums font-bold text-4xl sm:text-5xl">{timeLeft.seconds}</div>
                    <div className="text-blue-100 text-lg">Second{timeLeft.seconds !== 1 ? 's' : ''}</div>
                  </div>
                </div>
              )}

              <div className="space-y-4">
                {/* Share URL */}
                <div className="rounded-xl border border-blue-200/50 bg-blue-50/50 p-4 dark:border-blue-800/30 dark:bg-blue-900/10">
                  <h3 className="font-semibold text-lg text-blue-900 dark:text-blue-100 mb-3">Share this countdown</h3>
                  <div className="flex gap-2">
                    <div className="flex-1 rounded-lg border border-blue-200 bg-white px-3 py-2.5 dark:border-blue-700/50 dark:bg-gray-800">
                      <code className="block break-all text-base text-black dark:text-white font-medium">
                        {shareUrl}
                      </code>
                    </div>
                    <button
                      onClick={() => copyToClipboard(shareUrl, "URL")}
                      className={`flex items-center gap-2 rounded-lg px-4 py-2.5 font-medium text-lg transition-all ${
                        copySuccess === "URL"
                          ? "bg-green-600 text-white"
                          : "bg-blue-600 text-white hover:bg-blue-700"
                      }`}
                    >
                      {copySuccess === "URL" ? "Copied!" : "Copy"}
                    </button>
                  </div>
                </div>

                {/* Embed Code */}
                <div className="rounded-xl border border-purple-200/50 bg-purple-50/50 p-4 dark:border-purple-800/30 dark:bg-purple-900/10">
                  <h3 className="font-semibold text-lg text-purple-900 dark:text-purple-100 mb-3">Embed on your website</h3>
                  <div className="flex gap-2">
                    <div className="flex-1 rounded-lg border border-purple-200 bg-white p-3 dark:border-purple-700/50 dark:bg-gray-800">
                      <code className="block break-all text-base leading-relaxed text-black dark:text-white font-medium">
                        {embedCode}
                      </code>
                    </div>
                    <button
                      onClick={() => copyToClipboard(embedCode, "Embed")}
                      className={`flex items-center gap-2 rounded-lg px-4 py-2.5 font-medium text-lg transition-all ${
                        copySuccess === "Embed"
                          ? "bg-green-600 text-white"
                          : "bg-purple-600 text-white hover:bg-purple-700"
                      }`}
                    >
                      {copySuccess === "Embed" ? "Copied!" : "Copy"}
                    </button>
                  </div>
                </div>

                {/* Create Your Own */}
                <div className="pt-4">
                  <Link
                    href="/countdown"
                    className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-3 font-semibold text-lg text-white transition-all hover:from-blue-700 hover:to-indigo-700 hover:shadow-lg"
                  >
                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                    </svg>
                    Create Your Own Countdown
                  </Link>
                </div>
              </div>
            </div>
          </section>

          {/* Intro Content */}
          <section className="mb-12 rounded-3xl border border-gray-200/50 bg-white/80 p-8 shadow-2xl shadow-gray-900/5 backdrop-blur-sm dark:border-gray-700/50 dark:bg-gray-900/80 dark:shadow-black/20">
            <div className="prose prose-gray max-w-none dark:prose-invert">
              <p className="text-xl text-gray-700 dark:text-gray-300 mb-4">
                {event.name} is just around the corner! Use our free countdown timer to track exactly how many days, hours, minutes, and seconds remain until {event.name}. {event.description}
              </p>
            </div>
          </section>

          {/* Event Info */}
          <section className="mb-12 rounded-3xl border border-gray-200/50 bg-white/80 p-8 shadow-2xl shadow-gray-900/5 backdrop-blur-sm dark:border-gray-700/50 dark:bg-gray-900/80 dark:shadow-black/20">
            <h2 className="mb-6 text-3xl font-bold text-gray-900 dark:text-white">📅 When is {event.name}?</h2>
            <div className="prose prose-gray max-w-none dark:prose-invert">
              <p className="text-lg text-gray-700 dark:text-gray-300">
                {event.name} falls on <strong>{new Date(event.date).toLocaleDateString('en-US', {
                  weekday: 'long',
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric'
                })}</strong>. {getEventInfo(event)}
              </p>
            </div>
          </section>

          {/* Share/Embed Info */}
          <section className="mb-12 rounded-3xl border border-gray-200/50 bg-white/80 p-8 shadow-2xl shadow-gray-900/5 backdrop-blur-sm dark:border-gray-700/50 dark:bg-gray-900/80 dark:shadow-black/20">
            <h2 className="mb-6 text-3xl font-bold text-gray-900 dark:text-white">🔗 Share or Embed the {event.name} Countdown</h2>
            <div className="prose prose-gray max-w-none dark:prose-invert">
              <p className="text-lg text-gray-700 dark:text-gray-300 mb-4">
                Want to share this countdown with friends or add it to your website?
              </p>
              <ul className="text-lg text-gray-700 dark:text-gray-300">
                <li><strong>Copy link:</strong> Share the dedicated live countdown viewer link above.</li>
                <li><strong>Embed widget:</strong> Paste our simple iframe code into your blog, website, or forum.</li>
              </ul>
            </div>
          </section>

          {/* FAQ Section */}
          <section className="rounded-3xl border border-gray-200/50 bg-white/80 p-8 shadow-2xl shadow-gray-900/5 backdrop-blur-sm dark:border-gray-700/50 dark:bg-gray-900/80 dark:shadow-black/20">
            <h2 className="mb-6 text-3xl font-bold text-gray-900 dark:text-white">Frequently Asked Questions</h2>
            <div className="space-y-4">
              <details className="rounded-xl border border-gray-200/50 p-4 transition-all hover:shadow-md dark:border-gray-700/50 dark:hover:bg-gray-800/50">
                <summary className="cursor-pointer font-semibold text-lg text-gray-900 hover:text-blue-600 dark:text-white dark:hover:text-blue-400">
                  How many days until {event.name}?
                </summary>
                <p className="mt-2 text-lg text-gray-700 dark:text-gray-300">
                  Our countdown shows the exact number of days, hours, minutes, and seconds left until {new Date(event.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}.
                </p>
              </details>

              <details className="rounded-xl border border-gray-200/50 p-4 transition-all hover:shadow-md dark:border-gray-700/50 dark:hover:bg-gray-800/50">
                <summary className="cursor-pointer font-semibold text-lg text-gray-900 hover:text-blue-600 dark:text-white dark:hover:text-blue-400">
                  Can I embed this countdown on my website?
                </summary>
                <p className="mt-2 text-lg text-gray-700 dark:text-gray-300">
                  Yes! Use the embed code provided above to display the live countdown to {event.name} on your site or blog.
                </p>
              </details>

              <details className="rounded-xl border border-gray-200/50 p-4 transition-all hover:shadow-md dark:border-gray-700/50 dark:hover:bg-gray-800/50">
                <summary className="cursor-pointer font-semibold text-lg text-gray-900 hover:text-blue-600 dark:text-white dark:hover:text-blue-400">
                  Does the countdown work worldwide?
                </summary>
                <p className="mt-2 text-lg text-gray-700 dark:text-gray-300">
                  Yes. The countdown is timezone-aware, so it works no matter where you are.
                </p>
              </details>

              <details className="rounded-xl border border-gray-200/50 p-4 transition-all hover:shadow-md dark:border-gray-700/50 dark:hover:bg-gray-800/50">
                <summary className="cursor-pointer font-semibold text-lg text-gray-900 hover:text-blue-600 dark:text-white dark:hover:text-blue-400">
                  What happens when the countdown ends?
                </summary>
                <p className="mt-2 text-lg text-gray-700 dark:text-gray-300">
                  When {event.name} arrives, the countdown will display "{event.emoji} ${getEndMessage(event.name)}!"
                </p>
              </details>
            </div>
          </section>
        </main>

        {/* Footer */}
        <footer className="mt-12 rounded-3xl border border-gray-200/50 bg-white/80 p-6 shadow-xl shadow-gray-900/5 backdrop-blur-sm dark:border-gray-700/50 dark:bg-gray-900/80 dark:shadow-black/20">
          <div className="space-y-4 text-center">
            <div className="flex flex-wrap justify-center gap-4 text-base">
              <Link href="/" className="text-black hover:text-blue-800 dark:text-white dark:hover:text-blue-300">
                Smart Generators Home
              </Link>
              <span className="text-gray-500">•</span>
              <Link href="/countdown" className="text-black hover:text-blue-800 dark:text-white dark:hover:text-blue-300">
                Create Custom Countdown
              </Link>
              <span className="text-gray-500">•</span>
              <Link href="/discord-timestamp" className="text-black hover:text-blue-800 dark:text-white dark:hover:text-blue-300">
                Discord Timestamps
              </Link>
            </div>
            <p className="text-base text-gray-500 dark:text-gray-400">
              Built with ❤️ by Smart Generators
            </p>
          </div>
        </footer>
      </div>
    </div>
  )
}
