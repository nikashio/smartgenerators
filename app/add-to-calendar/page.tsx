"use client"

import type React from "react"
import { useState, useEffect, useCallback } from "react"
import { useToast } from "@/hooks/use-toast"
import { generateCalendarLinks } from "@/lib/calendar-links"
import { generateIcs, downloadIcs, generateIcsFilename } from "@/lib/ics-generator"

/**
 * Add-to-Calendar Link Generator - Create calendar links and downloadable .ics files
 * Supports Google, Outlook, Yahoo calendars with full event customization
 */

// Event Details Type Definition
export interface EventDetails {
  title: string
  description?: string
  location?: string
  isAllDay: boolean
  start: string
  end: string
  timezone: string
  attendees?: string[]
  reminders?: Array<{ unit: "minute" | "hour" | "day"; amount: number }>
  recurrence?: {
    freq: "DAILY" | "WEEKLY" | "MONTHLY" | "YEARLY"
    interval?: number
    byDay?: Array<"MO" | "TU" | "WE" | "TH" | "FR" | "SA" | "SU">
    count?: number
    until?: string
  }
  visibility?: "PUBLIC" | "PRIVATE" | "CONFIDENTIAL"
  organizer?: { name?: string; email?: string }
}

// Timezone options
const TIMEZONES = [
  { value: "America/New_York", label: "Eastern Time (ET)" },
  { value: "America/Chicago", label: "Central Time (CT)" },
  { value: "America/Denver", label: "Mountain Time (MT)" },
  { value: "America/Los_Angeles", label: "Pacific Time (PT)" },
  { value: "Europe/London", label: "London (GMT)" },
  { value: "Europe/Paris", label: "Paris (CET)" },
  { value: "Asia/Tokyo", label: "Tokyo (JST)" },
  { value: "Australia/Sydney", label: "Sydney (AEST)" },
  { value: "UTC", label: "UTC" },
]

// Recurrence options
const RECURRENCE_FREQS = [
  { value: "DAILY", label: "Daily" },
  { value: "WEEKLY", label: "Weekly" },
  { value: "MONTHLY", label: "Monthly" },
  { value: "YEARLY", label: "Yearly" },
]

const DAYS_OF_WEEK = [
  { value: "MO" as const, label: "Mon" },
  { value: "TU" as const, label: "Tue" },
  { value: "WE" as const, label: "Wed" },
  { value: "TH" as const, label: "Thu" },
  { value: "FR" as const, label: "Fri" },
  { value: "SA" as const, label: "Sat" },
  { value: "SU" as const, label: "Sun" },
]

// Reminder options
const REMINDER_UNITS = [
  { value: "minute", label: "minutes" },
  { value: "hour", label: "hours" },
  { value: "day", label: "days" },
]

/**
 * Main page component for Add-to-Calendar Link Generator
 */
