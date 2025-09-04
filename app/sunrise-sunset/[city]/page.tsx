/**
 * City-specific sunrise/sunset page
 * Shows today's times, monthly view, and calendar export options
 */

import { Metadata } from "next"
import { notFound } from "next/navigation"
import Link from "next/link"
import { findCityBySlug, formatCityName, getFeaturedCities, getRelatedCities, generateCityContent, getNearbyPopularCities } from "@/lib/cities"
import { getTodayTimes, getCurrentMonthTimes, formatTime, formatDate, getMonthName } from "@/lib/sun-times"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import ToolHeader from "@/components/ui/tool-header"
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

  // Generate unique city content
  const cityContent = generateCityContent(city)

  // Get nearby cities for internal linking
  const nearbyCities = getNearbyPopularCities(city.slug, 1500, 6)
  
  // Format today's date
  const today = new Date()
  const todayFormatted = formatDate(today, city.timezone)

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 dark:from-gray-950 dark:via-gray-900 dark:to-blue-950">
      <ToolHeader />

      <main className="mx-auto max-w-4xl px-4 py-8">
        {/* City Header */}
        <div className="mb-8 text-center">
          <div className="mb-4">
            <nav className="inline-flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
              <Link 
                href="/sunrise-sunset"
                className="hover:text-orange-600 dark:hover:text-orange-400 transition-colors"
              >
                Sunrise Calculator
              </Link>
              <span>•</span>
              <span className="text-orange-600 dark:text-orange-400 font-medium">{city.name}</span>
            </nav>
          </div>
          
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
          
          {/* Quick city links */}
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            {getRelatedCities(city.slug, 4).map((quickCity) => (
              <Link
                key={quickCity.slug}
                href={`/sunrise-sunset/${quickCity.slug}`}
                className="px-3 py-1 text-xs bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-full hover:bg-orange-100 dark:hover:bg-orange-900/30 hover:text-orange-700 dark:hover:text-orange-300 transition-colors"
              >
                {quickCity.name}
              </Link>
            ))}
          </div>
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

        {/* Popular Cities Section - Enhanced with more cities */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Other Major Cities
              </h2>
              <p className="text-gray-600 dark:text-gray-300">
                Explore sunrise and sunset times in other popular destinations
              </p>
            </div>
            <Link
              href="/sunrise-sunset"
              className="inline-flex items-center gap-2 px-4 py-2 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 rounded-lg hover:bg-orange-200 dark:hover:bg-orange-900/50 transition-colors font-medium"
            >
              <span className="text-lg">🔍</span>
              <span>Search All Cities</span>
            </Link>
          </div>
          
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {getRelatedCities(city.slug, 8).map((relatedCity) => (
              <Link
                key={relatedCity.slug}
                href={`/sunrise-sunset/${relatedCity.slug}`}
                className="block p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-orange-300 dark:hover:border-orange-600 hover:shadow-md transition-all group"
              >
                <div className="font-medium text-gray-900 dark:text-white group-hover:text-orange-600 dark:group-hover:text-orange-400 mb-1">
                  {relatedCity.name}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {relatedCity.country}
                </div>
              </Link>
            ))}
          </div>
          
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Looking for a different city? Use our search to find sunrise and sunset times for any location worldwide.
            </p>
            <Link
              href="/sunrise-sunset"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-yellow-500 text-white rounded-lg hover:from-orange-600 hover:to-yellow-600 transition-all font-medium shadow-md hover:shadow-lg"
            >
              <span className="text-lg">🌍</span>
              <span>Browse All Cities</span>
            </Link>
          </div>
        </div>

          <div className="space-y-8">
                      <div className="prose max-w-none dark:prose-invert">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              About Sunrise & Sunset Times in {city.name}
            </h2>

            {/* City-specific intro paragraph */}
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              {cityContent.introParagraph}
            </p>

            {/* Unique fact about the city */}
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg mb-6 border-l-4 border-blue-500">
              <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2">
                🌟 Did you know?
              </h3>
              <p className="text-blue-800 dark:text-blue-200">
                {cityContent.uniqueFact}
              </p>
            </div>

            {/* Activity suggestion */}
            <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg mb-6 border-l-4 border-green-500">
              <h3 className="text-lg font-semibold text-green-900 dark:text-green-100 mb-2">
                📸 Pro Tip
              </h3>
              <p className="text-green-800 dark:text-green-200">
                {cityContent.activitySuggestion}
              </p>
            </div>

            {/* Seasonal note if available */}
            {cityContent.seasonalNote && (
              <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg mb-6 border-l-4 border-orange-500">
                <h3 className="text-lg font-semibold text-orange-900 dark:text-orange-100 mb-2">
                  📅 Seasonal Note
                </h3>
                <p className="text-orange-800 dark:text-orange-200">
                  {cityContent.seasonalNote}
                </p>
              </div>
            )}

            {/* General information about the calculator */}
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
                  How do I subscribe on Apple Calendar?
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Click the "Subscribe" button to open the calendar URL in Apple Calendar on Mac, or copy
                  the subscription link and add it manually in Calendar settings on iPhone/iPad. Go to
                  Settings &gt; Calendar &gt; Accounts &gt; Add Account &gt; Other &gt; Add CalDAV Account and paste the URL.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">
                  Can I use these times offline?
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Yes! Once you download the .ics calendar file, all the sunrise and sunset times are stored 
                  locally in your calendar app and work completely offline. Downloaded files contain up to 
                  365 days of data, so you can access the times even without an internet connection.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">
                  What's the difference between sunrise, sunset, golden hour, and blue hour?
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  <strong>Sunrise/Sunset:</strong> When the sun appears/disappears on the horizon. 
                  <strong>Golden Hour:</strong> The hour after sunrise and before sunset with warm, soft light 
                  perfect for photography. <strong>Blue Hour:</strong> The twilight period when the sky has a 
                  deep blue color, occurring just before sunrise and after sunset.
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
                  It typically lasts about 1 hour and provides the most flattering natural light.
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
                  1-2 minutes. They account for your city's exact location, timezone, and elevation. 
                  Actual times may vary slightly due to weather conditions and atmospheric refraction.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">
                  Why do sunrise and sunset times change throughout the year?
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Sunrise and sunset times change due to Earth's tilt and orbit around the sun. During summer, 
                  days are longer with earlier sunrises and later sunsets. In winter, the opposite occurs. 
                  The exact changes depend on your location's latitude.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">
                  Do these times account for Daylight Saving Time?
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Yes, all times are automatically adjusted for Daylight Saving Time based on your city's 
                  timezone. The calendar files include proper timezone information so your calendar app 
                  will display the correct local times year-round.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Nearby Cities Section */}
        {nearbyCities.length > 0 && (
          <div className="mt-16 pt-8 border-t border-gray-200 dark:border-gray-700">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                🌍 Nearby Cities
              </h2>
              <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                Explore sunrise and sunset times in cities near {city.name}.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-8">
              {nearbyCities.map((nearbyCity) => (
                <Link
                  key={nearbyCity.slug}
                  href={`/sunrise-sunset/${nearbyCity.slug}`}
                  className="block p-4 bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-800 dark:to-blue-900/20 rounded-lg hover:shadow-md transition-all group border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600"
                >
                  <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 mb-1">
                    {nearbyCity.name}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    {nearbyCity.country}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Check sunrise & sunset times
                  </p>
                </Link>
              ))}
            </div>

            <div className="text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Looking for cities in a different region? Use our comprehensive search.
              </p>
              <Link
                href="/sunrise-sunset"
                className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-sm font-medium"
              >
                <span className="text-lg">🔍</span>
                <span>Search All Cities</span>
              </Link>
            </div>
          </div>
        )}

        {/* Call-to-Action Footer */}
        <div className="mt-16 pt-8 border-t border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8 text-center">
            More Tools for Your Event Planning
          </h2>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <div className="group">
              <Link
                href="/add-to-calendar"
                className="block p-6 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl hover:shadow-lg transition-all duration-300"
              >
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-2xl">📅</span>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    Add to Calendar
                  </h3>
                </div>
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  Create shareable calendar links for events, meetings, and appointments. Perfect for planning sunrise photoshoots!
                </p>
              </Link>
            </div>

            <div className="group">
              <Link
                href="/countdown"
                className="block p-6 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl hover:shadow-lg transition-all duration-300"
              >
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-2xl">⏰</span>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">
                    Countdown Timer
                  </h3>
                </div>
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  Create countdown timers for events, deadlines, or golden hour moments. Great for photographers and event planners.
                </p>
              </Link>
            </div>

            <div className="group">
              <Link
                href="/time-zone-planner"
                className="block p-6 bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-900/20 dark:to-violet-900/20 rounded-xl hover:shadow-lg transition-all duration-300"
              >
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-2xl">🌍</span>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                    Time Zone Planner
                  </h3>
                </div>
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  Plan events across time zones and coordinate sunrise/sunset times for international teams or photo shoots.
                </p>
              </Link>
            </div>

            <div className="group">
              <Link
                href="/chat-link-generator"
                className="block p-6 bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 rounded-xl hover:shadow-lg transition-all duration-300"
              >
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-2xl">💬</span>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">
                    WhatsApp Link
                  </h3>
                </div>
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  Generate clickable WhatsApp links for event coordination and quick communication with your team.
                </p>
              </Link>
            </div>

            <div className="group">
              <Link
                href="/discord-timestamp"
                className="block p-6 bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-indigo-900/20 dark:to-blue-900/20 rounded-xl hover:shadow-lg transition-all duration-300"
              >
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-2xl">🔗</span>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    Discord Timestamp
                  </h3>
                </div>
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  Create Discord timestamps for event scheduling and time-sensitive announcements in your community.
                </p>
              </Link>
            </div>

            <div className="text-center pt-4">
              <Link
                href="/"
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-gray-800 to-gray-900 dark:from-gray-100 dark:to-gray-200 text-white dark:text-gray-900 rounded-lg hover:shadow-lg transition-all duration-300 font-medium"
              >
                <span className="text-lg">🏠</span>
                <span>View All Tools</span>
              </Link>
            </div>
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
                    "text": "Download the .ics file and import it into Google Calendar, or use the subscribe link to automatically sync daily updates. The subscribe link will keep your calendar up to date."
                  }
                },
                {
                  "@type": "Question",
                  "name": "How do I subscribe on Apple Calendar?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Click the Subscribe button to open the calendar URL in Apple Calendar on Mac, or copy the subscription link and add it manually in Calendar settings on iPhone/iPad. Go to Settings > Calendar > Accounts > Add Account > Other > Add CalDAV Account and paste the URL."
                  }
                },
                {
                  "@type": "Question",
                  "name": "Can I use these times offline?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Yes! Once you download the .ics calendar file, all the sunrise and sunset times are stored locally in your calendar app and work completely offline. Downloaded files contain up to 365 days of data."
                  }
                },
                {
                  "@type": "Question",
                  "name": "What's the difference between sunrise, sunset, golden hour, and blue hour?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Sunrise/Sunset: When the sun appears/disappears on the horizon. Golden Hour: The hour after sunrise and before sunset with warm, soft light perfect for photography. Blue Hour: The twilight period when the sky has a deep blue color, occurring just before sunrise and after sunset."
                  }
                },
                {
                  "@type": "Question", 
                  "name": "What is golden hour?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Golden hour is the period shortly after sunrise and before sunset when the sun is low in the sky, creating warm, soft lighting ideal for photography. It typically lasts about 1 hour and provides the most flattering natural light."
                  }
                },
                {
                  "@type": "Question",
                  "name": "How accurate are these times?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Times are calculated using precise astronomical algorithms and are accurate to within 1-2 minutes. They account for your city's exact location, timezone, and elevation. Actual times may vary slightly due to weather conditions."
                  }
                },
                {
                  "@type": "Question",
                  "name": "Why do sunrise and sunset times change throughout the year?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Sunrise and sunset times change due to Earth's tilt and orbit around the sun. During summer, days are longer with earlier sunrises and later sunsets. In winter, the opposite occurs. The exact changes depend on your location's latitude."
                  }
                },
                {
                  "@type": "Question",
                  "name": "Do these times account for Daylight Saving Time?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Yes, all times are automatically adjusted for Daylight Saving Time based on your city's timezone. The calendar files include proper timezone information so your calendar app will display the correct local times year-round."
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
