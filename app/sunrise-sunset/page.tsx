/**
 * Sunrise/Sunset Calculator - Search page
 * Allows users to search and select cities for sunrise/sunset times
 */

"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { searchCities, getFeaturedCities, formatCityName, type City } from "@/lib/cities"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { SiteHeader } from "@/components/ui/site-header"
import FeedbackForm from "@/components/ui/feedback-form"

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
      <SiteHeader />

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
      </main>
    </div>
  )
}
