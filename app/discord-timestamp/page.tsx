"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useToast } from "@/hooks/use-toast"
import * as chrono from "chrono-node"

/**
 * Minimal, mobile-first UI for Discord timestamp generation and snowflake decoding.
 * Emphasizes clarity and quick actions with accessible defaults.
 */
const formatOptions = [
  { value: "t", label: "Short Time", example: "16:20" },
  { value: "T", label: "Long Time", example: "16:20:30" },
  { value: "d", label: "Short Date", example: "20/04/2021" },
  { value: "D", label: "Long Date", example: "20 April 2021" },
  { value: "f", label: "Short Date/Time", example: "20 April 2021 16:20" },
  { value: "F", label: "Long Date/Time", example: "Tuesday, 20 April 2021 16:20" },
  { value: "R", label: "Relative Time", example: "2 months ago" },
]

/** Main page component that handles input, parsing, generation, and UI state. */
export default function DiscordTimestampGenerator() {
  const [naturalInput, setNaturalInput] = useState("")
  const [parseError, setParseError] = useState("")
  const [parsedPreview, setParsedPreview] = useState("")

  const [dateTime, setDateTime] = useState("")
  const [format, setFormat] = useState("R")
  const [timestamp, setTimestamp] = useState("")
  const [snowflakeId, setSnowflakeId] = useState("")
  const [showAllFormats, setShowAllFormats] = useState(false)
  const [activeTab, setActiveTab] = useState("datetime")
  const [previewTimezone, setPreviewTimezone] = useState<"local" | "utc">("local")
  const [copySuccess, setCopySuccess] = useState("")
  const [faqOpen, setFaqOpen] = useState(false)
  const [howToUseOpen, setHowToUseOpen] = useState(false)
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [advancedOpen, setAdvancedOpen] = useState(false)
  const [dateFormat, setDateFormat] = useState<"auto" | "mdy" | "dmy" | "ymd">("auto")
  const [timeFormat, setTimeFormat] = useState<"auto" | "12" | "24">("auto")
  const [enterCopies, setEnterCopies] = useState(true)
  const { toast } = useToast()

  const [suggestions, setSuggestions] = useState<Array<{ text: string; date: Date; description: string }>>([])
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1)
  const [showSuggestions, setShowSuggestions] = useState(false)

  useEffect(() => {
    const savedSettings = localStorage.getItem("discord-timestamp-settings")
    if (savedSettings) {
      const settings = JSON.parse(savedSettings)
      setDateFormat(settings.dateFormat || "auto")
      setTimeFormat(settings.timeFormat || "auto")
      setEnterCopies(settings.enterCopies ?? true)
    } else {
      // Detect locale
      const locale = navigator.language || "en-US"
      if (locale.startsWith("en-US")) {
        setDateFormat("mdy")
      } else if (locale.startsWith("en-GB") || locale.includes("DE") || locale.includes("FR")) {
        setDateFormat("dmy")
      } else {
        setDateFormat("ymd")
      }
    }
  }, [])

  const saveSettings = () => {
    localStorage.setItem(
      "discord-timestamp-settings",
      JSON.stringify({
        dateFormat,
        timeFormat,
        enterCopies,
      }),
    )
  }

  useEffect(() => {
    saveSettings()
  }, [dateFormat, timeFormat, enterCopies])

  /** Fallback parser using chrono-node for robust natural language parsing. */
  const parseWithChrono = (input: string): Date | null => {
    try {
      const isUS = (navigator.language || "en-US").startsWith("en-US")
      const parser = isUS ? chrono.en : (chrono as any).en_GB || chrono.en
      const results = parser.parse(input, new Date())
      if (!results || results.length === 0) return null
      return results[0].start.date()
    } catch {
      return null
    }
  }

  /** Parse a broad set of natural-language time expressions into a Date. */
  const parseNaturalLanguage = (input: string): Date | null => {
    if (!input.trim()) return null

    const now = new Date()
    const inputLower = input.toLowerCase().trim()

    // Handle "now" or "current time"
    if (inputLower === "now" || inputLower === "current time" || inputLower === "right now") {
      return now
    }

    // Handle relative times with more variations
    const relativeMatch = inputLower.match(
      /^(?:in\s+)?(\d+)\s*(h|hr|hrs|hour|hours|m|min|mins|minute|minutes|s|sec|secs|second|seconds|d|day|days|w|week|weeks|month|months|y|year|years)(?:\s+ago)?$/i,
    )
    if (relativeMatch) {
      const amount = Number.parseInt(relativeMatch[1])
      const unit = relativeMatch[2]
      const isAgo = inputLower.includes("ago")
      const multiplier = isAgo ? -1 : 1

      let milliseconds = 0
      if (unit.startsWith("s")) milliseconds = amount * 1000
      else if (unit.startsWith("m") && !unit.includes("month")) milliseconds = amount * 60 * 1000
      else if (unit.startsWith("h")) milliseconds = amount * 60 * 60 * 1000
      else if (unit.startsWith("d")) milliseconds = amount * 24 * 60 * 60 * 1000
      else if (unit.startsWith("w")) milliseconds = amount * 7 * 24 * 60 * 60 * 1000
      else if (unit.includes("month")) milliseconds = amount * 30 * 24 * 60 * 60 * 1000
      else if (unit.startsWith("y")) milliseconds = amount * 365 * 24 * 60 * 60 * 1000

      return new Date(now.getTime() + milliseconds * multiplier)
    }

    // Handle contextual times like "this morning", "this afternoon", "tonight"
    const contextualTimes: Record<string, number> = {
      "this morning": 9,
      morning: 9,
      "this afternoon": 14,
      afternoon: 14,
      "this evening": 18,
      evening: 18,
      tonight: 20,
      night: 20,
      midnight: 0,
      noon: 12,
      midday: 12,
    }

    for (const [phrase, hour] of Object.entries(contextualTimes)) {
      if (inputLower === phrase) {
        const result = new Date(now)
        result.setHours(hour, 0, 0, 0)
        return result
      }
    }

    // Handle "tomorrow", "yesterday", "today"
    const dayOffsets: Record<string, number> = {
      yesterday: -1,
      today: 0,
      tomorrow: 1,
      "day after tomorrow": 2,
      overmorrow: 2,
    }

    for (const [phrase, offset] of Object.entries(dayOffsets)) {
      if (inputLower === phrase) {
        const result = new Date(now)
        result.setDate(result.getDate() + offset)
        return result
      }
    }

    // Enhanced single hour matching with better AM/PM detection
    const singleHourMatch = inputLower.match(/^(\d{1,2})(?:\s*(am|pm|a|p))?$/i)
    if (singleHourMatch) {
      const hour = Number.parseInt(singleHourMatch[1])
      let ampm = singleHourMatch[2]

      // Normalize single letter AM/PM
      if (ampm === "a") ampm = "am"
      if (ampm === "p") ampm = "pm"

      const result = new Date(now)
      let finalHour = hour

      if (ampm === "pm" && hour !== 12) finalHour += 12
      else if (ampm === "am" && hour === 12) finalHour = 0
      else if (!ampm) {
        // Smart defaulting based on current time and context
        if (hour >= 1 && hour <= 7) {
          // 1-7 without AM/PM likely means PM in most contexts
          finalHour = hour + 12
        } else if (hour >= 8 && hour <= 11) {
          // 8-11 could be AM or PM, default to next occurrence
          const currentHour = now.getHours()
          if (currentHour >= hour) {
            finalHour = hour + 12 // PM
          } else {
            finalHour = hour // AM
          }
        } else if (hour === 12) {
          finalHour = 12 // Noon
        }
      }

      result.setHours(finalHour, 0, 0, 0)
      return result
    }

    // Enhanced day matching with more flexible patterns
    const dayMatch = inputLower.match(
      /^(next|last|this)\s+(monday|tuesday|wednesday|thursday|friday|saturday|sunday|mon|tue|wed|thu|fri|sat|sun)(?:\s+(?:at\s+)?(\d{1,2})(?::(\d{2}))?\s*(am|pm|a|p)?)?$/i,
    )
    if (dayMatch) {
      const direction = dayMatch[1]
      const dayName = dayMatch[2]
      const hour = dayMatch[3] ? Number.parseInt(dayMatch[3]) : 9
      const minute = dayMatch[4] ? Number.parseInt(dayMatch[4]) : 0
      let ampm = dayMatch[5]

      if (ampm === "a") ampm = "am"
      if (ampm === "p") ampm = "pm"

      const days = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"]
      const shortDays = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"]

      let targetDay = days.indexOf(dayName)
      if (targetDay === -1) targetDay = shortDays.indexOf(dayName)

      if (targetDay !== -1) {
        const result = new Date(now)
        const currentDay = result.getDay()

        let daysToAdd = targetDay - currentDay
        if (direction === "next") {
          if (daysToAdd <= 0) daysToAdd += 7
        } else if (direction === "last") {
          if (daysToAdd >= 0) daysToAdd -= 7
        } else if (direction === "this") {
          // "this" means the upcoming occurrence within this week
          if (daysToAdd < 0) daysToAdd += 7
        }

        result.setDate(result.getDate() + daysToAdd)

        let finalHour = hour
        if (ampm === "pm" && hour !== 12) finalHour += 12
        else if (ampm === "am" && hour === 12) finalHour = 0

        result.setHours(finalHour, minute, 0, 0)
        return result
      }
    }

    // Enhanced day + time matching
    const dayTimeMatch = inputLower.match(
      /^(today|tomorrow|yesterday)\s+(?:at\s+)?(\d{1,2})(?::(\d{2}))?\s*(am|pm|a|p)?$/i,
    )
    if (dayTimeMatch) {
      const day = dayTimeMatch[1]
      const hour = Number.parseInt(dayTimeMatch[2])
      const minute = dayTimeMatch[3] ? Number.parseInt(dayTimeMatch[3]) : 0
      let ampm = dayTimeMatch[4]

      if (ampm === "a") ampm = "am"
      if (ampm === "p") ampm = "pm"

      const result = new Date(now)
      if (day === "tomorrow") result.setDate(result.getDate() + 1)
      if (day === "yesterday") result.setDate(result.getDate() - 1)

      let finalHour = hour
      if (ampm === "pm" && hour !== 12) finalHour += 12
      else if (ampm === "am" && hour === 12) finalHour = 0

      result.setHours(finalHour, minute, 0, 0)
      return result
    }

    // Handle time ranges and "around" times
    const aroundTimeMatch = inputLower.match(/^(?:around|about|approximately)\s+(\d{1,2})(?::(\d{2}))?\s*(am|pm)?$/i)
    if (aroundTimeMatch) {
      const hour = Number.parseInt(aroundTimeMatch[1])
      const minute = aroundTimeMatch[2] ? Number.parseInt(aroundTimeMatch[2]) : 0
      const ampm = aroundTimeMatch[3]

      const result = new Date(now)
      let finalHour = hour
      if (ampm === "pm" && hour !== 12) finalHour += 12
      else if (ampm === "am" && hour === 12) finalHour = 0

      result.setHours(finalHour, minute, 0, 0)
      return result
    }

    // Enhanced date parsing with better format detection
    try {
      let dateString = input

      // Year-first detection (2025/09/13 or 2025-09-13)
      const yearFirstMatch = input.match(
        /^(\d{4})[./-](\d{1,2})[./-](\d{1,2})(?:\s+(?:at\s+)?(\d{1,2}):(\d{2})(?:\s*(am|pm))?)?$/i,
      )
      if (yearFirstMatch) {
        const year = yearFirstMatch[1]
        const month = yearFirstMatch[2].padStart(2, "0")
        const day = yearFirstMatch[3].padStart(2, "0")
        let timeStr = ""
        if (yearFirstMatch[4] && yearFirstMatch[5]) {
          let hour = Number.parseInt(yearFirstMatch[4])
          const minute = yearFirstMatch[5]
          const ampm = yearFirstMatch[6]

          if (ampm === "pm" && hour !== 12) hour += 12
          else if (ampm === "am" && hour === 12) hour = 0

          timeStr = ` ${hour.toString().padStart(2, "0")}:${minute}`
        }
        dateString = `${year}-${month}-${day}${timeStr}`
      } else {
        // Handle various date formats with mixed delimiters
        const dateMatch = input.match(
          /^(\d{1,2})[./-](\d{1,2})[./-](\d{2,4})(?:\s+(?:at\s+)?(\d{1,2}):(\d{2})(?:\s*(am|pm))?)?$/i,
        )
        if (dateMatch) {
          const first = dateMatch[1].padStart(2, "0")
          const second = dateMatch[2].padStart(2, "0")
          let year = dateMatch[3]
          if (year.length === 2) year = "20" + year

          let timeStr = ""
          if (dateMatch[4] && dateMatch[5]) {
            let hour = Number.parseInt(dateMatch[4])
            const minute = dateMatch[5]
            const ampm = dateMatch[6]

            if (ampm === "pm" && hour !== 12) hour += 12
            else if (ampm === "am" && hour === 12) hour = 0

            timeStr = ` ${hour.toString().padStart(2, "0")}:${minute}`
          }

          // Use date format preference
          if (dateFormat === "dmy" || (dateFormat === "auto" && !navigator.language.startsWith("en-US"))) {
            dateString = `${year}-${second}-${first}${timeStr}`
          } else {
            dateString = `${year}-${first}-${second}${timeStr}`
          }
        }
      }

      const parsed = new Date(dateString)
      if (!isNaN(parsed.getTime())) {
        return parsed
      }

      // Fallback: try native Date parsing
      const nativeParsed = new Date(input)
      if (!isNaN(nativeParsed.getTime())) {
        return nativeParsed
      }
    } catch (e) {
      // Continue to fallback
    }

    // Fallback to chrono-node for broader coverage
    const chronoDate = parseWithChrono(input)
    if (chronoDate) return chronoDate

    return null
  }

  /** Generate helpful suggestion options for partially entered inputs. */
  const generateSuggestions = (input: string): Array<{ text: string; date: Date; description: string }> => {
    if (!input.trim()) return []

    const suggestions: Array<{ text: string; date: Date; description: string }> = []
    const now = new Date()
    const inputLower = input.toLowerCase().trim()

    // Try exact parsing first
    const exactParse = parseNaturalLanguage(input)
    if (exactParse) {
      return [] // Don't show suggestions if we have an exact match
    }

    // Handle partial inputs more intelligently
    if (inputLower.match(/^\d{1,2}$/)) {
      const hour = Number.parseInt(inputLower)
      if (hour >= 1 && hour <= 12) {
        // AM interpretation
        const amDate = new Date(now)
        amDate.setHours(hour === 12 ? 0 : hour, 0, 0, 0)
        suggestions.push({
          text: `${hour} AM`,
          date: amDate,
          description: `${hour}:00 AM today`,
        })

        // PM interpretation
        const pmDate = new Date(now)
        pmDate.setHours(hour === 12 ? 12 : hour + 12, 0, 0, 0)
        suggestions.push({
          text: `${hour} PM`,
          date: pmDate,
          description: `${hour}:00 PM today`,
        })
      }
    }

    // Handle partial day names with better matching
    const dayNames = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]
    const matchingDays = dayNames.filter((day) => day.startsWith(inputLower) && inputLower.length >= 2)

    matchingDays.forEach((day) => {
      const nextDate = new Date(now)
      const targetDay = dayNames.indexOf(day)
      const currentDay = nextDate.getDay()
      let daysToAdd = targetDay + 1 - currentDay
      if (daysToAdd <= 0) daysToAdd += 7

      nextDate.setDate(nextDate.getDate() + daysToAdd)
      nextDate.setHours(9, 0, 0, 0)

      suggestions.push({
        text: `next ${day}`,
        date: nextDate,
        description: `Next ${day.charAt(0).toUpperCase() + day.slice(1)} at 9:00 AM`,
      })
    })

    // Handle "in" prefix with smart suggestions (supports: "in", "in 4", etc.)
    if (/^in\s*$/.test(inputLower)) {
      const commonRelative = [
        { text: "in 15 minutes", minutes: 15 },
        { text: "in 30 minutes", minutes: 30 },
        { text: "in 1 hour", minutes: 60 },
        { text: "in 2 hours", minutes: 120 },
      ]

      commonRelative.forEach(({ text, minutes }) => {
        const futureDate = new Date(now.getTime() + minutes * 60 * 1000)
        suggestions.push({
          text,
          date: futureDate,
          description: `${minutes} minutes from now`,
        })
      })
    } else {
      const inNumber = inputLower.match(/^in\s+(\d{1,4})$/)
      if (inNumber) {
        const amount = Number.parseInt(inNumber[1])
        const opts = [
          { label: `${amount} minutes from now`, minutes: amount },
          { label: `${amount} hours from now`, minutes: amount * 60 },
          { label: `${amount} days from now`, minutes: amount * 60 * 24 },
        ]
        opts.forEach((o) => {
          const futureDate = new Date(now.getTime() + o.minutes * 60 * 1000)
          const unit = o.label.split(" ")[1]
          const text = `in ${amount} ${unit}`
          suggestions.push({
            text,
            date: futureDate,
            description: o.label,
          })
        })
      }
    }

    // Handle partial "tomorrow" or "today"
    if ("tomorrow".startsWith(inputLower) && inputLower.length >= 3) {
      const tomorrow = new Date(now)
      tomorrow.setDate(tomorrow.getDate() + 1)
      tomorrow.setHours(9, 0, 0, 0)
      suggestions.push({
        text: "tomorrow",
        date: tomorrow,
        description: "Tomorrow at 9:00 AM",
      })
    }

    if ("today".startsWith(inputLower) && inputLower.length >= 2) {
      const today = new Date(now)
      today.setHours(now.getHours() + 1, 0, 0, 0)
      suggestions.push({
        text: "today",
        date: today,
        description: "Today at current time",
      })
    }

    // Remove duplicates and limit suggestions
    const uniqueSuggestions = suggestions
      .filter((suggestion, index, self) => index === self.findIndex((s) => s.text === suggestion.text))
      .slice(0, 6)

    return uniqueSuggestions
  }

  /** Handle input changes, update suggestions and immediate timestamp preview. */
  const handleNaturalInputChange = (value: string) => {
    setNaturalInput(value)
    setParseError("")
    setParsedPreview("")
    setSelectedSuggestionIndex(-1)

    if (!value.trim()) {
      setSuggestions([])
      setShowSuggestions(false)
      setTimestamp("") // Clear timestamp when input is empty
      return
    }

    const newSuggestions = generateSuggestions(value)
    setSuggestions(newSuggestions)
    const hasSuggestions = newSuggestions.length > 0
    setShowSuggestions(hasSuggestions) // Show dropdown if any suggestions
    setSelectedSuggestionIndex(hasSuggestions ? 0 : -1) // Default to first suggestion

    const parsed = parseNaturalLanguage(value)
    if (parsed) {
      const localDateTime = new Date(parsed.getTime() - parsed.getTimezoneOffset() * 60000).toISOString().slice(0, 16)
      setDateTime(localDateTime)

      // Generate timestamp immediately
      const unixTimestamp = Math.floor(parsed.getTime() / 1000)
      const discordTimestamp = `<t:${unixTimestamp}:${format}>`
      setTimestamp(discordTimestamp)

      // Generate preview
      const previewLocal = parsed.toLocaleString([], {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
      const previewUtc = parsed.toLocaleString([], {
        timeZone: "UTC",
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })

      if (previewTimezone === "utc") {
        setParsedPreview(`${previewLocal} (Local) • ${previewUtc} (UTC)`)
      } else {
        setParsedPreview(previewLocal)
      }
    } else if (value.trim().length > 2) {
      setParseError("No results")
      setTimestamp("")
    }
  }

  /** Apply a selected suggestion to the input and produce a timestamp. Optionally copy immediately. */
  const selectSuggestion = (
    suggestion: { text: string; date: Date; description: string },
    copyImmediately?: boolean,
  ) => {
    setNaturalInput(suggestion.text)
    const localDateTime = new Date(suggestion.date.getTime() - suggestion.date.getTimezoneOffset() * 60000)
      .toISOString()
      .slice(0, 16)
    setDateTime(localDateTime)

    const unixTimestamp = Math.floor(suggestion.date.getTime() / 1000)
    const discordTimestamp = `<t:${unixTimestamp}:${format}>`
    setTimestamp(discordTimestamp)

    if (copyImmediately) {
      copyToClipboard(discordTimestamp)
    }

    setShowSuggestions(false)
    setSelectedSuggestionIndex(-1)
    setParseError("")
  }

  /** Submit natural language input and produce a timestamp if valid. */
  const handleNaturalInputSubmit = () => {
    if (!naturalInput.trim()) return

    const parsed = parseNaturalLanguage(naturalInput)
    if (parsed) {
      const localDateTime = new Date(parsed.getTime() - parsed.getTimezoneOffset() * 60000).toISOString().slice(0, 16)
      setDateTime(localDateTime)

      const unixTimestamp = Math.floor(parsed.getTime() / 1000)
      const discordTimestamp = `<t:${unixTimestamp}:${format}>`
      setTimestamp(discordTimestamp)

      setParseError("")
    } else {
      setParseError("No results")
    }
  }

  /** On Enter, optionally copy the generated timestamp for quick workflows. */
  const handleEnterKeyCopy = () => {
    if (!naturalInput.trim()) return

    const parsed = parseNaturalLanguage(naturalInput)
    if (parsed) {
      const localDateTime = new Date(parsed.getTime() - parsed.getTimezoneOffset() * 60000).toISOString().slice(0, 16)
      setDateTime(localDateTime)

      const unixTimestamp = Math.floor(parsed.getTime() / 1000)
      const discordTimestamp = `<t:${unixTimestamp}:${format}>`
      setTimestamp(discordTimestamp)

      setParseError("")

      if (enterCopies) {
        copyToClipboard(discordTimestamp)
        toast({
          title: "Copied via Enter!",
          description: "Timestamp copied to clipboard",
        })
      }
    } else {
      setParseError("No results")
    }
  }

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme")
    const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches

    if (savedTheme === "dark" || (!savedTheme && systemPrefersDark)) {
      setIsDarkMode(true)
      document.documentElement.classList.add("dark")
    } else {
      setIsDarkMode(false)
      document.documentElement.classList.remove("dark")
    }
  }, [])

  useEffect(() => {
    const now = new Date()
    const localDateTime = new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 16)
    setDateTime(localDateTime)
  }, [])

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const unixParam = urlParams.get("unix")
    const formatParam = urlParams.get("format")
    const snowflakeParam = urlParams.get("snowflake")
    const tzParam = urlParams.get("tz")

    if (formatParam && formatOptions.some((opt) => opt.value === formatParam)) {
      setFormat(formatParam)
    }

    if (tzParam === "utc") {
      setPreviewTimezone("utc")
    } else if (tzParam === "local") {
      setPreviewTimezone("local")
    }

    if (snowflakeParam) {
      setSnowflakeId(snowflakeParam)
      setActiveTab("snowflake")
      setTimeout(() => decodeSnowflakeFromParam(snowflakeParam, formatParam || format), 100)
    } else if (unixParam) {
      const unixTimestamp = Number.parseInt(unixParam)
      if (!isNaN(unixTimestamp)) {
        const date = new Date(unixTimestamp * 1000)
        const localDateTime = new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 16)
        setDateTime(localDateTime)
        setTimeout(() => generateTimestampFromParams(unixTimestamp, formatParam || format), 100)
      }
    }
  }, [])

  /** Decode a snowflake from URL params to pre-populate the UI. */
  const decodeSnowflakeFromParam = (snowflake: string, formatType: string) => {
    try {
      const snowflakeBig = BigInt(snowflake)
      const discordEpoch = BigInt(1420070400000)
      const timestampMs = Number((snowflakeBig >> BigInt(22)) + discordEpoch)
      const date = new Date(timestampMs)

      if (!isNaN(date.getTime())) {
        const localDateTime = new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 16)
        setDateTime(localDateTime)

        const unixTimestamp = Math.floor(date.getTime() / 1000)
        const discordTimestamp = `<t:${unixTimestamp}:${formatType}>`
        setTimestamp(discordTimestamp)
      }
    } catch (err) {
      // Silently fail for invalid snowflakes from URL
    }
  }

  /** Build a timestamp when passed unix/format via URL params. */
  const generateTimestampFromParams = (unix: number, formatType: string) => {
    const discordTimestamp = `<t:${unix}:${formatType}>`
    setTimestamp(discordTimestamp)
  }

  /** Generate a Discord timestamp string from current selections. */
  const generateTimestamp = () => {
    if (naturalInput.trim()) {
      handleNaturalInputSubmit()
      return
    }

    if (!dateTime) {
      toast({
        title: "Error",
        description: "Please enter a date and time",
        variant: "destructive",
      })
      return
    }

    const date = new Date(dateTime)

    if (isNaN(date.getTime())) {
      toast({
        title: "Error",
        description: "Please enter a valid date and time",
        variant: "destructive",
      })
      return
    }

    const unixTimestamp = Math.floor(date.getTime() / 1000)
    const discordTimestamp = `<t:${unixTimestamp}:${format}>`
    setTimestamp(discordTimestamp)
  }

  /** Decode a Discord snowflake into a timestamp and populate fields. */
  const decodeSnowflake = () => {
    if (!snowflakeId) {
      toast({
        title: "Error",
        description: "Please enter a snowflake ID",
        variant: "destructive",
      })
      return
    }

    try {
      const snowflake = BigInt(snowflakeId)
      const discordEpoch = BigInt(1420070400000) // Discord epoch: January 1, 2015
      const timestampMs = Number((snowflake >> BigInt(22)) + discordEpoch)
      const date = new Date(timestampMs)

      if (isNaN(date.getTime())) {
        throw new Error("Invalid snowflake")
      }

      const localDateTime = new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 16)
      setDateTime(localDateTime)

      const unixTimestamp = Math.floor(date.getTime() / 1000)
      const discordTimestamp = `<t:${unixTimestamp}:${format}>`
      setTimestamp(discordTimestamp)

      toast({
        title: "Success",
        description: "Snowflake decoded successfully",
      })
    } catch (err) {
      toast({
        title: "Error",
        description: "Invalid snowflake ID",
        variant: "destructive",
      })
    }
  }

  /** Copy helper for timestamps and links. */
  const copyToClipboard = async (text = timestamp) => {
    if (!text) return

    try {
      await navigator.clipboard.writeText(text)
      setCopySuccess(text)
      toast({
        title: "Copied!",
        description: "Timestamp copied to clipboard",
      })
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to copy to clipboard",
        variant: "destructive",
      })
    }
  }

  /** Create and copy a shareable URL reflecting the current state. */
  const copyShareableLink = async () => {
    const url = new URL(window.location.href)
    url.search = ""

    url.searchParams.set("tz", previewTimezone)

    if (activeTab === "snowflake" && snowflakeId) {
      url.searchParams.set("snowflake", snowflakeId)
      url.searchParams.set("format", format)
    } else if (dateTime) {
      const date = new Date(dateTime)
      if (!isNaN(date.getTime())) {
        const unixTimestamp = Math.floor(date.getTime() / 1000)
        url.searchParams.set("unix", unixTimestamp.toString())
        url.searchParams.set("format", format)
      }
    }

    try {
      await navigator.clipboard.writeText(url.toString())
      toast({
        title: "Link Copied!",
        description: "Shareable link copied to clipboard",
      })
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to copy link",
        variant: "destructive",
      })
    }
  }

  /** Set the picker to the current local time and clear parsing state. */
  const setCurrentTime = () => {
    const now = new Date()
    const localDateTime = new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 16)
    setDateTime(localDateTime)
    setNaturalInput("")
    setParseError("")
    setParsedPreview("")
  }

  /** Human-readable preview for the chosen format and timezone. */
  const getPreview = (formatType = format, timezoneMode: "local" | "utc" = previewTimezone) => {
    if (!dateTime) return "No date selected"

    const date = new Date(dateTime)
    if (isNaN(date.getTime())) return "Invalid date"

    const options: Intl.DateTimeFormatOptions = {
      timeZone: timezoneMode === "utc" ? "UTC" : undefined,
    }

    switch (formatType) {
      case "t":
        return date.toLocaleTimeString([], { ...options, hour: "2-digit", minute: "2-digit" })
      case "T":
        return date.toLocaleTimeString([], options)
      case "d":
        return date.toLocaleDateString([], options)
      case "D":
        return date.toLocaleDateString([], { ...options, year: "numeric", month: "long", day: "numeric" })
      case "f":
        return date.toLocaleString([], {
          ...options,
          year: "numeric",
          month: "long",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })
      case "F":
        return date.toLocaleString([], {
          ...options,
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })
      case "R":
        return date.toLocaleString([], {
          ...options,
          year: "numeric",
          month: "long",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })
      default:
        return "Invalid format"
    }
  }

  /** Toggle light/dark themes and persist preference. */
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

  /** Keyboard shortcuts for suggestion selection and quick copy. */
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault()
      if (showSuggestions && selectedSuggestionIndex >= 0) {
        const chosen = suggestions[selectedSuggestionIndex]
        selectSuggestion(chosen, enterCopies)
      } else if (enterCopies && timestamp) {
        handleEnterKeyCopy()
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault()
      if (showSuggestions) {
        setSelectedSuggestionIndex((prev) => (prev + 1) % suggestions.length)
      }
    } else if (e.key === "ArrowUp") {
      e.preventDefault()
      if (showSuggestions) {
        setSelectedSuggestionIndex((prev) => (prev - 1 + suggestions.length) % suggestions.length)
      }
    } else if (e.key === "Escape") {
      setShowSuggestions(false)
      setSelectedSuggestionIndex(-1)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 dark:from-gray-950 dark:via-gray-900 dark:to-blue-950">
      <div className="mx-auto max-w-5xl px-4 py-12">
        <header className="mb-12 text-center">
          <div className="mb-6">
            <div className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-blue-50 to-indigo-50 px-4 py-2 text-sm font-medium text-blue-700 dark:from-blue-900/20 dark:to-indigo-900/20 dark:text-blue-300">
              <span className="text-lg">⏰</span>
              Smart Generators
            </div>
          </div>
          
          <h1 className="mb-6 text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
            <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
              Discord Timestamp Generator
            </span>
          </h1>
          
          <p className="mx-auto mb-8 max-w-2xl text-xl text-gray-600 dark:text-gray-300">
            Type a time. Press Enter. Copy instantly. 
            <span className="font-semibold text-gray-900 dark:text-white">Generate perfect Discord timestamps in seconds.</span>
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
              Instant Results
            </div>
            <div className="inline-flex items-center gap-2 rounded-full bg-purple-100 px-4 py-2 text-sm font-semibold text-purple-800 shadow-sm dark:bg-purple-900/30 dark:text-purple-300">
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 8a6 6 0 01-7.743 5.743L10 14l-1 1-1 1H6v2H2v-4l4.257-4.257A6 6 0 1118 8zm-6-4a1 1 0 100 2 2 2 0 012 2 1 1 0 102 0 4 4 0 00-4-4z" clipRule="evenodd" />
              </svg>
              No Signup
            </div>
          </div>
          
          <div className="absolute top-8 right-8">
            <button
              onClick={toggleTheme}
              className="h-10 w-10 rounded-full border border-gray-200/50 bg-white/80 text-sm backdrop-blur-sm transition-all hover:bg-gray-50 hover:shadow-md dark:border-gray-700/50 dark:bg-gray-900/80 dark:hover:bg-gray-800"
              aria-label={`Switch to ${isDarkMode ? "light" : "dark"} mode`}
              title={`Switch to ${isDarkMode ? "light" : "dark"} mode`}
            >
              {isDarkMode ? (
                <span className="block h-full w-full p-2" role="img" aria-label="Moon icon">🌙</span>
              ) : (
                <span className="block h-full w-full p-2" role="img" aria-label="Sun icon">☀️</span>
              )}
            </button>
          </div>
        </header>

        <main>
        {/* Main Input Section */}
        <section className="mb-12 overflow-hidden rounded-3xl border border-gray-200/50 bg-white/80 p-8 shadow-2xl shadow-gray-900/5 backdrop-blur-sm dark:border-gray-700/50 dark:bg-gray-900/80 dark:shadow-black/20" aria-labelledby="timestamp-generator">
          <div className="space-y-6">
            {/* Natural Language Input */}
            <div className="relative">
              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300" id="timestamp-generator">
                Natural language date & time
              </label>
              <input
                type="text"
                value={naturalInput}
                onChange={(e) => handleNaturalInputChange(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Examples: 'in 45 min', 'tomorrow 19:30', 'next Fri 8am'"
                className="w-full h-12 rounded-xl border border-gray-300 bg-white/70 px-4 py-3 text-lg text-gray-900 backdrop-blur-sm transition-colors placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800/70 dark:text-white"
              />

              {/* Suggestions Dropdown */}
              {showSuggestions && suggestions.length > 0 && (
                <div className="absolute left-0 right-0 top-full z-50 mt-1 max-h-64 overflow-y-auto rounded-xl border border-gray-200 bg-white p-1 shadow-lg dark:border-gray-700 dark:bg-gray-900">
                  <div className="border-b border-gray-200 p-2 text-sm font-medium text-gray-600 dark:border-gray-700 dark:text-gray-400">
                    Timestamps for "{naturalInput}"
                  </div>
                  {suggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => selectSuggestion(suggestion)}
                      className={`w-full rounded-lg px-3 py-2 text-left transition-colors ${
                        selectedSuggestionIndex === index ? "bg-blue-50 dark:bg-blue-900/20" : "hover:bg-gray-50 dark:hover:bg-gray-800"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <span className="font-medium text-gray-900 dark:text-white">{suggestion.description}</span>
                        <span className="text-xs font-mono text-gray-500 dark:text-gray-400">&lt;t:{Math.floor(suggestion.date.getTime() / 1000)}:{format}&gt;</span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Generated Timestamp Output */}
            {timestamp && (
                <div className="rounded-2xl border border-blue-200/50 bg-gradient-to-r from-blue-50 to-indigo-50 p-6 shadow-lg dark:border-blue-800/30 dark:from-blue-900/20 dark:to-indigo-900/20">
                  <div className="mb-4 flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/50">
                      <svg className="h-4 w-4 text-blue-600 dark:text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <h2 className="text-lg font-semibold text-blue-900 dark:text-blue-100">Your Discord Timestamp</h2>
                  </div>
                  
                  <div className="mb-4 flex gap-2">
                    <div className="relative flex-1">
                      <code className="block w-full rounded-xl border border-blue-200 bg-white/80 px-4 py-3 pr-12 font-mono text-sm text-gray-900 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-blue-700/50 dark:bg-gray-800/80 dark:text-white">
                        {timestamp}
                      </code>
                      <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        <div className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
                      </div>
                    </div>
                    <button
                      onClick={() => copyToClipboard(timestamp)}
                      className="group flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition-all hover:bg-blue-700 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    >
                      <svg className="h-4 w-4 transition-transform group-hover:scale-110" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M8 2a1 1 0 000 2h2a1 1 0 100-2H8z" />
                        <path d="M3 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v6h-4.586l1.293-1.293a1 1 0 00-1.414-1.414l-3 3a1 1 0 000 1.414l3 3a1 1 0 001.414-1.414L10.414 13H15v3a2 2 0 01-2 2H5a2 2 0 01-2-2V5zM15 11h2V5a2 2 0 00-2-2v8z" />
                      </svg>
                      Copy
                    </button>
                  </div>
                  
                  <div className="text-sm text-blue-700 dark:text-blue-300">
                    <span className="font-medium">Preview:</span> {getPreview()}
                  </div>
                </div>
            )}

            {/* Collapsible Manual Date Picker */}
            <details className="group">
              <summary className="cursor-pointer text-center text-gray-600 transition-colors hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200">
                or use date picker
              </summary>
              <div className="mt-4 space-y-4 border-t border-gray-200 pt-4 dark:border-gray-800">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Select Date and Time
                    </label>
                    <div className="flex gap-0">
                      <input
                        type="datetime-local"
                        value={dateTime}
                        onChange={(e) => setDateTime(e.target.value)}
                        className="flex-1 h-12 rounded-l-lg rounded-r-none border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                      />
                      <button
                        onClick={setCurrentTime}
                        className="h-12 rounded-r-lg rounded-l-none border border-l-0 border-gray-300 bg-white px-4 py-2 text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 whitespace-nowrap"
                      >
                        Use Now
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Choose Display Format
                    </label>
                    <select
                      value={format}
                      onChange={(e) => setFormat(e.target.value)}
                      className="w-full h-12 rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                    >
                      {formatOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label} - {getPreview(option.value)}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </details>

            {/* Generate Button */}
            <button
              onClick={generateTimestamp}
              className="group relative w-full overflow-hidden rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4 font-semibold text-white transition-all duration-200 hover:from-blue-700 hover:to-indigo-700 hover:shadow-lg hover:shadow-blue-500/25 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.293l-3-3a1 1 0 00-1.414 1.414L10.586 9H7a1 1 0 100 2h3.586l-1.293 1.293a1 1 0 101.414 1.414l3-3a1 1 0 000-1.414z" clipRule="evenodd" />
                </svg>
                Generate Discord Timestamp
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
            </button>

            
          </div>
        </section>

        {/* Collapsible Snowflake Decoder */}
        <section className="mb-12">
        <details className="overflow-hidden rounded-3xl border border-gray-200/50 bg-white/80 shadow-xl shadow-gray-900/5 backdrop-blur-sm dark:border-gray-700/50 dark:bg-gray-900/80 dark:shadow-black/20">
          <summary className="group flex cursor-pointer items-center justify-between p-8 font-semibold text-gray-900 transition-all hover:bg-gray-50/50 dark:text-white dark:hover:bg-gray-800/50">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30">
                <svg className="h-5 w-5 text-green-600 dark:text-green-400" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <span className="text-lg">Snowflake ID Decoder</span>
            </div>
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 transition-all group-hover:bg-gray-200 dark:bg-gray-800 dark:group-hover:bg-gray-700">
              <svg className="h-4 w-4 text-gray-500 transition-transform dark:text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </div>
          </summary>
          <div className="space-y-6 px-8 pb-8">
            <div>
              <label className="mb-3 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Discord Snowflake ID
              </label>
              <div className="flex gap-3">
                <input
                  type="text"
                  value={snowflakeId}
                  onChange={(e) => setSnowflakeId(e.target.value)}
                  placeholder="e.g., 1234567890123456789"
                  className="flex-1 rounded-xl border border-gray-300 bg-white/80 px-4 py-3 text-gray-900 backdrop-blur-sm focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500 dark:border-gray-700 dark:bg-gray-800/80 dark:text-white"
                />
                <button
                  onClick={decodeSnowflake}
                  className="group flex items-center gap-2 rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 px-6 py-3 font-semibold text-white transition-all hover:from-green-700 hover:to-emerald-700 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                >
                  <svg className="h-4 w-4 transition-transform group-hover:scale-110" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Decode
                </button>
              </div>
            </div>
          </div>
        </details>
        </section>

        {/* How to Use Section */}
        <section className="mb-12">
        <details className="overflow-hidden rounded-3xl border border-gray-200/50 bg-white/80 shadow-xl shadow-gray-900/5 backdrop-blur-sm dark:border-gray-700/50 dark:bg-gray-900/80 dark:shadow-black/20" open={howToUseOpen} onToggle={(e) => setHowToUseOpen((e.target as HTMLDetailsElement).open)}>
          <summary className="group flex cursor-pointer items-center justify-between p-8 font-semibold text-gray-900 transition-all hover:bg-gray-50/50 dark:text-white dark:hover:bg-gray-800/50">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30">
                <svg className="h-5 w-5 text-blue-600 dark:text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                </svg>
              </div>
              <span className="text-lg">How to Use</span>
            </div>
            <div className={`flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 transition-all group-hover:bg-gray-200 dark:bg-gray-800 dark:group-hover:bg-gray-700 ${howToUseOpen ? 'rotate-180' : ''}`}>
              <svg className="h-4 w-4 text-gray-500 transition-transform dark:text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </div>
          </summary>
          <div className="space-y-6 px-8 pb-8 text-gray-700 dark:text-gray-300">
              <ol className="list-inside list-decimal space-y-2">
                <li>Type a natural phrase: e.g., <span className="font-mono">in 45 min</span>, <span className="font-mono">tomorrow 19:30</span>, <span className="font-mono">next Fri 8am</span>.</li>
                <li>Pick from the suggestions with Arrow keys; press Enter to select. The first match is auto-selected.</li>
                <li>Use the date picker if you prefer precise control and then pick a display format.</li>
                <li>Click <span className="font-medium">Generate Discord Timestamp</span> or just press Enter to create the code.</li>
                <li>Click <span className="font-medium">Copy</span> (or press Enter if enabled) to copy the <span className="font-mono">&lt;t:UNIX:FORMAT&gt;</span> string.</li>
                <li>Paste into Discord; it will render for each user in their local timezone.</li>
              </ol>
              <ul className="list-inside list-disc space-y-1 text-sm text-gray-600 dark:text-gray-400">
                <li>Tip: Type <span className="font-mono">in</span> to see quick options (15m, 30m, 1h, 2h) or <span className="font-mono">in 4</span> for minutes/hours/days.</li>
                <li>Toggle theme from the top-right. Your preference and settings are saved locally.</li>
                <li>Use the Snowflake decoder to turn any Discord ID into a timestamp.</li>
              </ul>
          </div>
        </details>
        </section>

        {/* FAQ Section */}
        <section>
        <details className="overflow-hidden rounded-3xl border border-gray-200/50 bg-white/80 shadow-xl shadow-gray-900/5 backdrop-blur-sm dark:border-gray-700/50 dark:bg-gray-900/80 dark:shadow-black/20" open={faqOpen} onToggle={(e) => setFaqOpen((e.target as HTMLDetailsElement).open)}>
          <summary className="group flex cursor-pointer items-center justify-between p-8 font-semibold text-gray-900 transition-all hover:bg-gray-50/50 dark:text-white dark:hover:bg-gray-800/50">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30">
                <svg className="h-5 w-5 text-purple-600 dark:text-purple-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                </svg>
              </div>
              <span className="text-lg">Frequently Asked Questions</span>
            </div>
            <div className={`flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 transition-all group-hover:bg-gray-200 dark:bg-gray-800 dark:group-hover:bg-gray-700 ${faqOpen ? 'rotate-180' : ''}`}>
              <svg className="h-4 w-4 text-gray-500 transition-transform dark:text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </div>
          </summary>
          <div className="space-y-6 px-8 pb-8">
              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">How do Discord timestamps work?</h3>
                  <p className="text-gray-700 dark:text-gray-300">
                    Discord renders <span className="font-mono">&lt;t:UNIX:FORMAT&gt;</span> according to each viewer's timezone. We generate the UNIX seconds and you pick the FORMAT letter.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">What are the different format types?</h3>
                  <p className="text-gray-700 dark:text-gray-300">
                    Seven options: <span className="font-mono">t</span>, <span className="font-mono">T</span>, <span className="font-mono">d</span>, <span className="font-mono">D</span>, <span className="font-mono">f</span>, <span className="font-mono">F</span>, and <span className="font-mono">R</span> (relative time like "in 2 hours").
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">Why does my preview differ from friends?</h3>
                  <p className="text-gray-700 dark:text-gray-300">Previews are shown in your timezone by default. Discord also localizes for each user, so displays can differ but point to the same moment.</p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">What is a Discord Snowflake ID?</h3>
                  <p className="text-gray-700 dark:text-gray-300">A Snowflake encodes the creation time. Paste it in the decoder to get a timestamp.</p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">Can I share a link with a pre‑filled timestamp?</h3>
                  <p className="text-gray-700 dark:text-gray-300">Yes. Use <span className="font-medium">Copy Link</span> to copy a URL that preserves your current values (time, format, timezone).</p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">What phrases are supported?</h3>
                  <p className="text-gray-700 dark:text-gray-300">Common ones like <span className="font-mono">in 45m</span>, <span className="font-mono">tomorrow 8am</span>, <span className="font-mono">next wed 14:30</span>, plus typed suggestions. If a phrase fails, try the picker.</p>
                </div>
              </div>
          </div>
        </details>
        </section>
        
        {/* Footer */}
        <footer className="mt-12 rounded-3xl border border-gray-200/50 bg-white/80 p-6 shadow-xl shadow-gray-900/5 backdrop-blur-sm dark:border-gray-700/50 dark:bg-gray-900/80 dark:shadow-black/20">
          <div className="space-y-4 text-center">
            <div className="flex flex-wrap justify-center gap-4 text-sm">
              <a
                href="/chat-link-generator"
                className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
              >
                Chat Link Generator
              </a>
              <span className="text-gray-500">•</span>
              <span className="text-gray-500">More tools coming soon...</span>
            </div>

            <p className="text-sm text-gray-500 dark:text-gray-400">
              Built with ❤️ by Smart Generators
            </p>
          </div>
        </footer>
        </main>
      </div>
    </div>
  )
}
