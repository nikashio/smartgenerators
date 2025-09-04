"use client"

import type React from "react"
import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import ToolHeader from "@/components/ui/tool-header"

/**
 * Countdown View Page - Clean countdown display for shareable links
 * Shows only the countdown timer without form controls
 */
export default function CountdownView() {
  const [eventName, setEventName] = useState("")
  const [targetDate, setTargetDate] = useState("")
  const [themeMode, setThemeMode] = useState<"light" | "dark">("light")
  const [isDarkMode, setIsDarkMode] = useState(false)
  
  // Countdown state
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    expired: false
  })
  
  const [isCountdownActive, setIsCountdownActive] = useState(false)

  // Load from URL params and initialize
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search)
      const eventParam = urlParams.get("event")
      const dateParam = urlParams.get("date")
      const themeParam = urlParams.get("theme")

      if (eventParam) setEventName(decodeURIComponent(eventParam))
      if (themeParam && (themeParam === "light" || themeParam === "dark")) {
        setThemeMode(themeParam)
        setIsDarkMode(themeParam === "dark")
        if (themeParam === "dark") {
          document.documentElement.classList.add("dark")
        }
      }
      
      if (dateParam) {
        try {
          const parsedDate = new Date(dateParam)
          if (!isNaN(parsedDate.getTime())) {
            setTargetDate(dateParam)
            setIsCountdownActive(true)
          }
        } catch (e) {
          // Invalid date param
        }
      }
    }
  }, [])

  // Calculate time left
  const calculateTimeLeft = useCallback(() => {
    if (!targetDate) return

    const target = new Date(targetDate)
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
  }, [targetDate])

  // Update countdown every second
  useEffect(() => {
    if (!isCountdownActive) return

    calculateTimeLeft()
    const interval = setInterval(calculateTimeLeft, 1000)
    return () => clearInterval(interval)
  }, [isCountdownActive, calculateTimeLeft])

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 dark:from-gray-950 dark:via-gray-900 dark:to-blue-950">
      <ToolHeader />
      <div className="flex min-h-screen items-center justify-center px-4 py-12">
        <div className="w-full max-w-2xl">
          {/* Header */}
          <div className="mb-8 text-center">
            {!eventName && (
              <h1 className="mt-6 text-3xl font-bold text-gray-900 dark:text-white md:text-4xl">
                Live Countdown Timer View
              </h1>
            )}
          </div>

          {/* Theme Toggle */}
          <div className="absolute top-8 right-8">
            <button
              onClick={toggleTheme}
              className="h-10 w-10 rounded-full border border-gray-200/50 bg-white/80 text-sm backdrop-blur-sm transition-all hover:bg-gray-50 hover:shadow-md dark:border-gray-700/50 dark:bg-gray-900/80 dark:hover:bg-gray-800"
              aria-label={`Switch to ${isDarkMode ? "light" : "dark"} mode`}
            >
              <span className="sr-only">{isDarkMode ? "Switch to light mode" : "Switch to dark mode"}</span>
              <span role="img" aria-hidden="true">{isDarkMode ? "🌙" : "☀️"}</span>
            </button>
          </div>

          {/* Main Countdown Card */}
          <div className="rounded-3xl border border-gray-200/50 bg-white/80 p-8 shadow-2xl shadow-gray-900/5 backdrop-blur-sm dark:border-gray-700/50 dark:bg-gray-900/80 dark:shadow-black/20 md:p-12">
            {/* Event Name */}
            {eventName && (
              <h1 className="mb-8 text-center text-3xl font-bold text-gray-900 dark:text-white md:text-4xl">
                {eventName}
              </h1>
            )}
            
            {/* Countdown Display */}
            <div className="rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 p-8 text-center dark:from-blue-900/20 dark:to-indigo-900/20 md:p-12">
              {isCountdownActive ? (
                timeLeft.expired ? (
                  <div className="text-4xl font-bold text-green-600 dark:text-green-400 md:text-5xl">
                    ✅ Event Started!
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
                    <div className="rounded-xl bg-white/80 p-6 shadow-md dark:bg-gray-800/80 md:p-8 flex flex-col items-center justify-center">
                      <div className="tabular-nums text-3xl font-bold text-blue-600 dark:text-blue-400 md:text-4xl lg:text-5xl">
                        {timeLeft.days}
                      </div>
                      <div className="mt-2 text-sm text-gray-600 dark:text-gray-400 md:text-base">
                        Day{timeLeft.days !== 1 ? 's' : ''}
                      </div>
                    </div>
                    <div className="rounded-xl bg-white/80 p-6 shadow-md dark:bg-gray-800/80 md:p-8 flex flex-col items-center justify-center">
                      <div className="tabular-nums text-3xl font-bold text-blue-600 dark:text-blue-400 md:text-4xl lg:text-5xl">
                        {timeLeft.hours}
                      </div>
                      <div className="mt-2 text-sm text-gray-600 dark:text-gray-400 md:text-base">
                        Hour{timeLeft.hours !== 1 ? 's' : ''}
                      </div>
                    </div>
                    <div className="rounded-xl bg-white/80 p-6 shadow-md dark:bg-gray-800/80 md:p-8 flex flex-col items-center justify-center">
                      <div className="tabular-nums text-3xl font-bold text-blue-600 dark:text-blue-400 md:text-4xl lg:text-5xl">
                        {timeLeft.minutes}
                      </div>
                      <div className="mt-2 text-sm text-gray-600 dark:text-gray-400 md:text-base">
                        Minute{timeLeft.minutes !== 1 ? 's' : ''}
                      </div>
                    </div>
                    <div className="rounded-xl bg-white/80 p-6 shadow-md dark:bg-gray-800/80 md:p-8 flex flex-col items-center justify-center">
                      <div className="tabular-nums text-3xl font-bold text-blue-600 dark:text-blue-400 md:text-4xl lg:text-5xl">
                        {timeLeft.seconds}
                      </div>
                      <div className="mt-2 text-sm text-gray-600 dark:text-gray-400 md:text-base">
                        Second{timeLeft.seconds !== 1 ? 's' : ''}
                      </div>
                    </div>
                  </div>
                )
              ) : (
                <div className="text-xl text-gray-500 dark:text-gray-400 md:text-2xl">
                  Invalid countdown parameters
                </div>
              )}
            </div>

            {/* Create Your Own Link */}
            <div className="mt-8 space-y-4 text-center">
              <Link
                href="/countdown"
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-3 font-semibold text-white transition-all hover:from-blue-700 hover:to-indigo-700 hover:shadow-lg hover:shadow-blue-500/25"
              >
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                </svg>
                Create Your Own Countdown
              </Link>
              
              {/* Additional Tools */}
              <div className="flex flex-wrap justify-center gap-3 text-sm">
                <Link href="/discord-timestamp" className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300">
                  Discord Timestamp Generator
                </Link>
                <span className="text-gray-500">•</span>
                <Link href="/chat-link-generator" className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300">
                  Chat Link Generator
                </Link>
                <span className="text-gray-500">•</span>
                <Link href="/add-to-calendar" className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300">
                  Add to Calendar
                </Link>
              </div>
            </div>
          </div>

          {/* Footer */}
          <footer className="mt-8 text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Built with ❤️ by{" "}
              <Link href="/" className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300">
                Smart Generators
              </Link>
            </p>
          </footer>
        </div>
      </div>
    </div>
  )
}
