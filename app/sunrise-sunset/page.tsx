/**
 * Sunrise/Sunset Calculator - Search page
 * Allows users to search and select cities for sunrise/sunset times
 */

"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { searchCities, getFeaturedCities, formatCityName, type City } from "@/lib/cities"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { SiteHeader } from "@/components/ui/site-header"
import FeedbackForm from "@/components/ui/feedback-form"
import ToolHeader from "@/components/ui/tool-header"

export default function SunriseSunsetPage() {
  const [query, setQuery] = useState("")
  const [searchResults, setSearchResults] = useState<City[]>([])
  const router = useRouter()

  const featuredCities = getFeaturedCities()

  const handleSearch = (searchQuery: string) => {
    setQuery(searchQuery)
    if (searchQuery.trim()) {
      const results = searchCities(searchQuery, 10)
      setSearchResults(results)
    } else {
      setSearchResults([])
    }
  }

  const navigateToCity = (city: City) => {
    router.push(`/sunrise-sunset/${city.slug}`)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 dark:from-gray-950 dark:via-gray-900 dark:to-blue-950">
      <ToolHeader />

      <main className="mx-auto max-w-4xl px-4 py-8">
        {/* Hero Section */}
        <div className="mb-12 text-center">
          <h1 className="mb-4 text-4xl font-bold text-gray-900 dark:text-white">
            <span className="bg-gradient-to-r from-orange-500 to-yellow-500 bg-clip-text text-transparent">
              Sunrise & Sunset
            </span>{" "}
            Calculator
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-gray-600 dark:text-gray-300">
            Get precise sunrise, sunset, and golden hour times for any city. 
            Download calendar files or subscribe to daily updates.
          </p>
        </div>

        {/* Search Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="text-2xl">🔍</span>
              Search Cities
            </CardTitle>
            <CardDescription>
              Find sunrise and sunset times for your location
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Input
                type="text"
                placeholder="Search for a city (e.g., New York, London, Tokyo)..."
                value={query}
                onChange={(e) => handleSearch(e.target.value)}
                className="text-lg"
              />

              {/* Search Results */}
              {searchResults.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Search Results
                  </h3>
                  <div className="grid gap-2">
                    {searchResults.map((city) => (
                      <Button
                        key={city.slug}
                        variant="outline"
                        onClick={() => navigateToCity(city)}
                        className="justify-start h-auto p-3"
                      >
                        <div className="text-left">
                          <div className="font-medium">{city.name}</div>
                          <div className="text-sm text-gray-500">
                            {city.country} • {city.timezone}
                          </div>
                        </div>
                      </Button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Featured Cities */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="text-2xl">⭐</span>
              Popular Cities
            </CardTitle>
            <CardDescription>
              Quick access to frequently searched locations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {featuredCities.map((city) => (
                <Button
                  key={city.slug}
                  variant="outline"
                  onClick={() => navigateToCity(city)}
                  className="justify-start h-auto p-4"
                >
                  <div className="text-left">
                    <div className="font-medium">{city.name}</div>
                    <div className="text-sm text-gray-500">
                      {city.country}
                    </div>
                  </div>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Features Section */}
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          <div className="text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-100 to-yellow-100 dark:from-orange-900/30 dark:to-yellow-900/30 mx-auto">
              <span className="text-2xl">🌅</span>
            </div>
            <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">
              Precise Times
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Get exact sunrise, sunset, and golden hour times for any location
            </p>
          </div>

          <div className="text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 mx-auto">
              <span className="text-2xl">📅</span>
            </div>
            <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">
              Calendar Export
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Download .ics files or subscribe to daily sunrise/sunset updates
            </p>
          </div>

          <div className="text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 mx-auto">
              <span className="text-2xl">🌍</span>
            </div>
            <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">
              Global Coverage
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Support for thousands of cities worldwide with accurate timezone handling
            </p>
          </div>
        </div>

        {/* Feedback Section */}
        <section className="mt-12">
          <FeedbackForm toolName="Sunrise & Sunset Calculator" defaultCollapsed={true} />
        </section>

        {/* Call-to-Action Footer */}
        <div className="mt-16 pt-8 border-t border-gray-200 dark:border-gray-700">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              More Planning Tools
            </h2>
            <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              While you're planning around sunrise and sunset times, you might also need these other tools for your events and schedules.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Link
              href="/add-to-calendar"
              className="block p-4 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg hover:shadow-md transition-all group"
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg">📅</span>
                <span className="font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400">
                  Add to Calendar
                </span>
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Shareable event links
              </p>
            </Link>

            <Link
              href="/countdown"
              className="block p-4 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg hover:shadow-md transition-all group"
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg">⏰</span>
                <span className="font-semibold text-gray-900 dark:text-white group-hover:text-green-600 dark:group-hover:text-green-400">
                  Countdown Timer
                </span>
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Event countdowns
              </p>
            </Link>

            <Link
              href="/time-zone-planner"
              className="block p-4 bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-900/20 dark:to-violet-900/20 rounded-lg hover:shadow-md transition-all group"
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg">🌍</span>
                <span className="font-semibold text-gray-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400">
                  Time Zone Planner
                </span>
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Multi-timezone events
              </p>
            </Link>

            <Link
              href="/chat-link-generator"
              className="block p-4 bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 rounded-lg hover:shadow-md transition-all group"
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg">💬</span>
                <span className="font-semibold text-gray-900 dark:text-white group-hover:text-orange-600 dark:group-hover:text-orange-400">
                  WhatsApp Link
                </span>
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Quick messaging
              </p>
            </Link>
          </div>

          <div className="text-center mt-8">
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-yellow-500 text-white rounded-lg hover:from-orange-600 hover:to-yellow-600 transition-all font-medium shadow-md hover:shadow-lg"
            >
              <span className="text-lg">🏠</span>
              <span>Explore All Tools</span>
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}
