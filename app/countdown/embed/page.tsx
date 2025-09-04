"use client"

import type React from "react"
import { useState, useEffect, useCallback } from "react"

/**
 * Countdown Embed Widget - Lightweight embeddable countdown timer
 * Designed for iframe embedding at 360×200px
 */
export default function CountdownEmbed() {
  const [eventName, setEventName] = useState("")
  const [targetDate, setTargetDate] = useState("")
  const [themeMode, setThemeMode] = useState<"light" | "dark">("light")
  
  // Countdown state
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    expired: false
  })
  
  const [isCountdownActive, setIsCountdownActive] = useState(false)

  // Load from URL params
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search)
      const eventParam = urlParams.get("event")
      const dateParam = urlParams.get("date")
      const themeParam = urlParams.get("theme")

      if (eventParam) setEventName(decodeURIComponent(eventParam))
      if (themeParam && (themeParam === "light" || themeParam === "dark")) {
        setThemeMode(themeParam)
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

  return (
    <div className={`h-[200px] w-[360px] overflow-hidden rounded-xl border border-gray-200/50 bg-white shadow-lg ${themeMode === "dark" ? "dark" : ""} dark:border-gray-700/50 dark:bg-gray-900`}>
      <div className="flex h-full flex-col justify-center p-4">
        {!eventName && !isCountdownActive && (
          <h1 className="sr-only">Embeddable Countdown Timer Widget</h1>
        )}
        {/* Event Name */}
        {eventName && (
          <h3 className="mb-3 text-center text-lg font-semibold text-gray-900 dark:text-white">
            {eventName}
          </h3>
        )}
        
        {/* Countdown Display */}
        {isCountdownActive ? (
          timeLeft.expired ? (
            <div className="text-center">
              <div className="text-xl font-bold text-green-600 dark:text-green-400">
                ✅ Event Started!
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-4 gap-2 text-center">
              <div className="rounded-lg bg-gradient-to-br from-blue-50 to-indigo-50 p-3 shadow-sm dark:from-blue-900/30 dark:to-indigo-900/30">
                <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
                  {timeLeft.days}
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400">Days</div>
              </div>
              <div className="rounded-lg bg-gradient-to-br from-blue-50 to-indigo-50 p-3 shadow-sm dark:from-blue-900/30 dark:to-indigo-900/30">
                <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
                  {timeLeft.hours}
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400">Hours</div>
              </div>
              <div className="rounded-lg bg-gradient-to-br from-blue-50 to-indigo-50 p-3 shadow-sm dark:from-blue-900/30 dark:to-indigo-900/30">
                <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
                  {timeLeft.minutes}
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400">Min</div>
              </div>
              <div className="rounded-lg bg-gradient-to-br from-blue-50 to-indigo-50 p-3 shadow-sm dark:from-blue-900/30 dark:to-indigo-900/30">
                <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
                  {timeLeft.seconds}
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400">Sec</div>
              </div>
            </div>
          )
        ) : (
          <div className="text-center text-gray-500 dark:text-gray-400">
            Invalid countdown parameters
          </div>
        )}

        {/* Branding */}
        <div className="mt-3 text-center">
          <a 
            href="https://smartgenerators.dev/countdown" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-xs text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400"
          >
            Smart Generators
          </a>
        </div>
      </div>
    </div>
  )
}