export default function AddToCalendarGenerator() {
  // Form state
  const [eventDetails, setEventDetails] = useState<EventDetails>({
    title: "",
    description: "",
    location: "",
    isAllDay: false,
    start: "",
    end: "",
    timezone: "UTC",
    attendees: [],
    reminders: [],
    visibility: "PUBLIC",
  })

  // UI state
  const [copySuccess, setCopySuccess] = useState("")
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [generatedLinks, setGeneratedLinks] = useState({
    google: "",
    outlookLive: "",
    office365: "",
    yahoo: "",
  })
  const [icsContent, setIcsContent] = useState("")
  const [hasGenerated, setHasGenerated] = useState(false)
  const [errors, setErrors] = useState<string[]>([])
  const [newReminder, setNewReminder] = useState<{ amount: number; unit: "minute" | "hour" | "day" }>({ amount: 15, unit: "minute" })
  const [attendeesText, setAttendeesText] = useState("")

  const { toast } = useToast()

  // Initialize theme and timezone
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Theme initialization
      const savedTheme = localStorage.getItem("theme")
      const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches

      if (savedTheme === "dark" || (!savedTheme && systemPrefersDark)) {
        setIsDarkMode(true)
        document.documentElement.classList.add("dark")
      } else {
        setIsDarkMode(false)
        document.documentElement.classList.remove("dark")
      }

      // Auto-detect timezone
      const detectedTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone
      setEventDetails(prev => ({ ...prev, timezone: detectedTimezone }))

      // Set default dates
      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)
      tomorrow.setHours(9, 0, 0, 0)

      const tomorrowPlusHour = new Date(tomorrow)
      tomorrowPlusHour.setHours(10, 0, 0, 0)

      const localDateTime = (date: Date) => new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 16)

      setEventDetails(prev => ({
        ...prev,
        start: localDateTime(tomorrow),
        end: localDateTime(tomorrowPlusHour),
      }))

      // Add structured data for SoftwareApplication
      const softwareStructuredData = {
        "@context": "https://schema.org",
        "@type": "SoftwareApplication",
        "name": "Add to Calendar Link Generator",
        "description": "Free calendar link generator – create Google/Outlook/Apple calendar links and downloadable .ics files with full event customization.",
        "url": "https://smartgenerators.dev/add-to-calendar",
        "applicationCategory": "UtilitiesApplication",
        "operatingSystem": "Any",
        "browserRequirements": "Requires JavaScript",
        "offers": {
          "@type": "Offer",
          "price": "0",
          "priceCurrency": "USD"
        },
        "featureList": [
          "Google Calendar link generation",
          "Outlook calendar integration",
          "Apple Calendar .ics files",
          "Full event customization",
          "Recurrence and reminders",
          "QR code generation",
          "Privacy-focused local processing"
        ],
        "creator": {
          "@type": "Organization",
          "name": "Smart Generators",
          "url": "https://smartgenerators.dev"
        }
      }

      // Add structured data for FAQ
      const faqStructuredData = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": [
          {
            "@type": "Question",
            "name": "How do I create a Google Calendar link?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Fill out the event details form and click 'Generate Calendar Links & ICS'. The tool will create a Google Calendar link that, when clicked, opens Google Calendar with your event pre-filled. Users can then save it to their calendar with one click."
            }
          },
          {
            "@type": "Question",
            "name": "What is an ICS file and how do I use it?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "An ICS file is a standard calendar file format (iCalendar) that works with all major calendar applications including Apple Calendar, Outlook, Google Calendar, and more. When you download an ICS file, you can double-click it to import the event into your default calendar app, or manually import it through your calendar's import function."
            }
          },
          {
            "@type": "Question",
            "name": "Do calendar links work on mobile devices?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Yes! Calendar links work on both desktop and mobile devices. On mobile, clicking a calendar link will typically open the device's default calendar app (like Apple Calendar on iOS or Google Calendar on Android) with the event details pre-filled."
            }
          },
          {
            "@type": "Question",
            "name": "Can I create recurring events?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Absolutely! Use the 'Advanced Options (Recurrence)' section to set up daily, weekly, monthly, or yearly recurring events. You can specify intervals (every 2 weeks), specific days (Mondays and Wednesdays), and end dates for the recurrence series."
            }
          },
          {
            "@type": "Question",
            "name": "Is my event data stored on your servers?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "No, absolutely not! Everything happens locally in your browser. Your event details, calendar links, and ICS files are generated client-side using JavaScript. Nothing is sent to or stored on our servers, ensuring complete privacy for your events."
            }
          },
          {
            "@type": "Question",
            "name": "What's the difference between all-day and timed events?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "All-day events span entire days without specific times (like birthdays or holidays) and appear at the top of calendar views. Timed events have specific start and end times (like meetings) and appear in time slots. Check the 'All-day event' box for events that don't have specific times."
            }
          },
          {
            "@type": "Question",
            "name": "Can I add attendees to calendar events?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Yes! Add comma-separated email addresses in the 'Attendees' field. When the calendar link is used or ICS file is imported, the calendar app will typically send invitations to the specified attendees (depending on the user's calendar settings)."
            }
          },
          {
            "@type": "Question",
            "name": "Do reminders work in all calendar apps?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Reminders are supported by most modern calendar applications when using ICS files. However, calendar links (URLs) have limited reminder support as they depend on the specific calendar service's URL parameters. For best reminder compatibility, use the downloadable ICS file."
            }
          }
        ]
      }

      const softwareScript = document.createElement('script')
      softwareScript.type = 'application/ld+json'
      softwareScript.textContent = JSON.stringify(softwareStructuredData)
      document.head.appendChild(softwareScript)

      const faqScript = document.createElement('script')
      faqScript.type = 'application/ld+json'
      faqScript.textContent = JSON.stringify(faqStructuredData)
      document.head.appendChild(faqScript)

      return () => {
        if (softwareScript.parentNode) softwareScript.parentNode.removeChild(softwareScript)
        if (faqScript.parentNode) faqScript.parentNode.removeChild(faqScript)
      }
    }
  }, [])

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

  // Validation function
  const validateEventDetails = (details: EventDetails): string[] => {
    const errors: string[] = []

    if (!details.title.trim()) {
      errors.push("Event title is required")
    }

    if (!details.start) {
      errors.push("Start date and time is required")
    }

    if (!details.end) {
      errors.push("End date and time is required")
    }

    if (details.start && details.end) {
      const startDate = new Date(details.start)
      const endDate = new Date(details.end)

      if (isNaN(startDate.getTime())) {
        errors.push("Invalid start date and time")
      }

      if (isNaN(endDate.getTime())) {
        errors.push("Invalid end date and time")
      }

      if (!isNaN(startDate.getTime()) && !isNaN(endDate.getTime()) && startDate >= endDate) {
        errors.push("End time must be after start time")
      }
    }

    // Validate attendees emails
    if (details.attendees && details.attendees.length > 0) {
      const invalidEmails = details.attendees.filter(email => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        return !emailRegex.test(email.trim())
      })

      if (invalidEmails.length > 0) {
        errors.push("Some attendee emails are invalid")
      }
    }

    return errors
  }

  // Add reminder
  const addReminder = () => {
    if (newReminder.amount <= 0) return

    setEventDetails(prev => ({
      ...prev,
      reminders: [...(prev.reminders || []), { ...newReminder }]
    }))

    setNewReminder({ amount: 15, unit: "minute" })
  }

  // Remove reminder
  const removeReminder = (index: number) => {
    setEventDetails(prev => ({
      ...prev,
      reminders: prev.reminders?.filter((_, i) => i !== index) || []
    }))
  }

  // Update attendees from text
  useEffect(() => {
    const emails = attendeesText
      .split(',')
      .map(email => email.trim())
      .filter(email => email.length > 0)

    setEventDetails(prev => ({
      ...prev,
      attendees: emails
    }))
  }, [attendeesText])

  // Generate calendar links and ICS
  const generateCalendarData = () => {
    setErrors([])

    // Parse attendees from text
    const attendees = attendeesText
      .split(',')
      .map(email => email.trim())
      .filter(email => email.length > 0)

    const detailsToValidate: EventDetails = {
      ...eventDetails,
      attendees
    }

    const validationErrors = validateEventDetails(detailsToValidate)
    if (validationErrors.length > 0) {
      setErrors(validationErrors)
      toast({
        title: "Validation Error",
        description: validationErrors[0],
        variant: "destructive",
      })
      return
    }

    try {
      // Generate calendar links
      const links = generateCalendarLinks(detailsToValidate)
      setGeneratedLinks(links)

      // Generate ICS content
      const ics = generateIcs(detailsToValidate)
      setIcsContent(ics)

      setHasGenerated(true)

      toast({
        title: "Success!",
        description: "Calendar links and ICS file generated successfully",
      })
    } catch (error) {
      console.error("Generation error:", error)
      toast({
        title: "Error",
        description: "Failed to generate calendar data",
        variant: "destructive",
      })
    }
  }

  // Download ICS file
  const downloadIcsFile = () => {
    if (!icsContent || !eventDetails.title) return

    const filename = generateIcsFilename(eventDetails.title)
    downloadIcs(filename, icsContent)

    toast({
      title: "Downloaded!",
      description: "ICS file downloaded successfully",
    })
  }

  // Copy to clipboard helper
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 dark:from-gray-950 dark:via-gray-900 dark:to-blue-950">
      <div className="mx-auto max-w-6xl px-4 py-12">
        {/* Header */}
        <header className="relative mb-12 text-center">
          <div className="mb-6">
            <div className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-blue-50 to-indigo-50 px-4 py-2 text-sm font-medium text-blue-700 dark:from-blue-900/20 dark:to-indigo-900/20 dark:text-blue-300">
              <span className="text-lg">📅</span>
              Smart Generators
            </div>
          </div>

          <h1 className="mb-6 text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
            <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
              Add to Calendar
            </span>
            <br />
            <span className="text-gray-900 dark:text-white">Link Generator</span>
          </h1>

          <p className="mx-auto mb-8 max-w-2xl text-xl text-gray-600 dark:text-gray-300">
            Create calendar links and downloadable .ics files for Google, Outlook, Apple Calendar, and more — <span className="font-semibold text-gray-900 dark:text-white">free, privacy-first.</span>
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
                <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Privacy-first
            </div>
            <div className="inline-flex items-center gap-2 rounded-full bg-purple-100 px-4 py-2 text-sm font-semibold text-purple-800 shadow-sm dark:bg-purple-900/30 dark:text-purple-300">
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 8a6 6 0 01-7.743 5.743L10 14l-1 1-1 1H6v2H2v-4l4.257-4.257A6 6 0 1118 8zm-6-4a1 1 0 100 2 2 2 0 012 2 1 1 0 102 0 4 4 0 00-4-4z" clipRule="evenodd" />
              </svg>
              No Signup
            </div>
          </div>

          {/* Theme Toggle */}
          <div className="absolute top-0 right-0">
            <button
              onClick={toggleTheme}
              className="h-10 w-10 rounded-full border border-gray-200/50 bg-white/80 text-sm backdrop-blur-sm transition-all hover:bg-gray-50 hover:shadow-md dark:border-gray-700/50 dark:bg-gray-900/80 dark:hover:bg-gray-800"
              aria-label={`Switch to ${isDarkMode ? "light" : "dark"} mode`}
            >
              <span className="sr-only">{isDarkMode ? "Switch to light mode" : "Switch to dark mode"}</span>
              {isDarkMode ? "🌙" : "☀️"}
            </button>
          </div>
        </header>

        <main>
          {/* Event Details Form */}
          <section className="mb-12 overflow-hidden rounded-3xl border border-gray-200/50 bg-white/80 p-8 shadow-2xl shadow-gray-900/5 backdrop-blur-sm dark:border-gray-700/50 dark:bg-gray-900/80 dark:shadow-black/20">
            <h2 className="mb-6 text-2xl font-bold text-gray-900 dark:text-white">
              Event Details
            </h2>

            {/* Validation Errors */}
            {errors.length > 0 && (
              <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/20">
                <h3 className="mb-2 font-semibold text-red-800 dark:text-red-200">Please fix the following errors:</h3>
                <ul className="list-disc list-inside space-y-1 text-sm text-red-700 dark:text-red-300">
                  {errors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label htmlFor="title" className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Event Title *
                  </label>
                  <input
                    id="title"
                    type="text"
                    value={eventDetails.title}
                    onChange={(e) => setEventDetails(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Meeting with Team"
                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  />
                </div>

                <div>
                  <label htmlFor="location" className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Location
                  </label>
                  <input
                    id="location"
                    type="text"
                    value={eventDetails.location || ""}
                    onChange={(e) => setEventDetails(prev => ({ ...prev, location: e.target.value }))}
                    placeholder="Conference Room A or https://meet.google.com/..."
                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label htmlFor="description" className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Description
                </label>
                <textarea
                  id="description"
                  value={eventDetails.description || ""}
                  onChange={(e) => setEventDetails(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Agenda and meeting details..."
                  rows={3}
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                />
              </div>

              {/* All Day Toggle */}
              <div className="flex items-center">
                <input
                  id="allDay"
                  type="checkbox"
                  checked={eventDetails.isAllDay}
                  onChange={(e) => setEventDetails(prev => ({ ...prev, isAllDay: e.target.checked }))}
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-gray-700"
                />
                <label htmlFor="allDay" className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                  All-day event
                </label>
              </div>

              {/* Date & Time */}
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div>
                  <label htmlFor="start" className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Start {eventDetails.isAllDay ? 'Date' : 'Date & Time'} *
                  </label>
                  <input
                    id="start"
                    type={eventDetails.isAllDay ? "date" : "datetime-local"}
                    value={eventDetails.start}
                    onChange={(e) => setEventDetails(prev => ({ ...prev, start: e.target.value }))}
                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  />
                </div>

                <div>
                  <label htmlFor="end" className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    End {eventDetails.isAllDay ? 'Date' : 'Date & Time'} *
                  </label>
                  <input
                    id="end"
                    type={eventDetails.isAllDay ? "date" : "datetime-local"}
                    value={eventDetails.end}
                    onChange={(e) => setEventDetails(prev => ({ ...prev, end: e.target.value }))}
                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  />
                </div>

                <div>
                  <label htmlFor="timezone" className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Timezone
                  </label>
                  <select
                    id="timezone"
                    value={eventDetails.timezone}
                    onChange={(e) => setEventDetails(prev => ({ ...prev, timezone: e.target.value }))}
                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  >
                    {TIMEZONES.map((tz) => (
                      <option key={tz.value} value={tz.value}>
                        {tz.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Attendees */}
              <div>
                <label htmlFor="attendees" className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Attendees (optional)
                </label>
                <input
                  id="attendees"
                  type="text"
                  value={attendeesText}
                  onChange={(e) => setAttendeesText(e.target.value)}
                  placeholder="john@example.com, jane@example.com"
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                />
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Comma-separated email addresses
                </p>
              </div>

              {/* Reminders */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Reminders
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    min="1"
                    value={newReminder.amount}
                    onChange={(e) => setNewReminder(prev => ({ ...prev, amount: Number.parseInt(e.target.value) || 0 }))}
                    placeholder="15"
                    className="w-20 rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  />
                  <select
                    value={newReminder.unit}
                    onChange={(e) => setNewReminder(prev => ({ ...prev, unit: e.target.value as "minute" | "hour" | "day" }))}
                    className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  >
                    {REMINDER_UNITS.map((unit) => (
                      <option key={unit.value} value={unit.value}>
                        {unit.label}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={addReminder}
                    className="rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
                  >
                    Add
                  </button>
                </div>

                {/* Display existing reminders */}
                {eventDetails.reminders && eventDetails.reminders.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {eventDetails.reminders.map((reminder, index) => (
                      <div key={index} className="flex items-center gap-2 rounded-lg bg-gray-100 px-3 py-2 dark:bg-gray-800">
                        <span className="text-sm text-gray-700 dark:text-gray-300">
                          {reminder.amount} {reminder.unit}{reminder.amount !== 1 ? 's' : ''} before
                        </span>
                        <button
                          onClick={() => removeReminder(index)}
                          className="ml-auto text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                        >
                          <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Recurrence */}
              <details className="group">
                <summary className="cursor-pointer text-sm font-medium text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-gray-200">
                  Advanced Options (Recurrence)
                </summary>
                <div className="mt-4 space-y-4 border-t border-gray-200 pt-4 dark:border-gray-800">
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Repeat
                      </label>
                      <select
                        value={eventDetails.recurrence?.freq || ""}
                        onChange={(e) => setEventDetails(prev => ({
                          ...prev,
                          recurrence: e.target.value ? {
                            freq: e.target.value as "DAILY" | "WEEKLY" | "MONTHLY" | "YEARLY",
                            interval: 1,
                            byDay: [],
                            count: undefined,
                            until: undefined
                          } : undefined
                        }))}
                        className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                      >
                        <option value="">No repeat</option>
                        {RECURRENCE_FREQS.map((freq) => (
                          <option key={freq.value} value={freq.value}>
                            {freq.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    {eventDetails.recurrence && (
                      <>
                        <div>
                          <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Every
                          </label>
                          <input
                            type="number"
                            min="1"
                            value={eventDetails.recurrence.interval || 1}
                            onChange={(e) => setEventDetails(prev => ({
                              ...prev,
                              recurrence: prev.recurrence ? {
                                ...prev.recurrence,
                                interval: Number.parseInt(e.target.value) || 1
                              } : undefined
                            }))}
                            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                          />
                        </div>

                        <div>
                          <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Until
                          </label>
                          <input
                            type="date"
                            value={eventDetails.recurrence.until || ""}
                            onChange={(e) => setEventDetails(prev => ({
                              ...prev,
                              recurrence: prev.recurrence ? {
                                ...prev.recurrence,
                                until: e.target.value || undefined
                              } : undefined
                            }))}
                            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                          />
                        </div>
                      </>
                    )}
                  </div>

                  {eventDetails.recurrence?.freq === "WEEKLY" && (
                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Repeat on
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {DAYS_OF_WEEK.map((day) => (
                          <label key={day.value} className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={eventDetails.recurrence?.byDay?.includes(day.value) || false}
                              onChange={(e) => {
                                const currentByDay = eventDetails.recurrence?.byDay || []
                                const newByDay = e.target.checked
                                  ? [...currentByDay, day.value]
                                  : currentByDay.filter(d => d !== day.value)

                                setEventDetails(prev => ({
                                  ...prev,
                                  recurrence: prev.recurrence ? {
                                    ...prev.recurrence,
                                    byDay: newByDay
                                  } : undefined
                                }))
                              }}
                              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-gray-700"
                            />
                            <span className="text-sm text-gray-700 dark:text-gray-300">{day.label}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </details>

              {/* Generate Button */}
              <button
                onClick={generateCalendarData}
                className="group relative w-full overflow-hidden rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4 font-semibold text-white transition-all duration-200 hover:from-blue-700 hover:to-indigo-700 hover:shadow-lg hover:shadow-blue-500/25 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                <span className="relative z-10 flex items-center justify-center gap-2">
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Generate Calendar Links & ICS
                </span>
              </button>
            </div>
          </section>

          {/* Outputs Section */}
          {hasGenerated ? (
            <section className="mb-12 overflow-hidden rounded-3xl border border-gray-200/50 bg-white/80 p-8 shadow-2xl shadow-gray-900/5 backdrop-blur-sm dark:border-gray-700/50 dark:bg-gray-900/80 dark:shadow-black/20">
              <h2 className="mb-6 text-2xl font-bold text-gray-900 dark:text-white">
                Calendar Links & Download
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Links generated successfully! Click to copy or open directly.
              </p>

              {/* Calendar Links */}
              <div className="space-y-6">
                {/* Google Calendar */}
                <div className="rounded-2xl border border-emerald-200/50 bg-gradient-to-r from-emerald-50 to-green-50 p-6 shadow-lg dark:border-emerald-800/30 dark:from-emerald-900/20 dark:to-green-900/20">
                  <div className="mb-4 flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/50">
                      <svg className="h-4 w-4 text-emerald-600 dark:text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-emerald-900 dark:text-emerald-100">Google Calendar</h3>
                  </div>

                  <div className="mb-4 flex gap-2">
                    <div className="relative flex-1">
                      <input
                        type="text"
                        value={generatedLinks.google}
                        readOnly
                        className="w-full rounded-xl border border-emerald-200 bg-white/80 px-4 py-3 pr-12 text-sm font-mono text-gray-900 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:border-emerald-700/50 dark:bg-gray-800/80 dark:text-white"
                      />
                    </div>
                    <button
                      onClick={() => copyToClipboard(generatedLinks.google, "Google")}
                      className={`group flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 ${
                        copySuccess === "Google"
                          ? "bg-green-600 text-white"
                          : "bg-emerald-600 text-white hover:bg-emerald-700 hover:shadow-lg"
                      }`}
                    >
                      {copySuccess === "Google" ? "Copied!" : "Copy"}
                    </button>
                    <button
                      onClick={() => window.open(generatedLinks.google, '_blank')}
                      className="group flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-green-600 px-4 py-3 font-semibold text-white transition-all hover:from-emerald-700 hover:to-green-700 hover:shadow-lg"
                    >
                      Open
                    </button>
                  </div>
                </div>

                {/* Outlook Live */}
                <div className="rounded-2xl border border-blue-200/50 bg-gradient-to-r from-blue-50 to-indigo-50 p-6 shadow-lg dark:border-blue-800/30 dark:from-blue-900/20 dark:to-indigo-900/20">
                  <div className="mb-4 flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/50">
                      <svg className="h-4 w-4 text-blue-600 dark:text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100">Outlook.com</h3>
                  </div>

                  <div className="mb-4 flex gap-2">
                    <div className="relative flex-1">
                      <input
                        type="text"
                        value={generatedLinks.outlookLive}
                        readOnly
                        className="w-full rounded-xl border border-blue-200 bg-white/80 px-4 py-3 pr-12 text-sm font-mono text-gray-900 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-blue-700/50 dark:bg-gray-800/80 dark:text-white"
                      />
                    </div>
                    <button
                      onClick={() => copyToClipboard(generatedLinks.outlookLive, "Outlook Live")}
                      className={`group flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                        copySuccess === "Outlook Live"
                          ? "bg-green-600 text-white"
                          : "bg-blue-600 text-white hover:bg-blue-700 hover:shadow-lg"
                      }`}
                    >
                      {copySuccess === "Outlook Live" ? "Copied!" : "Copy"}
                    </button>
                    <button
                      onClick={() => window.open(generatedLinks.outlookLive, '_blank')}
                      className="group flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-3 font-semibold text-white transition-all hover:from-blue-700 hover:to-indigo-700 hover:shadow-lg"
                    >
                      Open
                    </button>
                  </div>
                </div>

                {/* Yahoo Calendar */}
                <div className="rounded-2xl border border-purple-200/50 bg-gradient-to-r from-purple-50 to-pink-50 p-6 shadow-lg dark:border-purple-800/30 dark:from-purple-900/20 dark:to-pink-900/20">
                  <div className="mb-4 flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900/50">
                      <svg className="h-4 w-4 text-purple-600 dark:text-purple-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 8a6 6 0 01-7.743 5.743L10 14l-1 1-1 1H6v2H2v-4l4.257-4.257A6 6 0 1118 8zm-6-4a1 1 0 100 2 2 2 0 012 2 1 1 0 102 0 4 4 0 00-4-4z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-purple-900 dark:text-purple-100">Yahoo Calendar</h3>
                  </div>

                  <div className="mb-4 flex gap-2">
                    <div className="relative flex-1">
                      <input
                        type="text"
                        value={generatedLinks.yahoo}
                        readOnly
                        className="w-full rounded-xl border border-purple-200 bg-white/80 px-4 py-3 pr-12 text-sm font-mono text-gray-900 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-purple-500 dark:border-purple-700/50 dark:bg-gray-800/80 dark:text-white"
                      />
                    </div>
                    <button
                      onClick={() => copyToClipboard(generatedLinks.yahoo, "Yahoo")}
                      className={`group flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 ${
                        copySuccess === "Yahoo"
                          ? "bg-green-600 text-white"
                          : "bg-purple-600 text-white hover:bg-purple-700 hover:shadow-lg"
                      }`}
                    >
                      {copySuccess === "Yahoo" ? "Copied!" : "Copy"}
                    </button>
                    <button
                      onClick={() => window.open(generatedLinks.yahoo, '_blank')}
                      className="group flex items-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 px-4 py-3 font-semibold text-white transition-all hover:from-purple-700 hover:to-pink-700 hover:shadow-lg"
                    >
                      Open
                    </button>
                  </div>
                </div>

                {/* ICS Download */}
                <div className="rounded-2xl border border-gray-200/50 bg-gradient-to-r from-gray-50 to-slate-50 p-6 shadow-lg dark:border-gray-700/50 dark:from-gray-900/20 dark:to-slate-900/20">
                  <div className="mb-4 flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
                      <svg className="h-4 w-4 text-gray-600 dark:text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586 11.293 8.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 011.414-1.414z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Download ICS File</h3>
                  </div>

                  <div className="text-center">
                    <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">
                      Compatible with Apple Calendar, Outlook, Google Calendar, and other calendar apps
                    </p>
                    <button
                      onClick={downloadIcsFile}
                      className="group flex items-center gap-2 rounded-xl bg-gradient-to-r from-gray-600 to-slate-600 px-6 py-3 font-semibold text-white transition-all hover:from-gray-700 hover:to-slate-700 hover:shadow-lg"
                    >
                      <svg className="h-5 w-5 transition-transform group-hover:scale-110" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586 11.293 8.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 011.414-1.414z" clipRule="evenodd" />
                      </svg>
                      Download .ics File
                    </button>
                  </div>
                </div>
              </div>
            </section>
          ) : (
            <section className="mb-12 overflow-hidden rounded-3xl border border-gray-200/50 bg-white/80 p-8 shadow-2xl shadow-gray-900/5 backdrop-blur-sm dark:border-gray-700/50 dark:bg-gray-900/80 dark:shadow-black/20">
              <h2 className="mb-6 text-2xl font-bold text-gray-900 dark:text-white">
                Calendar Links & Download
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Links and .ics file will appear here after generating...
              </p>
            </section>
          )}

          {/* FAQ Section */}
          <section className="mb-12 overflow-hidden rounded-3xl border border-gray-200/50 bg-white/80 p-8 shadow-2xl shadow-gray-900/5 backdrop-blur-sm dark:border-gray-700/50 dark:bg-gray-900/80 dark:shadow-black/20">
            <h2 className="mb-8 text-2xl font-bold text-gray-900 dark:text-white">
              Frequently Asked Questions
            </h2>
            
            <div className="space-y-6">
              <details className="group">
                <summary className="cursor-pointer text-lg font-semibold text-gray-900 hover:text-blue-600 dark:text-white dark:hover:text-blue-400">
                  How do I create a Google Calendar link?
                </summary>
                <div className="mt-3 text-gray-600 dark:text-gray-400">
                  <p>Fill out the event details form above and click "Generate Calendar Links & ICS". The tool will create a Google Calendar link that, when clicked, opens Google Calendar with your event pre-filled. Users can then save it to their calendar with one click.</p>
                </div>
              </details>

              <details className="group">
                <summary className="cursor-pointer text-lg font-semibold text-gray-900 hover:text-blue-600 dark:text-white dark:hover:text-blue-400">
                  What is an ICS file and how do I use it?
                </summary>
                <div className="mt-3 text-gray-600 dark:text-gray-400">
                  <p>An ICS file is a standard calendar file format (iCalendar) that works with all major calendar applications including Apple Calendar, Outlook, Google Calendar, and more. When you download an ICS file, you can double-click it to import the event into your default calendar app, or manually import it through your calendar's import function.</p>
                </div>
              </details>

              <details className="group">
                <summary className="cursor-pointer text-lg font-semibold text-gray-900 hover:text-blue-600 dark:text-white dark:hover:text-blue-400">
                  Do calendar links work on mobile devices?
                </summary>
                <div className="mt-3 text-gray-600 dark:text-gray-400">
                  <p>Yes! Calendar links work on both desktop and mobile devices. On mobile, clicking a calendar link will typically open the device's default calendar app (like Apple Calendar on iOS or Google Calendar on Android) with the event details pre-filled.</p>
                </div>
              </details>

              <details className="group">
                <summary className="cursor-pointer text-lg font-semibold text-gray-900 hover:text-blue-600 dark:text-white dark:hover:text-blue-400">
                  Can I create recurring events?
                </summary>
                <div className="mt-3 text-gray-600 dark:text-gray-400">
                  <p>Absolutely! Use the "Advanced Options (Recurrence)" section to set up daily, weekly, monthly, or yearly recurring events. You can specify intervals (every 2 weeks), specific days (Mondays and Wednesdays), and end dates for the recurrence series.</p>
                </div>
              </details>

              <details className="group">
                <summary className="cursor-pointer text-lg font-semibold text-gray-900 hover:text-blue-600 dark:text-white dark:hover:text-blue-400">
                  Is my event data stored on your servers?
                </summary>
                <div className="mt-3 text-gray-600 dark:text-gray-400">
                  <p>No, absolutely not! Everything happens locally in your browser. Your event details, calendar links, and ICS files are generated client-side using JavaScript. Nothing is sent to or stored on our servers, ensuring complete privacy for your events.</p>
                </div>
              </details>

              <details className="group">
                <summary className="cursor-pointer text-lg font-semibold text-gray-900 hover:text-blue-600 dark:text-white dark:hover:text-blue-400">
                  What's the difference between all-day and timed events?
                </summary>
                <div className="mt-3 text-gray-600 dark:text-gray-400">
                  <p>All-day events span entire days without specific times (like birthdays or holidays) and appear at the top of calendar views. Timed events have specific start and end times (like meetings) and appear in time slots. Check the "All-day event" box for events that don't have specific times.</p>
                </div>
              </details>

              <details className="group">
                <summary className="cursor-pointer text-lg font-semibold text-gray-900 hover:text-blue-600 dark:text-white dark:hover:text-blue-400">
                  Can I add attendees to calendar events?
                </summary>
                <div className="mt-3 text-gray-600 dark:text-gray-400">
                  <p>Yes! Add comma-separated email addresses in the "Attendees" field. When the calendar link is used or ICS file is imported, the calendar app will typically send invitations to the specified attendees (depending on the user's calendar settings).</p>
                </div>
              </details>

              <details className="group">
                <summary className="cursor-pointer text-lg font-semibold text-gray-900 hover:text-blue-600 dark:text-white dark:hover:text-blue-400">
                  Do reminders work in all calendar apps?
                </summary>
                <div className="mt-3 text-gray-600 dark:text-gray-400">
                  <p>Reminders are supported by most modern calendar applications when using ICS files. However, calendar links (URLs) have limited reminder support as they depend on the specific calendar service's URL parameters. For best reminder compatibility, use the downloadable ICS file.</p>
                </div>
              </details>
            </div>
          </section>

          {/* Footer */}
          <footer className="mt-12 rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
            <div className="space-y-4 text-center">
              <div className="flex flex-wrap justify-center gap-4 text-sm">
                <a
                  href="/discord-timestamp"
                  className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                >
                  Discord Timestamp Generator
                </a>
                <span className="text-gray-500">•</span>
                <a
                  href="/chat-link-generator"
                  className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                >
                  Chat Link Generator
                </a>
                <span className="text-gray-500">•</span>
                <a
                  href="/countdown"
                  className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                >
                  Countdown Timer Generator
                </a>
                <span className="text-gray-500">•</span>
                <a
                  href="/"
                  className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                >
                  Home
                </a>
              </div>

              <p className="text-sm text-gray-500 dark:text-gray-400">
                Everything is created locally in your browser. Nothing is stored or sent to our servers.
              </p>
            </div>
          </footer>
        </main>
      </div>
    </div>
  )
}
