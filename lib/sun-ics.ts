/**
 * ICS calendar file generation for sunrise/sunset times
 * Creates downloadable calendar files and subscription feeds
 */

import { getDayTimes, formatTime } from "./sun-times"
import { findCityBySlug, formatCityName } from "./cities"

export interface ICSOptions {
  type: 'sunrise-sunset' | 'golden-hour' | 'blue-hour'
  citySlug: string
  startDate: Date
  days: number
  includeBlueHour?: boolean
}

/**
 * Generate ICS calendar content for sun times
 */
export function generateSunICS(options: ICSOptions): string {
  const { type, citySlug, startDate, days, includeBlueHour = false } = options
  
  const city = findCityBySlug(citySlug)
  if (!city) {
    throw new Error(`City not found: ${citySlug}`)
  }

  const cityName = formatCityName(city)
  const calendarName = getCalendarName(type, cityName)
  
  // ICS header
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Smart Generators//Sunrise Sunset Calculator//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    `X-WR-CALNAME:${calendarName}`,
    `X-WR-CALDESC:${getCalendarDescription(type, cityName)}`,
    'X-WR-TIMEZONE:' + city.timezone,
    '',
    // Timezone definition
    'BEGIN:VTIMEZONE',
    'TZID:' + city.timezone,
    'BEGIN:STANDARD',
    'DTSTART:19700101T000000',
    'TZNAME:' + city.timezone,
    'TZOFFSETFROM:+0000',
    'TZOFFSETTO:+0000',
    'END:STANDARD',
    'END:VTIMEZONE',
    ''
  ]

  // Generate events for each day
  for (let i = 0; i < days; i++) {
    const date = new Date(startDate)
    date.setDate(date.getDate() + i)
    
    const dayTimes = getDayTimes(date, city.lat, city.lng, includeBlueHour)
    const events = generateDayEvents(dayTimes, type, cityName, city.timezone)
    
    lines.push(...events)
  }

  // ICS footer
  lines.push('END:VCALENDAR')
  
  return lines.join('\r\n')
}

/**
 * Generate events for a single day
 */
function generateDayEvents(
  dayTimes: ReturnType<typeof getDayTimes>,
  type: string,
  cityName: string,
  timezone: string
): string[] {
  const events: string[] = []
  const date = dayTimes.date
  const dateStr = date.replace(/-/g, '')

  if (type === 'sunrise-sunset') {
    // Sunrise event
    if (dayTimes.sunrise) {
      events.push(...createEvent({
        uid: `sunrise-${dateStr}-${cityName}`,
        summary: `Sunrise - ${cityName}`,
        description: `Sunrise time in ${cityName}`,
        dtstart: formatICSDateTime(dayTimes.sunrise, timezone),
        duration: 'PT1M', // 1 minute duration
        timezone
      }))
    }

    // Sunset event
    if (dayTimes.sunset) {
      events.push(...createEvent({
        uid: `sunset-${dateStr}-${cityName}`,
        summary: `Sunset - ${cityName}`,
        description: `Sunset time in ${cityName}`,
        dtstart: formatICSDateTime(dayTimes.sunset, timezone),
        duration: 'PT1M', // 1 minute duration
        timezone
      }))
    }
  }

  if (type === 'golden-hour') {
    // Morning golden hour
    if (dayTimes.goldenHourMorning.start && dayTimes.goldenHourMorning.end) {
      events.push(...createEvent({
        uid: `golden-hour-am-${dateStr}-${cityName}`,
        summary: `Golden Hour (Morning) - ${cityName}`,
        description: `Morning golden hour in ${cityName}`,
        dtstart: formatICSDateTime(dayTimes.goldenHourMorning.start, timezone),
        dtend: formatICSDateTime(dayTimes.goldenHourMorning.end, timezone),
        timezone
      }))
    }

    // Evening golden hour
    if (dayTimes.goldenHourEvening.start && dayTimes.goldenHourEvening.end) {
      events.push(...createEvent({
        uid: `golden-hour-pm-${dateStr}-${cityName}`,
        summary: `Golden Hour (Evening) - ${cityName}`,
        description: `Evening golden hour in ${cityName}`,
        dtstart: formatICSDateTime(dayTimes.goldenHourEvening.start, timezone),
        dtend: formatICSDateTime(dayTimes.goldenHourEvening.end, timezone),
        timezone
      }))
    }
  }

  if (type === 'blue-hour' && dayTimes.blueHourMorning && dayTimes.blueHourEvening) {
    // Morning blue hour
    if (dayTimes.blueHourMorning.start && dayTimes.blueHourMorning.end) {
      events.push(...createEvent({
        uid: `blue-hour-am-${dateStr}-${cityName}`,
        summary: `Blue Hour (Morning) - ${cityName}`,
        description: `Morning blue hour in ${cityName}`,
        dtstart: formatICSDateTime(dayTimes.blueHourMorning.start, timezone),
        dtend: formatICSDateTime(dayTimes.blueHourMorning.end, timezone),
        timezone
      }))
    }

    // Evening blue hour
    if (dayTimes.blueHourEvening.start && dayTimes.blueHourEvening.end) {
      events.push(...createEvent({
        uid: `blue-hour-pm-${dateStr}-${cityName}`,
        summary: `Blue Hour (Evening) - ${cityName}`,
        description: `Evening blue hour in ${cityName}`,
        dtstart: formatICSDateTime(dayTimes.blueHourEvening.start, timezone),
        dtend: formatICSDateTime(dayTimes.blueHourEvening.end, timezone),
        timezone
      }))
    }
  }

  return events
}

