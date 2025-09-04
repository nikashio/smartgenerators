/**
 * City-specific sunrise/sunset page
 * Shows today's times, monthly view, and calendar export options
 */

import { Metadata } from "next"
import { notFound } from "next/navigation"
import Link from "next/link"
import { findCityBySlug, formatCityName, getFeaturedCities } from "@/lib/cities"
import { getTodayTimes, getCurrentMonthTimes, formatTime, formatDate, getMonthName } from "@/lib/sun-times"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { SiteHeader } from "@/components/ui/site-header"
import { CalendarSubscribeButton } from "@/components/ui/calendar-subscribe-button"

interface PageProps {
  params: {
    city: string
  }
}

// Generate static params for featured cities
export async function generateStaticParams() {
  const featuredCities = getFeaturedCities()
  return featuredCities.map((city) => ({
    city: city.slug
  }))
}

// Enable dynamic params for other cities
export const dynamicParams = true

// Revalidate daily
export const revalidate = 86400

// Generate metadata
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { city: citySlug } = await params
  const city = findCityBySlug(citySlug)
  
  if (!city) {
    return {
      title: "City Not Found - Sunrise & Sunset Calculator",
      description: "The requested city was not found."
    }
  }

  const cityName = formatCityName(city)
  
  return {
    title: `${city.name} Sunrise & Sunset Times | Smart Generators`,
    description: `Today's sunrise, sunset, and golden hour times in ${cityName}. Download ICS calendar files or subscribe to daily updates. Free solar time calculator.`,
    keywords: [
      `${city.name} sunrise sunset`,
      `${city.name} golden hour`,
      `${city.name} solar times`,
      "sunrise calculator",
      "sunset calculator",
      "golden hour calculator",
      "solar time calculator",
      "calendar export ICS"
    ],
    openGraph: {
      title: `${city.name} Sunrise & Sunset Times`,
      description: `Get precise sunrise, sunset, and golden hour times for ${cityName}. Free solar calculator with calendar export.`,
      type: "website",
      siteName: "Smart Generators"
    },
    twitter: {
      card: "summary",
      title: `${city.name} Sunrise & Sunset Times`,
      description: `Get precise sunrise, sunset, and golden hour times for ${cityName}. Free solar calculator.`
    },
    alternates: {
      canonical: `https://smartgenerators.dev/sunrise-sunset/${city.slug}`
    }
  }
}

