"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useToast } from "@/hooks/use-toast"

const formatOptions = [
  { value: "t", label: "Short Time", example: "16:20" },
  { value: "T", label: "Long Time", example: "16:20:30" },
  { value: "d", label: "Short Date", example: "20/04/2021" },
  { value: "D", label: "Long Date", example: "20 April 2021" },
  { value: "f", label: "Short Date/Time", example: "20 April 2021 16:20" },
  { value: "F", label: "Long Date/Time", example: "Tuesday, 20 April 2021 16:20" },
  { value: "R", label: "Relative Time", example: "2 months ago" },
]

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
      // Continue to return null
    }

    return null
  }

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

    // Handle "in" prefix with smart suggestions
    if (inputLower.startsWith("in") && inputLower.length <= 4) {
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
    setShowSuggestions(newSuggestions.length > 0) // Show dropdown if any suggestions

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

  const selectSuggestion = (suggestion: { text: string; date: Date; description: string }) => {
    setNaturalInput(suggestion.text)
    const localDateTime = new Date(suggestion.date.getTime() - suggestion.date.getTimezoneOffset() * 60000)
      .toISOString()
      .slice(0, 16)
    setDateTime(localDateTime)

    const unixTimestamp = Math.floor(suggestion.date.getTime() / 1000)
    const discordTimestamp = `<t:${unixTimestamp}:${format}>`
    setTimestamp(discordTimestamp)

    setShowSuggestions(false)
    setSelectedSuggestionIndex(-1)
    setParseError("")
  }

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

  const generateTimestampFromParams = (unix: number, formatType: string) => {
    const discordTimestamp = `<t:${unix}:${formatType}>`
    setTimestamp(discordTimestamp)
  }

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

  const setCurrentTime = () => {
    const now = new Date()
    const localDateTime = new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 16)
    setDateTime(localDateTime)
    setNaturalInput("")
    setParseError("")
    setParsedPreview("")
  }

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

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault()
      if (showSuggestions && selectedSuggestionIndex >= 0) {
        selectSuggestion(suggestions[selectedSuggestionIndex])
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
    <div
      className={`min-h-screen transition-colors duration-200 ${isDarkMode ? "bg-gray-900 text-white" : "bg-gray-50 text-gray-900"}`}
    >
      <div className="container mx-auto px-4 py-8">
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">Discord Timestamp Generator</h1>
            <p className="text-lg opacity-80">
              A quick in-and-out Discord timestamp generator. Type in a date or time, and hit Enter to copy.
            </p>
          </div>

          <button
            onClick={toggleTheme}
            className={`h-12 px-4 rounded-lg border-2 transition-all duration-200 flex items-center justify-center gap-2 hover:scale-105 ${
              isDarkMode
                ? "border-gray-600 bg-gray-800 hover:bg-gray-700"
                : "border-gray-300 bg-white hover:bg-gray-100"
            }`}
            aria-label="Toggle theme"
          >
            {isDarkMode ? (
              <svg className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z"
                  clipRule="evenodd"
                />
              </svg>
            ) : (
              <svg className="w-5 h-5 text-gray-700" fill="currentColor" viewBox="0 0 20 20">
                <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
              </svg>
            )}
            <span className="text-sm font-medium hidden lg:block">Theme</span>
          </button>
        </header>

        {/* Main Input Section */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-6">
          <div className="space-y-6">
            {/* Natural Language Input */}
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Natural language date & time
              </label>
              <input
                type="text"
                value={naturalInput}
                onChange={(e) => handleNaturalInputChange(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Examples: 'in 45 min', 'tomorrow 19:30', 'next Fri 8am'"
                className="w-full px-4 py-3 text-lg border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/80 dark:bg-gray-700/80 backdrop-blur-sm hover:border-gray-400 dark:hover:border-gray-500 transition-all duration-200 text-gray-900 dark:text-white"
              />

              {/* Suggestions Dropdown */}
              {showSuggestions && suggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-600 rounded-lg shadow-lg z-50 max-h-64 overflow-y-auto">
                  <div className="p-2 text-sm font-medium text-gray-600 dark:text-gray-400 border-b border-gray-200 dark:border-gray-600">
                    Timestamps for "{naturalInput}"
                  </div>
                  {suggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => selectSuggestion(suggestion)}
                      className={`w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-150 border-b border-gray-100 dark:border-gray-700 last:border-b-0 ${
                        selectedSuggestionIndex === index ? "bg-blue-50 dark:bg-blue-900/20" : ""
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <span className="text-gray-400">⭐</span>
                          <span className="font-medium text-gray-900 dark:text-white">{suggestion.description}</span>
                        </div>
                        <span className="text-sm font-mono text-gray-500 dark:text-gray-400">
                          &lt;t:{Math.floor(suggestion.date.getTime() / 1000)}:{format}&gt;
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Collapsible Manual Date Picker */}
            <details className="group">
              <summary className="cursor-pointer text-center text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors">
                or use date picker
              </summary>
              <div className="mt-4 space-y-4 border-t border-gray-200 dark:border-gray-600 pt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Select Date and Time
                    </label>
                    <div className="flex space-x-2">
                      <input
                        type="datetime-local"
                        value={dateTime}
                        onChange={(e) => setDateTime(e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                      <button
                        onClick={setCurrentTime}
                        className="px-4 py-2 bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-500 transition-colors"
                      >
                        Use Now
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Choose Display Format
                    </label>
                    <select
                      value={format}
                      onChange={(e) => setFormat(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
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
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 text-lg"
            >
              Generate Discord Timestamp
            </button>

            {/* Generated Timestamp Output */}
            {timestamp && (
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Your Discord Timestamp</h3>
                <div className="flex items-center space-x-2 mb-3">
                  <code className="flex-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded px-3 py-2 text-sm font-mono text-gray-900 dark:text-white">
                    {timestamp}
                  </code>
                  <button
                    onClick={() => copyToClipboard(timestamp)}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                  >
                    Copy
                  </button>
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Preview: {getPreview()}</div>
              </div>
            )}
          </div>
        </div>

        {/* Collapsible Snowflake Decoder */}
        <details className="bg-white dark:bg-gray-800 rounded-xl shadow-lg mb-6">
          <summary className="cursor-pointer p-6 font-semibold text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors rounded-xl">
            🔍 Snowflake ID Decoder
          </summary>
          <div className="px-6 pb-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Discord Snowflake ID
              </label>
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={snowflakeId}
                  onChange={(e) => setSnowflakeId(e.target.value)}
                  placeholder="e.g., 1234567890123456789"
                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
                <button
                  onClick={decodeSnowflake}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                >
                  Decode
                </button>
              </div>
            </div>
          </div>
        </details>

        {/* How to Use Section */}
        <details className="bg-white dark:bg-gray-800 rounded-xl shadow-lg mb-6" open={howToUseOpen}>
          <summary
            className="cursor-pointer p-6 font-semibold text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors rounded-xl flex items-center"
            onClick={() => setHowToUseOpen(!howToUseOpen)}
          >
            📖 How to Use
            <span className="ml-auto text-gray-400">{howToUseOpen ? "−" : "+"}</span>
          </summary>
          {howToUseOpen && (
            <div className="px-6 pb-6 space-y-4 text-gray-700 dark:text-gray-300">
              <ol className="list-decimal list-inside space-y-2">
                <li>Type a natural date/time like "in 30 minutes" or "tomorrow 3pm"</li>
                <li>Or use the manual date picker for precise control</li>
                <li>Choose your preferred Discord timestamp format</li>
                <li>Copy the generated timestamp and paste it into Discord</li>
              </ol>
            </div>
          )}
        </details>

        {/* FAQ Section */}
        <details className="bg-white dark:bg-gray-800 rounded-xl shadow-lg" open={faqOpen}>
          <summary
            className="cursor-pointer p-6 font-semibold text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors rounded-xl flex items-center"
            onClick={() => setFaqOpen(!faqOpen)}
          >
            ❓ Frequently Asked Questions
            <span className="ml-auto text-gray-400">{faqOpen ? "−" : "+"}</span>
          </summary>
          {faqOpen && (
            <div className="px-6 pb-6 space-y-4">
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white">How do Discord timestamps work?</h4>
                  <p className="text-gray-700 dark:text-gray-300">
                    Discord timestamps show the same moment in time to all users, but each person sees it in their local
                    timezone. The timestamp format is &lt;t:UNIX:FORMAT&gt;.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white">What are the different format types?</h4>
                  <p className="text-gray-700 dark:text-gray-300">
                    There are 7 formats: Short Time (t), Long Time (T), Short Date (d), Long Date (D), Short Date/Time
                    (f), Long Date/Time (F), and Relative Time (R).
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white">What is a Discord Snowflake ID?</h4>
                  <p className="text-gray-700 dark:text-gray-300">
                    A Snowflake is Discord's unique ID system. Every message, user, server, etc. has a Snowflake ID that
                    contains timestamp information about when it was created.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white">
                    Can I share a link with a pre-filled timestamp?
                  </h4>
                  <p className="text-gray-700 dark:text-gray-300">
                    Yes! Use the "Copy Link" button to create a shareable URL with your current timestamp settings.
                  </p>
                </div>
              </div>
            </div>
          )}
        </details>
      </div>
    </div>
  )
}