/**
 * Create a single ICS event
 */
interface EventOptions {
  uid: string
  summary: string
  description: string
  dtstart: string
  dtend?: string
  duration?: string
  timezone: string
}

function createEvent(options: EventOptions): string[] {
  const { uid, summary, description, dtstart, dtend, duration, timezone } = options
  const now = new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'
  
  const lines = [
    'BEGIN:VEVENT',
    `UID:${uid}@smartgenerators.dev`,
    `DTSTAMP:${now}`,
    `DTSTART;TZID=${timezone}:${dtstart}`,
  ]

  if (dtend) {
    lines.push(`DTEND;TZID=${timezone}:${dtend}`)
  } else if (duration) {
    lines.push(`DURATION:${duration}`)
  }

  lines.push(
    `SUMMARY:${summary}`,
    `DESCRIPTION:${description}`,
    'STATUS:CONFIRMED',
    'TRANSP:TRANSPARENT',
    'END:VEVENT',
    ''
  )

  return lines
}

/**
 * Format date for ICS (YYYYMMDDTHHMMSS)
 */
function formatICSDateTime(date: Date, timezone: string): string {
  // Convert to local time in the specified timezone
  const localDate = new Date(date.toLocaleString('en-US', { timeZone: timezone }))
  
  const year = localDate.getFullYear()
  const month = String(localDate.getMonth() + 1).padStart(2, '0')
  const day = String(localDate.getDate()).padStart(2, '0')
  const hours = String(localDate.getHours()).padStart(2, '0')
  const minutes = String(localDate.getMinutes()).padStart(2, '0')
  const seconds = String(localDate.getSeconds()).padStart(2, '0')
  
  return `${year}${month}${day}T${hours}${minutes}${seconds}`
}

/**
 * Get calendar name based on type
 */
function getCalendarName(type: string, cityName: string): string {
  switch (type) {
    case 'sunrise-sunset':
      return `${cityName} - Sunrise & Sunset`
    case 'golden-hour':
      return `${cityName} - Golden Hour`
    case 'blue-hour':
      return `${cityName} - Blue Hour`
    default:
      return `${cityName} - Solar Times`
  }
}

/**
 * Get calendar description based on type
 */
function getCalendarDescription(type: string, cityName: string): string {
  switch (type) {
    case 'sunrise-sunset':
      return `Daily sunrise and sunset times for ${cityName}`
    case 'golden-hour':
      return `Daily golden hour times for ${cityName} - ideal for photography`
    case 'blue-hour':
      return `Daily blue hour times for ${cityName} - perfect for twilight photography`
    default:
      return `Daily solar times for ${cityName}`
  }
}

/**
 * Generate filename for ICS download
 */
export function generateICSFilename(type: string, citySlug: string, range?: string): string {
  const typeSlug = type.replace(/[^a-z0-9]/g, '-')
  const rangeSlug = range ? `-${range}` : ''
  return `${citySlug}-${typeSlug}${rangeSlug}.ics`
}
