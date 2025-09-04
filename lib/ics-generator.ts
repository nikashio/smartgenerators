import type { EventDetails } from "@/app/add-to-calendar/page"

/**
 * ICS (iCalendar) file generator following RFC 5545 specification
 * Generates downloadable .ics files compatible with Apple Calendar, Google Calendar, Outlook, etc.
 */

/**
 * Generate unique UID for the event
 */
export function generateUid(): string {
  return `smartgenerators-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

/**
 * Convert Date to ICS date-time format (YYYYMMDDTHHMMSSZ)
 */
export function toIcsDateTimeUtc(date: Date): string {
  const year = date.getUTCFullYear()
  const month = String(date.getUTCMonth() + 1).padStart(2, '0')
  const day = String(date.getUTCDate()).padStart(2, '0')
  const hours = String(date.getUTCHours()).padStart(2, '0')
  const minutes = String(date.getUTCMinutes()).padStart(2, '0')
  const seconds = String(date.getUTCSeconds()).padStart(2, '0')

  return `${year}${month}${day}T${hours}${minutes}${seconds}Z`
}

/**
 * Convert Date to ICS date-only format (YYYYMMDD)
 */
export function toIcsDateOnly(date: Date): string {
  const year = date.getUTCFullYear()
  const month = String(date.getUTCMonth() + 1).padStart(2, '0')
  const day = String(date.getUTCDate()).padStart(2, '0')

  return `${year}${month}${day}`
}

/**
 * Convert timezone name to IANA identifier
 */
export function getTimezoneId(timezone: string): string {
  // Map common timezone names to IANA identifiers
  const timezoneMap: Record<string, string> = {
    'America/New_York': 'America/New_York',
    'America/Chicago': 'America/Chicago',
    'America/Denver': 'America/Denver',
    'America/Los_Angeles': 'America/Los_Angeles',
    'Europe/London': 'Europe/London',
    'Europe/Paris': 'Europe/Paris',
    'Asia/Tokyo': 'Asia/Tokyo',
    'Australia/Sydney': 'Australia/Sydney',
    'UTC': 'UTC',
  }

  return timezoneMap[timezone] || 'UTC'
}

/**
 * Fold long lines according to RFC 5545 (max 75 octets)
 */
export function foldLine(line: string): string {
  if (line.length <= 75) return line

  const chunks: string[] = []
  let remaining = line

  while (remaining.length > 0) {
    if (remaining.length <= 75) {
      chunks.push(remaining)
      break
    }

    // Find the last space within 75 characters to break at word boundary
    let breakPoint = 75
    for (let i = 75; i > 60; i--) { // Don't go below 60 to maintain readability
      if (remaining[i] === ' ') {
        breakPoint = i
        break
      }
    }

    chunks.push(remaining.substring(0, breakPoint))
    remaining = remaining.substring(breakPoint).trim()
  }

  return chunks.join('\r\n ')
}

/**
 * Escape special characters in ICS text fields
 */
export function escapeIcsText(text: string): string {
  return text
    .replace(/\\/g, '\\\\')  // Escape backslashes
    .replace(/;/g, '\\;')    // Escape semicolons
    .replace(/,/g, '\\,')    // Escape commas
    .replace(/\n/g, '\\n')   // Escape newlines
}

/**
 * Generate RRULE string for recurrence
 */
export function buildIcsRRule(recurrence: NonNullable<EventDetails['recurrence']>): string {
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
    const untilStr = toIcsDateOnly(untilDate)
    parts.push(`UNTIL=${untilStr}`)
  }

  return parts.join(';')
}

/**
 * Generate VALARM components for reminders
 */
export function generateAlarms(reminders: NonNullable<EventDetails['reminders']>): string {
  return reminders.map(reminder => {
    const triggerValue = `-${reminder.amount}`
    const triggerUnit = reminder.unit === 'minute' ? 'M' :
                       reminder.unit === 'hour' ? 'H' : 'D'

    return [
      'BEGIN:VALARM',
      'ACTION:DISPLAY',
      `DESCRIPTION:${escapeIcsText('Reminder')}`,
      `TRIGGER:${triggerValue}${triggerUnit}`,
      'END:VALARM'
    ].join('\r\n')
  }).join('\r\n')
}

/**
 * Generate ATTENDEE components
 */
export function generateAttendees(attendees: string[]): string {
  return attendees.map(email => {
    if (!email.includes('@')) return '' // Skip invalid emails
    return `ATTENDEE;CN="${escapeIcsText(email)}";RSVP=TRUE:mailto:${email}`
  }).filter(Boolean).join('\r\n')
}

/**
 * Generate ORGANIZER component
 */
export function generateOrganizer(organizer?: EventDetails['organizer']): string {
  if (!organizer || !organizer.email) return ''

  const name = organizer.name ? `;CN="${escapeIcsText(organizer.name)}"` : ''
  return `ORGANIZER${name}:mailto:${organizer.email}`
}

/**
 * Generate complete ICS file content
 */
export function generateIcs(details: EventDetails): string {
  const uid = generateUid()
  const now = new Date()

  // Convert dates to UTC for consistency
  const startDate = new Date(details.start)
  const endDate = new Date(details.end)

  const lines: string[] = []

  // VCALENDAR header
  lines.push('BEGIN:VCALENDAR')
  lines.push('VERSION:2.0')
  lines.push('PRODID:-//Smart Generators//Add-to-Calendar//EN')
  lines.push('CALSCALE:GREGORIAN')

  // Timezone information (simplified - using UTC for portability)
  if (details.timezone !== 'UTC') {
    const tzid = getTimezoneId(details.timezone)
    lines.push('BEGIN:VTIMEZONE')
    lines.push(`TZID:${tzid}`)
    lines.push('END:VTIMEZONE')
  }

  // VEVENT
  lines.push('BEGIN:VEVENT')

  // Core properties
  lines.push(`UID:${uid}`)
  lines.push(`DTSTAMP:${toIcsDateTimeUtc(now)}`)
  lines.push(`DTSTART${details.isAllDay ? ';VALUE=DATE' : ''}:${details.isAllDay ? toIcsDateOnly(startDate) : toIcsDateTimeUtc(startDate)}`)
  lines.push(`DTEND${details.isAllDay ? ';VALUE=DATE' : ''}:${details.isAllDay ? toIcsDateOnly(endDate) : toIcsDateTimeUtc(endDate)}`)

  lines.push(`SUMMARY:${escapeIcsText(details.title)}`)

  if (details.description) {
    lines.push(`DESCRIPTION:${escapeIcsText(details.description)}`)
  }

  if (details.location) {
    lines.push(`LOCATION:${escapeIcsText(details.location)}`)
  }

  // Organizer
  if (details.organizer) {
    const organizerLine = generateOrganizer(details.organizer)
    if (organizerLine) {
      lines.push(organizerLine)
    }
  }

  // Attendees
  if (details.attendees && details.attendees.length > 0) {
    const attendeesLines = generateAttendees(details.attendees)
    if (attendeesLines) {
      lines.push(attendeesLines)
    }
  }

  // Recurrence
  if (details.recurrence) {
    const rrule = buildIcsRRule(details.recurrence)
    if (rrule) {
      lines.push(`RRULE:${rrule}`)
    }
  }

  // Visibility
  if (details.visibility) {
    const classMap = {
      'PUBLIC': 'PUBLIC',
      'PRIVATE': 'PRIVATE',
      'CONFIDENTIAL': 'CONFIDENTIAL'
    }
    lines.push(`CLASS:${classMap[details.visibility]}`)
  }

  // Reminders/Alarms
  if (details.reminders && details.reminders.length > 0) {
    const alarms = generateAlarms(details.reminders)
    if (alarms) {
      lines.push(alarms)
    }
  }

  // Status (assume confirmed for new events)
  lines.push('STATUS:CONFIRMED')

  // End event and calendar
  lines.push('END:VEVENT')
  lines.push('END:VCALENDAR')

  // Join with CRLF and fold long lines
  const icsContent = lines.join('\r\n')
  return icsContent.split('\n').map(foldLine).join('\n')
}

/**
 * Download ICS file
 */
export function downloadIcs(filename: string, icsContent: string): void {
  const blob = new Blob([icsContent], {
    type: 'text/calendar;charset=utf-8'
  })

  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename.endsWith('.ics') ? filename : `${filename}.ics`

  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)

  URL.revokeObjectURL(url)
}

/**
 * Generate filename for ICS download
 */
export function generateIcsFilename(eventTitle: string): string {
  const sanitizedTitle = eventTitle
    .replace(/[^a-z0-9]/gi, '_')
    .replace(/_+/g, '_')
    .toLowerCase()
    .slice(0, 50)

  return `${sanitizedTitle}_${Date.now()}.ics`
}