export default async function CityPage({ params }: PageProps) {
  const { city: citySlug } = await params
  const city = findCityBySlug(citySlug)
  
  if (!city) {
    notFound()
  }

  // Get today's times
  const todayTimes = getTodayTimes(city.lat, city.lng, city.timezone)
  
  // Get current month times
  const monthTimes = getCurrentMonthTimes(city.lat, city.lng, city.timezone)
  
  // Format today's date
  const today = new Date()
  const todayFormatted = formatDate(today, city.timezone)

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 dark:from-gray-950 dark:via-gray-900 dark:to-blue-950">
      <SiteHeader 
        showBackLink={true}
        backHref="/sunrise-sunset"
        backText="← Search Cities"
      />

      <main className="mx-auto max-w-4xl px-4 py-8">
        {/* City Header */}
        <div className="mb-8 text-center">
          <h1 className="mb-2 text-4xl font-bold text-gray-900 dark:text-white">
            <span className="bg-gradient-to-r from-orange-500 to-yellow-500 bg-clip-text text-transparent">
              Sunrise & Sunset
            </span>{" "}
            in {city.name}
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            {city.country} • {city.timezone}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {todayFormatted}
          </p>
        </div>

        {/* Today's Times */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="text-2xl">🌅</span>
              Today's Times
            </CardTitle>
            <CardDescription>
              Sunrise, sunset, and golden hour times for today
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-lg bg-gradient-to-br from-orange-50 to-yellow-50 p-4 dark:from-orange-900/20 dark:to-yellow-900/20">
                <div className="text-2xl mb-2">🌅</div>
                <div className="text-sm font-medium text-gray-600 dark:text-gray-400">Sunrise</div>
                <div className="text-xl font-bold text-gray-900 dark:text-white">
                  {formatTime(todayTimes.sunrise, city.timezone)}
                </div>
              </div>
              
              <div className="rounded-lg bg-gradient-to-br from-amber-50 to-orange-50 p-4 dark:from-amber-900/20 dark:to-orange-900/20">
                <div className="text-2xl mb-2">✨</div>
                <div className="text-sm font-medium text-gray-600 dark:text-gray-400">Golden Hour (AM)</div>
                <div className="text-xl font-bold text-gray-900 dark:text-white">
                  {formatTime(todayTimes.goldenHourMorning.start, city.timezone)} - {formatTime(todayTimes.goldenHourMorning.end, city.timezone)}
                </div>
              </div>
              
              <div className="rounded-lg bg-gradient-to-br from-yellow-50 to-amber-50 p-4 dark:from-yellow-900/20 dark:to-amber-900/20">
                <div className="text-2xl mb-2">🌟</div>
                <div className="text-sm font-medium text-gray-600 dark:text-gray-400">Golden Hour (PM)</div>
                <div className="text-xl font-bold text-gray-900 dark:text-white">
                  {formatTime(todayTimes.goldenHourEvening.start, city.timezone)} - {formatTime(todayTimes.goldenHourEvening.end, city.timezone)}
                </div>
              </div>
              
              <div className="rounded-lg bg-gradient-to-br from-red-50 to-orange-50 p-4 dark:from-red-900/20 dark:to-orange-900/20">
                <div className="text-2xl mb-2">🌇</div>
                <div className="text-sm font-medium text-gray-600 dark:text-gray-400">Sunset</div>
                <div className="text-xl font-bold text-gray-900 dark:text-white">
                  {formatTime(todayTimes.sunset, city.timezone)}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Calendar Actions */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="text-2xl">📅</span>
              Calendar Export
            </CardTitle>
            <CardDescription>
              Download or subscribe to sunrise/sunset times
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Sunrise & Sunset Downloads */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
                  🌅 Sunrise & Sunset Times
                </h3>
                <div className="flex flex-wrap gap-3">
                  <Button asChild>
                    <Link href={`/api/sun/sunrise-sunset/${city.slug}?range=month`}>
                      Download This Month (.ics)
                    </Link>
                  </Button>
                  <Button variant="outline" asChild>
                    <Link href={`/api/sun/sunrise-sunset/${city.slug}?range=year`}>
                      Download This Year (.ics)
                    </Link>
                  </Button>
                  <CalendarSubscribeButton href={`/api/sun/sunrise-sunset/${city.slug}?days=365`}>
                    Subscribe (365 days)
                  </CalendarSubscribeButton>
                </div>
              </div>

              {/* Golden Hour Downloads */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
                  ✨ Golden Hour Times
                </h3>
                <div className="flex flex-wrap gap-3">
                  <Button asChild variant="secondary">
                    <Link href={`/api/sun/golden-hour/${city.slug}?range=month`}>
                      Download Golden Hour (Month)
                    </Link>
                  </Button>
                  <Button asChild variant="secondary">
                    <Link href={`/api/sun/golden-hour/${city.slug}?range=year`}>
                      Download Golden Hour (Year)
                    </Link>
                  </Button>
                </div>
              </div>

              {/* Blue Hour Downloads */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
                  🌙 Blue Hour Times
                </h3>
                <div className="flex flex-wrap gap-3">
                  <Button asChild variant="secondary">
                    <Link href={`/api/sun/blue-hour/${city.slug}?range=month`}>
                      Download Blue Hour (Month)
                    </Link>
                  </Button>
                  <Button asChild variant="secondary">
                    <Link href={`/api/sun/blue-hour/${city.slug}?range=year`}>
                      Download Blue Hour (Year)
                    </Link>
                  </Button>
                </div>
              </div>
            </div>

            <p className="mt-6 text-sm text-gray-600 dark:text-gray-400">
              Download .ics files to import into Google Calendar, Outlook, or Apple Calendar.
              The subscribe button will open your calendar app to add a subscription for automatic updates.
              Golden hour and blue hour calendars are perfect for photographers and outdoor enthusiasts.
            </p>
          </CardContent>
        </Card>

        {/* Monthly View */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="text-2xl">📊</span>
              {getMonthName(monthTimes.month)} {monthTimes.year}
            </CardTitle>
            <CardDescription>
              Daily sunrise and sunset times for this month
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="p-3 text-left font-medium text-gray-700 dark:text-gray-300">Date</th>
                    <th className="p-3 text-left font-medium text-gray-700 dark:text-gray-300">Sunrise</th>
                    <th className="p-3 text-left font-medium text-gray-700 dark:text-gray-300">Golden Hour (AM)</th>
                    <th className="p-3 text-left font-medium text-gray-700 dark:text-gray-300">Golden Hour (PM)</th>
                    <th className="p-3 text-left font-medium text-gray-700 dark:text-gray-300">Sunset</th>
                  </tr>
                </thead>
                <tbody>
                  {monthTimes.days.map((dayTimes, index) => {
                    const day = index + 1
                    const isToday = day === today.getDate() && 
                                   monthTimes.month === today.getMonth() + 1 && 
                                   monthTimes.year === today.getFullYear()
                    
                    return (
                      <tr 
                        key={dayTimes.date} 
                        className={`border-b hover:bg-gray-50 dark:hover:bg-gray-800/50 ${
                          isToday ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                        }`}
                      >
                        <td className="p-3 font-medium">{day}</td>
                        <td className="p-3">{formatTime(dayTimes.sunrise, city.timezone)}</td>
                        <td className="p-3 text-sm">
                          {formatTime(dayTimes.goldenHourMorning.start, city.timezone)} - {formatTime(dayTimes.goldenHourMorning.end, city.timezone)}
                        </td>
                        <td className="p-3 text-sm">
                          {formatTime(dayTimes.goldenHourEvening.start, city.timezone)} - {formatTime(dayTimes.goldenHourEvening.end, city.timezone)}
                        </td>
                        <td className="p-3">{formatTime(dayTimes.sunset, city.timezone)}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* SEO Content Section */}
                  {/* Popular Cities Section */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              Popular Cities
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Explore sunrise and sunset times in other major cities around the world
            </p>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {getFeaturedCities()
                .filter(featuredCity => featuredCity.slug !== city.slug)
                .slice(0, 6)
                .map((featuredCity) => (
                  <Link
                    key={featuredCity.slug}
                    href={`/sunrise-sunset/${featuredCity.slug}`}
                    className="block p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-orange-300 dark:hover:border-orange-600 transition-colors group"
                  >
                    <div className="font-medium text-gray-900 dark:text-white group-hover:text-orange-600 dark:group-hover:text-orange-400">
                      {featuredCity.name}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {featuredCity.country}
                    </div>
                  </Link>
                ))}
            </div>
            <div className="mt-6 text-center">
              <Link
                href="/sunrise-sunset"
                className="inline-flex items-center gap-2 text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300 font-medium"
              >
                <span>Search All Cities</span>
                <span className="text-lg">🔍</span>
              </Link>
            </div>
          </div>

          <div className="space-y-8">
            <div className="prose max-w-none dark:prose-invert">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                About Sunrise & Sunset Times in {city.name}
              </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Our free sunrise and sunset calculator provides accurate solar times for {formatCityName(city)}. 
              Whether you're planning photography sessions during golden hour, organizing outdoor activities, 
              or simply curious about daylight patterns, our tool delivers precise calculations based on 
              your city's geographic coordinates and timezone.
            </p>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              The calculator shows today's sunrise and sunset times, golden hour periods for optimal lighting, 
              and provides a full monthly view. You can export these times to your calendar application or 
              subscribe to automatic updates to stay informed about changing daylight patterns throughout the year.
            </p>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Frequently Asked Questions
          </h2>
          
          <div className="space-y-4">
            <Card>
              <CardContent className="pt-6">
                <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">
                  How do I add these times to Google Calendar?
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Download the .ics file and import it into Google Calendar, or use the subscribe link 
                  to automatically sync daily updates. The subscribe link will keep your calendar up to date.
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">
                  What is golden hour?
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Golden hour is the period shortly after sunrise and before sunset when the sun is low 
                  in the sky, creating warm, soft lighting that's ideal for photography and outdoor activities.
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">
                  How accurate are these times?
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Times are calculated using precise astronomical algorithms and are accurate to within 
                  a few minutes. They account for your city's exact location and timezone.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {/* Schema markup */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([
            {
              "@context": "https://schema.org",
              "@type": "SoftwareApplication",
              "name": `${city.name} Sunrise & Sunset Calculator`,
              "description": `Calculate precise sunrise, sunset, and golden hour times for ${formatCityName(city)}. Free solar time calculator with calendar export.`,
              "url": `https://smartgenerators.dev/sunrise-sunset/${city.slug}`,
              "applicationCategory": "UtilitiesApplication",
              "operatingSystem": "Any",
              "browserRequirements": "Requires JavaScript",
              "offers": {
                "@type": "Offer",
                "price": "0",
                "priceCurrency": "USD"
              },
              "creator": {
                "@type": "Organization",
                "name": "Smart Generators",
                "url": "https://smartgenerators.dev"
              },
              "featureList": [
                "Sunrise and sunset times",
                "Golden hour calculations", 
                "Monthly view calendar",
                "ICS calendar export",
                "Calendar subscription"
              ]
            },
            {
              "@context": "https://schema.org",
              "@type": "FAQPage",
              "mainEntity": [
                {
                  "@type": "Question",
                  "name": "How do I add these times to Google Calendar?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Download the .ics file and import it into Google Calendar, or use the subscribe link to automatically sync daily updates."
                  }
                },
                {
                  "@type": "Question", 
                  "name": "What is golden hour?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Golden hour is the period shortly after sunrise and before sunset when the sun is low in the sky, creating warm, soft lighting ideal for photography."
                  }
                },
                {
                  "@type": "Question",
                  "name": "How accurate are these times?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Times are calculated using precise astronomical algorithms and are accurate to within a few minutes, accounting for exact location and timezone."
                  }
                }
              ]
            },
            {
              "@context": "https://schema.org",
              "@type": "Place",
              "name": formatCityName(city),
              "geo": {
                "@type": "GeoCoordinates",
                "latitude": city.lat,
                "longitude": city.lng
              },
              "address": {
                "@type": "PostalAddress",
                "addressCountry": city.country
              }
            }
          ])
        }}
      />
    </div>
  )
}
