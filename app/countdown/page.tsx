"use client"

import type React from "react"
import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"
import FeedbackForm from "@/components/ui/feedback-form"
import ToolHeader from "@/components/ui/tool-header"

/**
 * Countdown Timer Generator - Create shareable countdown timers for events
 * Features: Live countdown, shareable links, embeddable widgets, social sharing
 */
export default function CountdownGenerator() {
  const [eventName, setEventName] = useState("")
  const [targetDate, setTargetDate] = useState("")
  const [targetTime, setTargetTime] = useState("")
  const [timezone, setTimezone] = useState("")
  const [themeMode, setThemeMode] = useState<"light" | "dark">("light")
  const [isDarkMode, setIsDarkMode] = useState(false)
  
  // Advanced configuration options
  const [style, setStyle] = useState<"horizontal" | "vertical" | "compact">("horizontal")
  const [size, setSize] = useState<"small" | "medium" | "large">("medium")
  const [cornerRadius, setCornerRadius] = useState<"none" | "small" | "medium" | "large">("medium")
  const [textColor, setTextColor] = useState("#ffffff")
  const [backgroundColor, setBackgroundColor] = useState("#3b82f6")
  const [isReflective, setIsReflective] = useState(false)
  const [isTransparent, setIsTransparent] = useState(false)
  const [showTenths, setShowTenths] = useState(false)
  const [hideDateTitle, setHideDateTitle] = useState(false)
  const [countUp, setCountUp] = useState(false)
  const [textAlignment, setTextAlignment] = useState<"left" | "center" | "right">("center")
  const [textEffect, setTextEffect] = useState<"none" | "shadow" | "glow" | "gradient">("none")
  const [language, setLanguage] = useState("en")
  const [repeatOption, setRepeatOption] = useState<"none" | "daily" | "weekly" | "monthly" | "yearly">("none")
  const [showDays, setShowDays] = useState(true)
  const [showHours, setShowHours] = useState(true)
  const [showMinutes, setShowMinutes] = useState(true)
  const [showSeconds, setShowSeconds] = useState(true)
  
  // Countdown state
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    expired: false
  })
  
  const [generatedLink, setGeneratedLink] = useState("")
  const [embedCode, setEmbedCode] = useState("")
  const [copySuccess, setCopySuccess] = useState("")
  const [isCountdownActive, setIsCountdownActive] = useState(false)

  const { toast } = useToast()

  // Initialize theme and detect timezone
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Theme initialization
      const savedTheme = localStorage.getItem("theme")
      const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches

      if (savedTheme === "dark" || (!savedTheme && systemPrefersDark)) {
        setIsDarkMode(true)
        setThemeMode("dark")
        document.documentElement.classList.add("dark")
      } else {
        setIsDarkMode(false)
        setThemeMode("light")
        document.documentElement.classList.remove("dark")
      }

      // Auto-detect timezone
      const detectedTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone
      setTimezone(detectedTimezone)

      // Set default date to tomorrow
      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)
      tomorrow.setHours(18, 0, 0, 0) // 6 PM
      
      const localDate = new Date(tomorrow.getTime() - tomorrow.getTimezoneOffset() * 60000)
        .toISOString().slice(0, 10)
      const localTime = "18:00"
      
      setTargetDate(localDate)
      setTargetTime(localTime)

      // Load from URL params if present
      const urlParams = new URLSearchParams(window.location.search)
      const eventParam = urlParams.get("event")
      const dateParam = urlParams.get("date")
      const tzParam = urlParams.get("tz")
      const themeParam = urlParams.get("theme")

      if (eventParam) setEventName(decodeURIComponent(eventParam))
      if (tzParam) setTimezone(tzParam)
      if (themeParam && (themeParam === "light" || themeParam === "dark")) {
        setThemeMode(themeParam)
      }
      
      if (dateParam) {
        try {
          const parsedDate = new Date(dateParam)
          if (!isNaN(parsedDate.getTime())) {
            const localDateTime = new Date(parsedDate.getTime() - parsedDate.getTimezoneOffset() * 60000)
              .toISOString().slice(0, 16)
            const [datePart, timePart] = localDateTime.split('T')
            setTargetDate(datePart)
            setTargetTime(timePart)
            setIsCountdownActive(true)
          }
        } catch (e) {
          // Invalid date param, use defaults
        }
      }

      // Add structured data
      const structuredData = {
        "@context": "https://schema.org",
        "@type": "SoftwareApplication",
        "name": "Countdown Timer Generator",
        "description": "Create free countdown timers for events, launches, exams, or streams. Generate shareable links and embeddable widgets with no signup required.",
        "url": "https://smartgenerators.dev/countdown",
        "applicationCategory": "UtilitiesApplication",
        "operatingSystem": "Any",
        "browserRequirements": "Requires JavaScript",
        "offers": {
          "@type": "Offer",
          "price": "0",
          "priceCurrency": "USD"
        },
        "featureList": [
          "Event countdown timer creation",
          "Shareable countdown links",
          "Embeddable countdown widgets",
          "Social media sharing",
          "Timezone support",
          "Custom event naming",
          "Real-time countdown updates",
          "No registration required",
          "Privacy-focused local processing"
        ],
        "creator": {
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
            "name": "How do I share my countdown timer?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Copy the generated link which includes all your countdown settings (event name, date, timezone, theme). Anyone can view your countdown by visiting this link."
            }
          },
          {
            "@type": "Question",
            "name": "Can I embed the timer on my website?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Yes! Copy the iframe embed code and paste it into your website's HTML. The countdown widget is 360×200 pixels and works on any website."
            }
          },
          {
            "@type": "Question",
            "name": "What happens after the countdown ends?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "When the countdown reaches zero, it displays '✅ Event Started!' message. The timer stops counting and shows the completion status."
            }
          },
          {
            "@type": "Question",
            "name": "Does this work offline?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Yes, once loaded, the countdown timer continues running locally in your browser even without an internet connection."
            }
          }
        ]
      }

      // Add structured data scripts
      const script1 = document.createElement('script')
      script1.type = 'application/ld+json'
      script1.textContent = JSON.stringify(structuredData)
      document.head.appendChild(script1)

      const script2 = document.createElement('script')
      script2.type = 'application/ld+json'
      script2.textContent = JSON.stringify(faqStructuredData)
      document.head.appendChild(script2)

      // Cleanup function
      return () => {
        if (script1.parentNode) script1.parentNode.removeChild(script1)
        if (script2.parentNode) script2.parentNode.removeChild(script2)
      }
    }
  }, [])

  // Calculate time left
  const calculateTimeLeft = useCallback(() => {
    if (!targetDate || !targetTime) return

    const target = new Date(`${targetDate}T${targetTime}`)
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
  }, [targetDate, targetTime])

  // Update countdown every second
  useEffect(() => {
    if (!isCountdownActive) return

    calculateTimeLeft()
    const interval = setInterval(calculateTimeLeft, 1000)
    return () => clearInterval(interval)
  }, [isCountdownActive, calculateTimeLeft])

  // Generate countdown
  const generateCountdown = () => {
    if (!targetDate || !targetTime) {
      toast({
        title: "Error",
        description: "Please select both date and time for your event",
        variant: "destructive",
      })
      return
    }

    const target = new Date(`${targetDate}T${targetTime}`)
    const now = new Date()

    if (target.getTime() <= now.getTime()) {
      toast({
        title: "Error", 
        description: "Event date must be in the future",
        variant: "destructive",
      })
      return
    }

    setIsCountdownActive(true)
    generateShareableLink()
    
    toast({
      title: "Countdown Generated!",
      description: "Your countdown timer is now active",
    })
  }

  // Reset all advanced settings to defaults
  const resetToDefaults = () => {
    setStyle("horizontal")
    setSize("medium")
    setCornerRadius("medium")
    setTextColor("#ffffff")
    setBackgroundColor("#000000")
    setIsReflective(false)
    setIsTransparent(false)
    setShowTenths(false)
    setHideDateTitle(false)
    setCountUp(false)
    setTextAlignment("center")
    setTextEffect("none")
    setLanguage("en")
    setRepeatOption("none")
    setShowDays(true)
    setShowHours(true)
    setShowMinutes(true)
    setShowSeconds(true)
    
    // Regenerate shareable link if countdown is active
    if (isCountdownActive) {
      setTimeout(() => generateShareableLink(), 100)
    }
  }

  // Generate shareable link
  const generateShareableLink = () => {
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://smartgenerators.dev'
    const url = new URL(`${baseUrl}/countdown/view`)
    
    if (eventName) url.searchParams.set('event', eventName)
    url.searchParams.set('date', `${targetDate}T${targetTime}`)
    url.searchParams.set('tz', timezone)
    url.searchParams.set('theme', themeMode)
    url.searchParams.set('style', style)
    url.searchParams.set('size', size)
    url.searchParams.set('radius', cornerRadius)
    url.searchParams.set('textColor', textColor)
    url.searchParams.set('bgColor', backgroundColor)
    url.searchParams.set('textAlign', textAlignment)
    url.searchParams.set('textEffect', textEffect)
    url.searchParams.set('lang', language)
    if (isReflective) url.searchParams.set('reflective', 'true')
    if (isTransparent) url.searchParams.set('transparent', 'true')
    if (showTenths) url.searchParams.set('tenths', 'true')
    if (hideDateTitle) url.searchParams.set('hideTitle', 'true')
    if (countUp) url.searchParams.set('countUp', 'true')
    if (repeatOption !== 'none') url.searchParams.set('repeat', repeatOption)
    if (!showDays) url.searchParams.set('hideDays', 'true')
    if (!showHours) url.searchParams.set('hideHours', 'true')
    if (!showMinutes) url.searchParams.set('hideMinutes', 'true')
    if (!showSeconds) url.searchParams.set('hideSeconds', 'true')

    const linkUrl = url.toString()
    setGeneratedLink(linkUrl)

    // Generate embed code
    const embedUrl = new URL(`${baseUrl}/countdown/embed`)
    embedUrl.searchParams.set('event', eventName || 'Event')
    embedUrl.searchParams.set('date', `${targetDate}T${targetTime}`)
    embedUrl.searchParams.set('tz', timezone)
    embedUrl.searchParams.set('theme', themeMode)

    const embed = `<iframe src="${embedUrl.toString()}" width="360" height="200" frameborder="0" style="border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.1);"></iframe>`
    setEmbedCode(embed)
  }

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

  // Social sharing
  const shareOnTwitter = () => {
    const text = eventName ? `Check out this countdown for ${eventName}!` : 'Check out this countdown timer!'
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(generatedLink)}`
    window.open(url, '_blank')
  }

  const shareOnWhatsApp = () => {
    const text = eventName ? `Check out this countdown for ${eventName}! ${generatedLink}` : `Check out this countdown timer! ${generatedLink}`
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`
    window.open(url, '_blank')
  }

  // Toggle theme
  const toggleTheme = () => {
    const newTheme = !isDarkMode
    setIsDarkMode(newTheme)
    setThemeMode(newTheme ? "dark" : "light")
    localStorage.setItem("theme", newTheme ? "dark" : "light")

    if (newTheme) {
      document.documentElement.classList.add("dark")
    } else {
      document.documentElement.classList.remove("dark")
    }
  }

  // Get common timezones
  const getTimezones = () => {
    return [
      "UTC",
      "America/New_York",
      "America/Chicago", 
      "America/Denver",
      "America/Los_Angeles",
      "Europe/London",
      "Europe/Paris",
      "Europe/Berlin",
      "Asia/Tokyo",
      "Asia/Shanghai",
      "Asia/Kolkata",
      "Australia/Sydney",
      Intl.DateTimeFormat().resolvedOptions().timeZone
    ].filter((tz, index, arr) => arr.indexOf(tz) === index)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 dark:from-gray-950 dark:via-gray-900 dark:to-blue-950">
      <ToolHeader />
      <div className="mx-auto max-w-7xl px-4 py-12">
        {/* Header */}
        <header className="relative mb-12 text-center">
          <div className="mb-6">
            <Link href="/" className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-blue-50 to-indigo-50 px-4 py-2 text-sm font-medium text-blue-700 transition-colors hover:from-blue-100 hover:to-indigo-100 dark:from-blue-900/20 dark:to-indigo-900/20 dark:text-blue-300">
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
          
          <h1 className="mb-6 text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
            <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
              Free Countdown Timer Generator
            </span>
            <span className="block text-2xl sm:text-3xl lg:text-4xl text-gray-900 dark:text-white">⏳</span>
          </h1>
          
          <p className="mx-auto mb-8 max-w-2xl text-xl text-gray-600 dark:text-gray-300">
            Create countdown timers for events, launches, exams, or streams. 
            <span className="font-semibold text-gray-900 dark:text-white">Shareable links, embeddable widgets, no signup.</span>
          </p>
          
          <div className="flex flex-wrap justify-center gap-3">
            <div className="inline-flex items-center gap-2 rounded-full bg-emerald-100 px-4 py-2 text-sm font-semibold text-emerald-800 shadow-sm dark:bg-emerald-900/30 dark:text-emerald-300">
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              100% Free
            </div>
            <div className="inline-flex items-center gap-2 rounded-full bg-blue-100 px-4 py-2 text-sm font-semibold text-blue-800 shadow-sm dark:bg-blue-900/30 dark:text-blue-300">
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Embeddable
            </div>
            <div className="inline-flex items-center gap-2 rounded-full bg-purple-100 px-4 py-2 text-sm font-semibold text-purple-800 shadow-sm dark:bg-purple-900/30 dark:text-purple-300">
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 8a6 6 0 01-7.743 5.743L10 14l-1 1-1 1H6v2H2v-4l4.257-4.257A6 6 0 1118 8zm-6-4a1 1 0 100 2 2 2 0 012 2 1 1 0 102 0 4 4 0 00-4-4z" clipRule="evenodd" />
              </svg>
              No Signup
            </div>
          </div>
        </header>

        <main>
          {/* Main Content Grid */}
          <div className="grid gap-8 lg:grid-cols-2">
            {/* Form Card */}
            <section className="rounded-3xl border border-gray-200/50 bg-white/80 p-8 shadow-2xl shadow-gray-900/5 backdrop-blur-sm dark:border-gray-700/50 dark:bg-gray-900/80 dark:shadow-black/20">
              <h2 className="mb-6 text-2xl font-bold text-gray-900 dark:text-white">Create Your Countdown</h2>
              
              <div className="space-y-6">
                {/* Event Name */}
                <div>
                  <label htmlFor="event-name" className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Event Name (Optional)
                  </label>
                  <input
                    id="event-name"
                    type="text"
                    value={eventName}
                    onChange={(e) => setEventName(e.target.value)}
                    placeholder="e.g., Product Launch, Exam Day, Stream Start"
                    className="w-full rounded-xl border border-gray-300 bg-white/70 px-4 py-3 text-gray-900 backdrop-blur-sm transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800/70 dark:text-white"
                  />
                </div>

                {/* Date and Time */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="target-date" className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Target Date
                    </label>
                    <input
                      id="target-date"
                      type="date"
                      value={targetDate}
                      onChange={(e) => setTargetDate(e.target.value)}
                      className="w-full rounded-xl border border-gray-300 bg-white/70 px-4 py-3 text-gray-900 backdrop-blur-sm transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800/70 dark:text-white"
                    />
                  </div>
                  <div>
                    <label htmlFor="target-time" className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Target Time
                    </label>
                    <input
                      id="target-time"
                      type="time"
                      value={targetTime}
                      onChange={(e) => setTargetTime(e.target.value)}
                      className="w-full rounded-xl border border-gray-300 bg-white/70 px-4 py-3 text-gray-900 backdrop-blur-sm transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800/70 dark:text-white"
                    />
                  </div>
                </div>

                {/* Timezone */}
                <div>
                  <label htmlFor="timezone" className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Timezone
                  </label>
                  <select
                    id="timezone"
                    value={timezone}
                    onChange={(e) => setTimezone(e.target.value)}
                    className="w-full rounded-xl border border-gray-300 bg-white/70 px-4 py-3 text-gray-900 backdrop-blur-sm transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800/70 dark:text-white"
                  >
                    {getTimezones().map((tz) => (
                      <option key={tz} value={tz}>
                        {tz.replace(/_/g, ' ')}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Theme Toggle */}
                <div>
                  <label className="mb-3 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Widget Theme
                  </label>
                  <div className="flex gap-4">
                    <button
                      onClick={() => {
                        setThemeMode("light")
                        if (isCountdownActive) {
                          setTimeout(() => generateShareableLink(), 100)
                        }
                      }}
                      className={`flex items-center gap-2 rounded-lg border-2 px-4 py-2 transition-all ${
                        themeMode === "light"
                          ? "border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300"
                          : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                      }`}
                    >
                      <span>☀️</span>
                      Light
                    </button>
                    <button
                      onClick={() => {
                        setThemeMode("dark")
                        if (isCountdownActive) {
                          setTimeout(() => generateShareableLink(), 100)
                        }
                      }}
                      className={`flex items-center gap-2 rounded-lg border-2 px-4 py-2 transition-all ${
                        themeMode === "dark"
                          ? "border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300"
                          : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                      }`}
                    >
                      <span>🌙</span>
                      Dark
                    </button>
                  </div>
                </div>

                {/* Advanced Configuration */}
                <details className="group rounded-xl border border-gray-200/50 p-4 dark:border-gray-700/50">
                  <summary className="cursor-pointer font-medium text-gray-900 transition-colors hover:text-blue-600 dark:text-white dark:hover:text-blue-400">
                    ⚙️ Advanced Configuration
                  </summary>
                  <div className="mt-4 space-y-6 border-t border-gray-200/50 pt-4 dark:border-gray-700/50">
                    
                    {/* Reset Button */}
                    <div className="flex justify-end">
                      <button
                        onClick={resetToDefaults}
                        className="flex items-center gap-2 rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 transition-all hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                      >
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        Reset to Default
                      </button>
                    </div>
                    
                    {/* Style & Layout */}
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div>
                        <label className="mb-2 block text-base font-medium text-gray-700 dark:text-gray-300">
                          Style
                        </label>
                        <select
                          value={style}
                          onChange={(e) => {
                            setStyle(e.target.value as "horizontal" | "vertical" | "compact")
                            if (isCountdownActive) setTimeout(() => generateShareableLink(), 100)
                          }}
                          className="w-full rounded-lg border border-gray-300 bg-white/70 px-3 py-2.5 text-base text-gray-900 backdrop-blur-sm transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800/70 dark:text-white"
                        >
                          <option value="horizontal">Horizontal</option>
                          <option value="vertical">Vertical</option>
                          <option value="compact">Compact</option>
                        </select>
                      </div>
                      
                      <div>
                        <label className="mb-2 block text-base font-medium text-gray-700 dark:text-gray-300">
                          Size
                        </label>
                        <select
                          value={size}
                          onChange={(e) => {
                            setSize(e.target.value as "small" | "medium" | "large")
                            if (isCountdownActive) setTimeout(() => generateShareableLink(), 100)
                          }}
                          className="w-full rounded-lg border border-gray-300 bg-white/70 px-3 py-2.5 text-base text-gray-900 backdrop-blur-sm transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800/70 dark:text-white"
                        >
                          <option value="small">Small</option>
                          <option value="medium">Medium</option>
                          <option value="large">Large</option>
                        </select>
                      </div>
                    </div>

                    {/* Colors */}
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div>
                        <label className="mb-2 block text-base font-medium text-gray-700 dark:text-gray-300">
                          Text Color
                        </label>
                        <div className="flex gap-2">
                          <input
                            type="color"
                            value={textColor}
                            onChange={(e) => {
                              setTextColor(e.target.value)
                              if (isCountdownActive) setTimeout(() => generateShareableLink(), 100)
                            }}
                            className="h-10 w-16 rounded-lg border border-gray-300 dark:border-gray-700"
                          />
                          <input
                            type="text"
                            value={textColor}
                            onChange={(e) => {
                              setTextColor(e.target.value)
                              if (isCountdownActive) setTimeout(() => generateShareableLink(), 100)
                            }}
                            className="flex-1 rounded-lg border border-gray-300 bg-white/70 px-3 py-2 text-base text-gray-900 backdrop-blur-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800/70 dark:text-white"
                          />
                        </div>
                      </div>
                      
                      <div>
                        <label className="mb-2 block text-base font-medium text-gray-700 dark:text-gray-300">
                          Background Color
                        </label>
                        <div className="flex gap-2">
                          <input
                            type="color"
                            value={backgroundColor}
                            onChange={(e) => {
                              setBackgroundColor(e.target.value)
                              if (isCountdownActive) setTimeout(() => generateShareableLink(), 100)
                            }}
                            className="h-10 w-16 rounded-lg border border-gray-300 dark:border-gray-700"
                          />
                          <input
                            type="text"
                            value={backgroundColor}
                            onChange={(e) => {
                              setBackgroundColor(e.target.value)
                              if (isCountdownActive) setTimeout(() => generateShareableLink(), 100)
                            }}
                            className="flex-1 rounded-lg border border-gray-300 bg-white/70 px-3 py-2 text-base text-gray-900 backdrop-blur-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800/70 dark:text-white"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Corner Radius & Text Alignment */}
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div>
                        <label className="mb-2 block text-base font-medium text-gray-700 dark:text-gray-300">
                          Corner Radius
                        </label>
                        <select
                          value={cornerRadius}
                          onChange={(e) => {
                            setCornerRadius(e.target.value as "none" | "small" | "medium" | "large")
                            if (isCountdownActive) setTimeout(() => generateShareableLink(), 100)
                          }}
                          className="w-full rounded-lg border border-gray-300 bg-white/70 px-3 py-2.5 text-base text-gray-900 backdrop-blur-sm transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800/70 dark:text-white"
                        >
                          <option value="none">None</option>
                          <option value="small">Small</option>
                          <option value="medium">Medium</option>
                          <option value="large">Large</option>
                        </select>
                      </div>
                      
                      <div>
                        <label className="mb-2 block text-base font-medium text-gray-700 dark:text-gray-300">
                          Text Alignment
                        </label>
                        <select
                          value={textAlignment}
                          onChange={(e) => {
                            setTextAlignment(e.target.value as "left" | "center" | "right")
                            if (isCountdownActive) setTimeout(() => generateShareableLink(), 100)
                          }}
                          className="w-full rounded-lg border border-gray-300 bg-white/70 px-3 py-2.5 text-base text-gray-900 backdrop-blur-sm transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800/70 dark:text-white"
                        >
                          <option value="left">Left</option>
                          <option value="center">Center</option>
                          <option value="right">Right</option>
                        </select>
                      </div>
                    </div>

                    {/* Text Effect & Language */}
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div>
                        <label className="mb-2 block text-base font-medium text-gray-700 dark:text-gray-300">
                          Text Effect
                        </label>
                        <select
                          value={textEffect}
                          onChange={(e) => {
                            setTextEffect(e.target.value as "none" | "shadow" | "glow" | "gradient")
                            if (isCountdownActive) setTimeout(() => generateShareableLink(), 100)
                          }}
                          className="w-full rounded-lg border border-gray-300 bg-white/70 px-3 py-2.5 text-base text-gray-900 backdrop-blur-sm transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800/70 dark:text-white"
                        >
                          <option value="none">None</option>
                          <option value="shadow">Shadow</option>
                          <option value="glow">Glow</option>
                          <option value="gradient">Gradient</option>
                        </select>
                      </div>
                      
                      <div>
                        <label className="mb-2 block text-base font-medium text-gray-700 dark:text-gray-300">
                          Language
                        </label>
                        <select
                          value={language}
                          onChange={(e) => {
                            setLanguage(e.target.value)
                            if (isCountdownActive) setTimeout(() => generateShareableLink(), 100)
                          }}
                          className="w-full rounded-lg border border-gray-300 bg-white/70 px-3 py-2.5 text-base text-gray-900 backdrop-blur-sm transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800/70 dark:text-white"
                        >
                          <option value="en">English</option>
                          <option value="es">Spanish</option>
                          <option value="fr">French</option>
                          <option value="de">German</option>
                          <option value="it">Italian</option>
                          <option value="pt">Portuguese</option>
                          <option value="ru">Russian</option>
                          <option value="ja">Japanese</option>
                          <option value="ko">Korean</option>
                          <option value="zh">Chinese</option>
                        </select>
                      </div>
                    </div>

                    {/* Repeat Option */}
                    <div>
                      <label className="mb-2 block text-base font-medium text-gray-700 dark:text-gray-300">
                        Repeat
                      </label>
                      <select
                        value={repeatOption}
                        onChange={(e) => {
                          setRepeatOption(e.target.value as "none" | "daily" | "weekly" | "monthly" | "yearly")
                          if (isCountdownActive) setTimeout(() => generateShareableLink(), 100)
                        }}
                        className="w-full rounded-lg border border-gray-300 bg-white/70 px-3 py-2.5 text-base text-gray-900 backdrop-blur-sm transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800/70 dark:text-white"
                      >
                        <option value="none">None</option>
                        <option value="daily">Daily</option>
                        <option value="weekly">Weekly</option>
                        <option value="monthly">Monthly</option>
                        <option value="yearly">Yearly</option>
                      </select>
                    </div>

                    {/* Time Units to Display */}
                    <div>
                      <label className="mb-3 block text-base font-medium text-gray-700 dark:text-gray-300">
                        Time Units to Display
                      </label>
                      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                        <label className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={showDays}
                            onChange={(e) => {
                              setShowDays(e.target.checked)
                              if (isCountdownActive) setTimeout(() => generateShareableLink(), 100)
                            }}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-gray-700"
                          />
                          <span className="text-base font-medium text-gray-700 dark:text-gray-300">Days</span>
                        </label>
                        
                        <label className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={showHours}
                            onChange={(e) => {
                              setShowHours(e.target.checked)
                              if (isCountdownActive) setTimeout(() => generateShareableLink(), 100)
                            }}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-gray-700"
                          />
                          <span className="text-base font-medium text-gray-700 dark:text-gray-300">Hours</span>
                        </label>
                        
                        <label className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={showMinutes}
                            onChange={(e) => {
                              setShowMinutes(e.target.checked)
                              if (isCountdownActive) setTimeout(() => generateShareableLink(), 100)
                            }}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-gray-700"
                          />
                          <span className="text-base font-medium text-gray-700 dark:text-gray-300">Minutes</span>
                        </label>
                        
                        <label className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={showSeconds}
                            onChange={(e) => {
                              setShowSeconds(e.target.checked)
                              if (isCountdownActive) setTimeout(() => generateShareableLink(), 100)
                            }}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-gray-700"
                          />
                          <span className="text-base font-medium text-gray-700 dark:text-gray-300">Seconds</span>
                        </label>
                      </div>
                    </div>

                    {/* Checkboxes */}
                    <div className="space-y-3">
                      <label className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={isReflective}
                          onChange={(e) => {
                            setIsReflective(e.target.checked)
                            if (isCountdownActive) setTimeout(() => generateShareableLink(), 100)
                          }}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-gray-700"
                        />
                        <span className="text-base font-medium text-gray-700 dark:text-gray-300">Reflective</span>
                      </label>
                      
                      <label className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={isTransparent}
                          onChange={(e) => {
                            setIsTransparent(e.target.checked)
                            if (isCountdownActive) setTimeout(() => generateShareableLink(), 100)
                          }}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-gray-700"
                        />
                        <span className="text-base font-medium text-gray-700 dark:text-gray-300">Transparent background</span>
                      </label>
                      
                      <label className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={showTenths}
                          onChange={(e) => {
                            setShowTenths(e.target.checked)
                            if (isCountdownActive) setTimeout(() => generateShareableLink(), 100)
                          }}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-gray-700"
                        />
                        <span className="text-base font-medium text-gray-700 dark:text-gray-300">Show 10ths of seconds</span>
                      </label>
                      
                      <label className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={hideDateTitle}
                          onChange={(e) => {
                            setHideDateTitle(e.target.checked)
                            if (isCountdownActive) setTimeout(() => generateShareableLink(), 100)
                          }}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-gray-700"
                        />
                        <span className="text-base font-medium text-gray-700 dark:text-gray-300">Hide date and title</span>
                      </label>
                      
                      <label className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={countUp}
                          onChange={(e) => {
                            setCountUp(e.target.checked)
                            if (isCountdownActive) setTimeout(() => generateShareableLink(), 100)
                          }}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-gray-700"
                        />
                        <span className="text-base font-medium text-gray-700 dark:text-gray-300">Count up (after event starts)</span>
                      </label>
                    </div>
                  </div>
                </details>

                {/* Generate Button */}
                <button
                  onClick={generateCountdown}
                  className="w-full rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4 font-semibold text-white transition-all hover:from-blue-700 hover:to-indigo-700 hover:shadow-lg hover:shadow-blue-500/25 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  <span className="flex items-center justify-center gap-2">
                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                    </svg>
                    Generate Countdown
                  </span>
                </button>
              </div>
            </section>

            {/* Preview Card */}
            <section className="rounded-3xl border border-gray-200/50 bg-white/80 p-8 shadow-2xl shadow-gray-900/5 backdrop-blur-sm dark:border-gray-700/50 dark:bg-gray-900/80 dark:shadow-black/20">
              <h2 className="mb-6 text-2xl font-bold text-gray-900 dark:text-white">Live Preview</h2>
              
                          {/* Countdown Display */}
            <div 
              className={`mb-8 p-8 ${themeMode} ${
                isTransparent ? 'bg-transparent' : ''
              } ${
                cornerRadius === 'none' ? 'rounded-none' :
                cornerRadius === 'small' ? 'rounded-lg' :
                cornerRadius === 'large' ? 'rounded-3xl' : 'rounded-2xl'
              } ${
                textAlignment === 'left' ? 'text-left' :
                textAlignment === 'right' ? 'text-right' : 'text-center'
              }`}
              style={{
                backgroundColor: isTransparent ? 'transparent' : backgroundColor,
                background: isTransparent ? 'transparent' : `linear-gradient(135deg, ${backgroundColor}dd, ${backgroundColor}aa)`,
              }}
            >
              {eventName && !hideDateTitle && (
                <h3 
                  className={`mb-4 font-semibold ${
                    size === 'small' ? 'text-lg' :
                    size === 'large' ? 'text-3xl' : 'text-xl'
                  } ${
                    textEffect === 'shadow' ? 'drop-shadow-lg' :
                    textEffect === 'glow' ? 'drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]' :
                    textEffect === 'gradient' ? 'bg-gradient-to-r from-white via-blue-100 to-white bg-clip-text text-transparent' : ''
                  }`}
                  style={{ color: textColor }}
                >
                  {eventName}
                </h3>
              )}
              
              {isCountdownActive ? (
                timeLeft.expired ? (
                  <div 
                    className={`font-bold text-green-400 ${
                      size === 'small' ? 'text-xl' :
                      size === 'large' ? 'text-4xl' : 'text-2xl'
                    }`}
                  >
                    ✅ Event Started!
                  </div>
                ) : (
                  <div className={`gap-4 ${
                    style === 'vertical' ? 'flex flex-col items-center' :
                    style === 'compact' ? 'flex flex-wrap justify-center gap-2' :
                    `grid ${[showDays, showHours, showMinutes, showSeconds].filter(Boolean).length === 1 ? 'grid-cols-1' :
                          [showDays, showHours, showMinutes, showSeconds].filter(Boolean).length === 2 ? 'grid-cols-2' :
                          [showDays, showHours, showMinutes, showSeconds].filter(Boolean).length === 3 ? 'grid-cols-3' : 'grid-cols-4'}`
                  }`}>
                    
                    {/* Days */}
                    {showDays && (
                    <div className={`${
                      cornerRadius === 'none' ? 'rounded-none' :
                      cornerRadius === 'small' ? 'rounded-md' :
                      cornerRadius === 'large' ? 'rounded-2xl' : 'rounded-xl'
                    } ${
                      isTransparent ? (themeMode === 'dark' ? 'bg-white/20' : 'bg-gray-800/20') : 
                      (themeMode === 'dark' ? 'bg-white/80' : 'bg-gray-800/80')
                    } ${
                      size === 'small' ? 'p-2' :
                      size === 'large' ? 'p-6' : 'p-4'
                    } shadow-md ${
                      isReflective ? 'backdrop-blur-sm border border-white/20' : ''
                    } ${
                      style === 'compact' ? 'min-w-[60px]' : ''
                    }`}>
                      <div 
                        className={`font-bold ${
                          size === 'small' ? 'text-lg' :
                          size === 'large' ? 'text-4xl' : 'text-2xl'
                        } ${
                          textEffect === 'shadow' ? 'drop-shadow-lg' :
                          textEffect === 'glow' ? 'drop-shadow-[0_0_10px_rgba(255,255,255,0.8)]' :
                          textEffect === 'gradient' ? 'bg-gradient-to-b from-white to-blue-200 bg-clip-text text-transparent' : ''
                        }`}
                        style={{ color: textEffect === 'gradient' ? undefined : textColor }}
                      >
                        {timeLeft.days}
                      </div>
                      <div 
                        className={`${
                          size === 'small' ? 'text-xs' :
                          size === 'large' ? 'text-base' : 'text-sm'
                        }`}
                        style={{ color: textColor, opacity: 0.8 }}
                      >
                        Day{timeLeft.days !== 1 ? 's' : ''}
                      </div>
                    </div>
                    )}

                    {/* Hours */}
                    {showHours && (
                    <div className={`${
                      cornerRadius === 'none' ? 'rounded-none' :
                      cornerRadius === 'small' ? 'rounded-md' :
                      cornerRadius === 'large' ? 'rounded-2xl' : 'rounded-xl'
                    } ${
                      isTransparent ? (themeMode === 'dark' ? 'bg-white/20' : 'bg-gray-800/20') : 
                      (themeMode === 'dark' ? 'bg-white/80' : 'bg-gray-800/80')
                    } ${
                      size === 'small' ? 'p-2' :
                      size === 'large' ? 'p-6' : 'p-4'
                    } shadow-md  ${
                      isReflective ? 'backdrop-blur-sm border border-white/20' : ''
                    } ${
                      style === 'compact' ? 'min-w-[60px]' : ''
                    }`}>
                      <div 
                        className={`font-bold ${
                          size === 'small' ? 'text-lg' :
                          size === 'large' ? 'text-4xl' : 'text-2xl'
                        } ${
                          textEffect === 'shadow' ? 'drop-shadow-lg' :
                          textEffect === 'glow' ? 'drop-shadow-[0_0_10px_rgba(255,255,255,0.8)]' :
                          textEffect === 'gradient' ? 'bg-gradient-to-b from-white to-blue-200 bg-clip-text text-transparent' : ''
                        }`}
                        style={{ color: textEffect === 'gradient' ? undefined : textColor }}
                      >
                        {timeLeft.hours}
                      </div>
                      <div 
                        className={`${
                          size === 'small' ? 'text-xs' :
                          size === 'large' ? 'text-base' : 'text-sm'
                        }`}
                        style={{ color: textColor, opacity: 0.8 }}
                      >
                        Hour{timeLeft.hours !== 1 ? 's' : ''}
                      </div>
                    </div>
                    )}

                    {/* Minutes */}
                    {showMinutes && (
                    <div className={`${
                      cornerRadius === 'none' ? 'rounded-none' :
                      cornerRadius === 'small' ? 'rounded-md' :
                      cornerRadius === 'large' ? 'rounded-2xl' : 'rounded-xl'
                    } ${
                      isTransparent ? (themeMode === 'dark' ? 'bg-white/20' : 'bg-gray-800/20') : 
                      (themeMode === 'dark' ? 'bg-white/80' : 'bg-gray-800/80')
                    } ${
                      size === 'small' ? 'p-2' :
                      size === 'large' ? 'p-6' : 'p-4'
                    } shadow-md  ${
                      isReflective ? 'backdrop-blur-sm border border-white/20' : ''
                    } ${
                      style === 'compact' ? 'min-w-[60px]' : ''
                    }`}>
                      <div 
                        className={`font-bold ${
                          size === 'small' ? 'text-lg' :
                          size === 'large' ? 'text-4xl' : 'text-2xl'
                        } ${
                          textEffect === 'shadow' ? 'drop-shadow-lg' :
                          textEffect === 'glow' ? 'drop-shadow-[0_0_10px_rgba(255,255,255,0.8)]' :
                          textEffect === 'gradient' ? 'bg-gradient-to-b from-white to-blue-200 bg-clip-text text-transparent' : ''
                        }`}
                        style={{ color: textEffect === 'gradient' ? undefined : textColor }}
                      >
                        {timeLeft.minutes}
                      </div>
                      <div 
                        className={`${
                          size === 'small' ? 'text-xs' :
                          size === 'large' ? 'text-base' : 'text-sm'
                        }`}
                        style={{ color: textColor, opacity: 0.8 }}
                      >
                        Minute{timeLeft.minutes !== 1 ? 's' : ''}
                      </div>
                    </div>
                    )}

                    {/* Seconds */}
                    {showSeconds && (
                    <div className={`${
                      cornerRadius === 'none' ? 'rounded-none' :
                      cornerRadius === 'small' ? 'rounded-md' :
                      cornerRadius === 'large' ? 'rounded-2xl' : 'rounded-xl'
                    } ${
                      isTransparent ? (themeMode === 'dark' ? 'bg-white/20' : 'bg-gray-800/20') : 
                      (themeMode === 'dark' ? 'bg-white/80' : 'bg-gray-800/80')
                    } ${
                      size === 'small' ? 'p-2' :
                      size === 'large' ? 'p-6' : 'p-4'
                    } shadow-md  ${
                      isReflective ? 'backdrop-blur-sm border border-white/20' : ''
                    } ${
                      style === 'compact' ? 'min-w-[60px]' : ''
                    }`}>
                      <div 
                        className={`font-bold ${
                          size === 'small' ? 'text-lg' :
                          size === 'large' ? 'text-4xl' : 'text-2xl'
                        } ${
                          textEffect === 'shadow' ? 'drop-shadow-lg' :
                          textEffect === 'glow' ? 'drop-shadow-[0_0_10px_rgba(255,255,255,0.8)]' :
                          textEffect === 'gradient' ? 'bg-gradient-to-b from-white to-blue-200 bg-clip-text text-transparent' : ''
                        }`}
                        style={{ color: textEffect === 'gradient' ? undefined : textColor }}
                      >
                        {timeLeft.seconds}{showTenths ? '.0' : ''}
                      </div>
                      <div 
                        className={`${
                          size === 'small' ? 'text-xs' :
                          size === 'large' ? 'text-base' : 'text-sm'
                        }`}
                        style={{ color: textColor, opacity: 0.8 }}
                      >
                        Second{timeLeft.seconds !== 1 ? 's' : ''}
                      </div>
                    </div>
                    )}
                  </div>
                )
              ) : (
                <div className="text-gray-500 dark:text-gray-400">
                  Generate your countdown to see the live preview
                </div>
              )}
            </div>

              {/* Copy/Share Buttons */}
              {isCountdownActive && generatedLink && (
                <div className="space-y-4">
                  {/* Shareable Link */}
                  <div className="rounded-xl border border-blue-200/50 bg-blue-50/50 p-4 dark:border-blue-800/30 dark:bg-blue-900/10">
                    <div className="mb-3 flex items-center gap-2">
                      <svg className="h-5 w-5 text-blue-600 dark:text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z" clipRule="evenodd" />
                      </svg>
                      <h3 className="font-semibold text-blue-900 dark:text-blue-100">Shareable Link</h3>
                    </div>
                    <div className="flex gap-2">
                      <div className="flex-1 rounded-lg border border-blue-200 bg-white/80 px-3 py-2.5 dark:border-blue-700/50 dark:bg-gray-800/80">
                        <code className="block break-all text-sm text-gray-900 dark:text-gray-100">
                          {generatedLink}
                        </code>
                      </div>
                      <button
                        onClick={() => copyToClipboard(generatedLink, "Link")}
                        className={`flex items-center gap-2 rounded-lg px-4 py-2.5 font-medium transition-all ${
                          copySuccess === "Link"
                            ? "bg-green-600 text-white"
                            : "bg-blue-600 text-white hover:bg-blue-700 hover:shadow-md"
                        }`}
                      >
                        {copySuccess === "Link" ? (
                          <>
                            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                            Copied!
                          </>
                        ) : (
                          <>
                            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M8 2a1 1 0 000 2h2a1 1 0 100-2H8z" />
                              <path d="M3 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v6h-4.586l1.293-1.293a1 1 0 00-1.414-1.414l-3 3a1 1 0 000 1.414l3 3a1 1 0 001.414-1.414L10.414 13H15v3a2 2 0 01-2 2H5a2 2 0 01-2-2V5zM15 11h2V5a2 2 0 00-2-2v8z" />
                            </svg>
                            Copy
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Embed Code */}
                  <div className="rounded-xl border border-purple-200/50 bg-purple-50/50 p-4 dark:border-purple-800/30 dark:bg-purple-900/10">
                    <div className="mb-3 flex items-center gap-2">
                      <svg className="h-5 w-5 text-purple-600 dark:text-purple-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M12.316 3.051a1 1 0 01.633 1.265l-4 12a1 1 0 11-1.898-.632l4-12a1 1 0 011.265-.633zM5.707 6.293a1 1 0 010 1.414L3.414 10l2.293 2.293a1 1 0 11-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0zm8.586 0a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 11-1.414-1.414L16.586 10l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                      <h3 className="font-semibold text-purple-900 dark:text-purple-100">Embed Code</h3>
                      <span className="rounded-full bg-purple-100 px-2 py-0.5 text-xs font-medium text-purple-700 dark:bg-purple-900/50 dark:text-purple-300">
                        360×200px
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <div className="flex-1 rounded-lg border border-purple-200 bg-white/80 p-3 dark:border-purple-700/50 dark:bg-gray-800/80">
                        <code className="block break-all text-sm leading-relaxed text-gray-900 dark:text-gray-100">
                          {embedCode}
                        </code>
                      </div>
                      <button
                        onClick={() => copyToClipboard(embedCode, "Embed Code")}
                        className={`flex items-center gap-2 rounded-lg px-4 py-2.5 font-medium transition-all ${
                          copySuccess === "Embed Code"
                            ? "bg-green-600 text-white"
                            : "bg-purple-600 text-white hover:bg-purple-700 hover:shadow-md"
                        }`}
                      >
                        {copySuccess === "Embed Code" ? (
                          <>
                            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                            Copied!
                          </>
                        ) : (
                          <>
                            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M8 2a1 1 0 000 2h2a1 1 0 100-2H8z" />
                              <path d="M3 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v6h-4.586l1.293-1.293a1 1 0 00-1.414-1.414l-3 3a1 1 0 000 1.414l3 3a1 1 0 001.414-1.414L10.414 13H15v3a2 2 0 01-2 2H5a2 2 0 01-2-2V5zM15 11h2V5a2 2 0 00-2-2v8z" />
                            </svg>
                            Copy
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Social Share Buttons */}
                  <div className="flex gap-2">
                    <button
                      onClick={shareOnTwitter}
                      className="flex items-center gap-2 rounded-lg bg-blue-500 px-4 py-2 text-sm font-medium text-white transition-all hover:bg-blue-600"
                    >
                      <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M6.29 18.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0020 3.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.073 4.073 0 01.8 7.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 010 16.407a11.616 11.616 0 006.29 1.84" />
                      </svg>
                      Share on Twitter
                    </button>
                    <button
                      onClick={shareOnWhatsApp}
                      className="flex items-center gap-2 rounded-lg bg-green-500 px-4 py-2 text-sm font-medium text-white transition-all hover:bg-green-600"
                    >
                      <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                      </svg>
                      Share on WhatsApp
                    </button>
                  </div>
                </div>
              )}
            </section>
          </div>

          {/* Information Sections */}
          <div className="mt-16 space-y-12">
            {/* What is section */}
            <section className="rounded-3xl border border-gray-200/50 bg-white/80 p-8 shadow-2xl shadow-gray-900/5 backdrop-blur-sm dark:border-gray-700/50 dark:bg-gray-900/80 dark:shadow-black/20">
              <h2 className="mb-6 text-2xl font-bold text-gray-900 dark:text-white">What is a Countdown Timer Generator?</h2>
              <div className="prose prose-gray max-w-none dark:prose-invert">
                <p className="text-gray-700 dark:text-gray-300">
                  A countdown timer generator is a free online tool that creates customizable countdown timers for any event or deadline. 
                  Whether you're launching a product, starting a livestream, counting down to an exam, or planning a special event, 
                  this tool helps you create engaging visual timers that automatically update in real-time.
                </p>
                <p className="text-gray-700 dark:text-gray-300">
                  Our countdown generator creates shareable links and embeddable widgets that work across all devices and browsers, 
                  making it perfect for websites, social media, emails, and presentations.
                </p>
              </div>
            </section>

            {/* How to section */}
            <section className="rounded-3xl border border-gray-200/50 bg-white/80 p-8 shadow-2xl shadow-gray-900/5 backdrop-blur-sm dark:border-gray-700/50 dark:bg-gray-900/80 dark:shadow-black/20">
              <h2 className="mb-6 text-2xl font-bold text-gray-900 dark:text-white">How to Create a Countdown Timer Online</h2>
              <div className="space-y-4">
                <ol className="list-decimal list-inside space-y-2 text-gray-700 dark:text-gray-300">
                  <li><strong>Enter your event name</strong> (optional) - Give your countdown a title that describes what you're counting down to</li>
                  <li><strong>Select target date and time</strong> - Choose exactly when your event starts or when your deadline expires</li>
                  <li><strong>Choose timezone</strong> - The tool auto-detects your timezone, but you can change it for events in different time zones</li>
                  <li><strong>Pick a theme</strong> - Select light or dark mode to match your website or preference</li>
                  <li><strong>Generate countdown</strong> - Click the button to create your live countdown timer</li>
                  <li><strong>Share or embed</strong> - Copy the shareable link or embed code to use anywhere</li>
                </ol>
              </div>
            </section>

            {/* Embed section */}
            <section className="rounded-3xl border border-gray-200/50 bg-white/80 p-8 shadow-2xl shadow-gray-900/5 backdrop-blur-sm dark:border-gray-700/50 dark:bg-gray-900/80 dark:shadow-black/20">
              <h2 className="mb-6 text-2xl font-bold text-gray-900 dark:text-white">Add a Countdown Timer to Your Website</h2>
              <div className="space-y-4 text-gray-700 dark:text-gray-300">
                <p>
                  Embedding a countdown timer on your website is simple with our widget code. The generated iframe is exactly 360×200 pixels 
                  and includes modern styling with rounded corners and subtle shadows that blend perfectly with most website designs.
                </p>
                <p>
                  <strong>To embed your countdown:</strong>
                </p>
                <ol className="list-decimal list-inside space-y-1">
                  <li>Generate your countdown timer above</li>
                  <li>Copy the embed code from the "Embed Code" section</li>
                  <li>Paste the iframe code into your website's HTML</li>
                  <li>The countdown will automatically start working on your site</li>
                </ol>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  The embedded countdown runs entirely in the visitor's browser and doesn't require any additional setup or API keys.
                </p>
              </div>
            </section>

            {/* FAQ Section */}
            <section className="rounded-3xl border border-gray-200/50 bg-white/80 p-8 shadow-2xl shadow-gray-900/5 backdrop-blur-sm dark:border-gray-700/50 dark:bg-gray-900/80 dark:shadow-black/20">
              <h2 className="mb-6 text-2xl font-bold text-gray-900 dark:text-white">FAQ</h2>
              <div className="space-y-4">
                <details className="rounded-xl border border-gray-200/50 p-4 transition-all hover:shadow-md dark:border-gray-700/50 dark:hover:bg-gray-800/50">
                  <summary className="cursor-pointer font-semibold text-gray-900 hover:text-blue-600 dark:text-white dark:hover:text-blue-400">
                    How do I share my countdown timer?
                  </summary>
                  <p className="mt-2 text-gray-700 dark:text-gray-300">
                    Copy the generated link which includes all your countdown settings (event name, date, timezone, theme). 
                    Anyone can view your countdown by visiting this link. The countdown will automatically display and start counting down.
                  </p>
                </details>
                
                <details className="rounded-xl border border-gray-200/50 p-4 transition-all hover:shadow-md dark:border-gray-700/50 dark:hover:bg-gray-800/50">
                  <summary className="cursor-pointer font-semibold text-gray-900 hover:text-blue-600 dark:text-white dark:hover:text-blue-400">
                    Can I embed the timer on my website?
                  </summary>
                  <p className="mt-2 text-gray-700 dark:text-gray-300">
                    Yes! Copy the iframe embed code and paste it into your website's HTML. The countdown widget is 360×200 pixels 
                    and works on any website. It automatically matches the theme you selected and updates in real-time.
                  </p>
                </details>
                
                <details className="rounded-xl border border-gray-200/50 p-4 transition-all hover:shadow-md dark:border-gray-700/50 dark:hover:bg-gray-800/50">
                  <summary className="cursor-pointer font-semibold text-gray-900 hover:text-blue-600 dark:text-white dark:hover:text-blue-400">
                    What happens after the countdown ends?
                  </summary>
                  <p className="mt-2 text-gray-700 dark:text-gray-300">
                    When the countdown reaches zero, it displays "✅ Event Started!" message. The timer stops counting 
                    and shows the completion status. This works both on the main page and in embedded widgets.
                  </p>
                </details>
                
                <details className="rounded-xl border border-gray-200/50 p-4 transition-all hover:shadow-md dark:border-gray-700/50 dark:hover:bg-gray-800/50">
                  <summary className="cursor-pointer font-semibold text-gray-900 hover:text-blue-600 dark:text-white dark:hover:text-blue-400">
                    Does this work offline?
                  </summary>
                  <p className="mt-2 text-gray-700 dark:text-gray-300">
                    Yes, once loaded, the countdown timer continues running locally in your browser even without an internet connection. 
                    The timer uses your device's clock to maintain accuracy.
                  </p>
                </details>
              </div>
            </section>
          </div>
        </main>

        {/* Feedback Section */}
        <section className="mt-12">
          <FeedbackForm toolName="Countdown Timer Generator" defaultCollapsed={true} />
        </section>

        {/* Footer */}
        <footer className="mt-12 rounded-3xl border border-gray-200/50 bg-white/80 p-6 shadow-xl shadow-gray-900/5 backdrop-blur-sm dark:border-gray-700/50 dark:bg-gray-900/80 dark:shadow-black/20">
          <div className="space-y-4 text-center">
            <div className="flex flex-wrap justify-center gap-4 text-sm">
              <Link href="/" className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">
                Smart Generators Home
              </Link>
              <span className="text-gray-500">•</span>
              <Link href="/discord-timestamp" className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">
                Discord Timestamps
              </Link>
              <span className="text-gray-500">•</span>
              <Link href="/chat-link-generator" className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">
                Chat Link Generator
              </Link>
              <span className="text-gray-500">•</span>
              <span className="text-gray-500">More tools coming soon...</span>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Built with ❤️ by Smart Generators
            </p>
          </div>
        </footer>
      </div>
    </div>
  )
}
