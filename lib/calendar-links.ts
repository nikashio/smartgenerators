import type { EventDetails } from "@/app/add-to-calendar/page"

/**
 * Calendar link builders for various calendar services
 * Handles proper URL encoding and parameter formatting for Google, Outlook, and Yahoo calendars
 */

/**
 * Safe URL encoding that handles newlines and special characters properly
     * Note: URLSearchParams.toString() will handle encoding, so we don't double-encode
 */
export function encodeQuery(value: string): string {
  return value.replace(/\n/g, '\\n').replace(/\r/g, '\\r')
}

/**
 * Convert Date to RFC3339 format (required by Google Calendar)
 */
export function toRfc3339(date: Date): string {
  return date.toISOString().replace(/[:-]/g, '').replace(/\.\d{3}/, '')
}

/**
 * Convert Date to Yahoo calendar format (Unix timestamp)
 */
export function toYahooDateTime(date: Date): string {
  return Math.floor(date.getTime() / 1000).toString()
}

/**
 * Build Google Calendar event URL
 * Format: https://calendar.google.com/calendar/render?action=TEMPLATE&...
 */
export function buildGoogleUrl(details: EventDetails): string {
  const params = new URLSearchParams()

  params.set('action', 'TEMPLATE')
  params.set('text', encodeQuery(details.title))

  if (details.description) {
    params.set('details', encodeQuery(details.description))
  }

  if (details.location) {
    params.set('location', encodeQuery(details.location))
  }

  // Handle dates - convert to UTC for Google Calendar
  const startDate = new Date(details.start)
  const endDate = new Date(details.end)

  if (details.isAllDay) {
    // All-day events use date format YYYYMMDD
    const startStr = startDate.toISOString().split('T')[0].replace(/-/g, '')
    const endDatePlusOne = new Date(endDate)
    endDatePlusOne.setDate(endDatePlusOne.getDate() + 1) // Google expects exclusive end date
    const endStr = endDatePlusOne.toISOString().split('T')[0].replace(/-/g, '')

    params.set('dates', `${startStr}/${endStr}`)
  } else {
    // Timed events use RFC3339 format
    params.set('dates', `${toRfc3339(startDate)}/${toRfc3339(endDate)}`)
  }

  // Handle recurrence
  if (details.recurrence) {
    const rrule = buildRRule(details.recurrence)
    if (rrule) {
      params.set('recur', `RRULE:${rrule}`)
    }
  }

  // Handle attendees
  if (details.attendees && details.attendees.length > 0) {
    params.set('add', details.attendees.join(','))
  }

  return `https://calendar.google.com/calendar/render?${params.toString()}`
}

/**
 * Build Outlook Live (outlook.com) calendar URL
 */
export function buildOutlookLiveUrl(details: EventDetails): string {
  const params = new URLSearchParams()

  params.set('path', '/calendar/action/compose')
  params.set('rru', 'addevent')

  params.set('subject', encodeQuery(details.title))

  if (details.description) {
    params.set('body', encodeQuery(details.description))
  }

  if (details.location) {
    params.set('location', encodeQuery(details.location))
  }

  // Outlook uses ISO format
  const startDate = new Date(details.start)
  const endDate = new Date(details.end)

  params.set('startdt', startDate.toISOString())
  params.set('enddt', endDate.toISOString())

  if (details.isAllDay) {
    params.set('allday', 'true')
  }

  // Handle attendees
  if (details.attendees && details.attendees.length > 0) {
    params.set('to', details.attendees.join(';'))
  }

  return `https://outlook.live.com/calendar/0/deeplink/compose?${params.toString()}`
}

/**
 * Build Office 365 Outlook calendar URL
 */
export function buildOffice365Url(details: EventDetails): string {
  const params = new URLSearchParams()

  params.set('path', '/calendar/action/compose')
  params.set('rru', 'addevent')

  params.set('subject', encodeQuery(details.title))

  if (details.description) {
    params.set('body', encodeQuery(details.description))
  }

  if (details.location) {
    params.set('location', encodeQuery(details.location))
  }

  const startDate = new Date(details.start)
  const endDate = new Date(details.end)

  params.set('startdt', startDate.toISOString())
  params.set('enddt', endDate.toISOString())

  if (details.isAllDay) {
    params.set('allday', 'true')
  }

  if (details.attendees && details.attendees.length > 0) {
    params.set('to', details.attendees.join(';'))
  }

  return `https://outlook.office.com/calendar/0/deeplink/compose?${params.toString()}`
}

/**
 * Build Yahoo Calendar URL
 */
export function buildYahooUrl(details: EventDetails): string {
  const params = new URLSearchParams()

  params.set('v', '60') // Version
  params.set('title', encodeQuery(details.title))

  if (details.description) {
    params.set('desc', encodeQuery(details.description))
  }

  if (details.location) {
    params.set('in_loc', encodeQuery(details.location))
  }

  const startDate = new Date(details.start)
  const endDate = new Date(details.end)

  params.set('st', toYahooDateTime(startDate))
  params.set('et', toYahooDateTime(endDate))

  if (details.isAllDay) {
    params.set('dur', 'allday')
  }

  return `https://calendar.yahoo.com/?${params.toString()}`
}

/**
 * Build RRULE string for recurrence (RFC 5545 compliant)
 */
export function buildRRule(recurrence: NonNullable<EventDetails['recurrence']>): string {
  const parts: string[] = []

  parts.push(`FREQ=${recurrence.freq}`)

  if (recurrence.interval && recurrence.interval > 1) {
    parts.push(`INTERVAL=${recurrence.interval}`)
  }

  if (recurrence.byDay && recurrence.byDay.length > 0) {
    parts.push(`BYDAY=${recurrence.byDay.join(',')}`)
  }

  if (recurrence.count) {
    parts.push(`COUNT=${recurrence.count}`)
  } else if (recurrence.until) {
    const untilDate = new Date(recurrence.until)
    const untilStr = untilDate.toISOString().split('T')[0].replace(/-/g, '')
    parts.push(`UNTIL=${untilStr}`)
  }

  return parts.join(';')
}

/**
 * Generate all calendar links at once
 */
export function generateCalendarLinks(details: EventDetails) {
  return {
    google: buildGoogleUrl(details),
    outlookLive: buildOutlookLiveUrl(details),
    office365: buildOffice365Url(details),
    yahoo: buildYahooUrl(details),
  }
}
