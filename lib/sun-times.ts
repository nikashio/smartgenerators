/**
 * Solar time calculations using SunCalc
 * Provides sunrise, sunset, golden hour, and blue hour times
 */

import * as SunCalc from 'suncalc'

export interface DayTimes {
  date: string // YYYY-MM-DD format
  sunrise: Date | null
  sunset: Date | null
  goldenHourMorning: { start: Date | null; end: Date | null }
  goldenHourEvening: { start: Date | null; end: Date | null }
  blueHourMorning?: { start: Date | null; end: Date | null }
  blueHourEvening?: { start: Date | null; end: Date | null }
}

export interface MonthTimes {
  year: number
  month: number // 1-12
  days: DayTimes[]
}

/**
 * Calculate sun times for a specific date and location
 */
export function getDayTimes(
  date: Date,
  lat: number,
  lng: number,
  includeBlueHour = false
): DayTimes {
  const times = SunCalc.getTimes(date, lat, lng)
  
  // Format date as YYYY-MM-DD
  const dateStr = date.toISOString().split('T')[0]
  
  // Handle invalid times (polar regions, etc.)
  const isValidTime = (time: Date) => !isNaN(time.getTime())
  
  const result: DayTimes = {
    date: dateStr,
    sunrise: isValidTime(times.sunrise) ? times.sunrise : null,
    sunset: isValidTime(times.sunset) ? times.sunset : null,
    goldenHourMorning: {
      start: isValidTime(times.sunriseEnd) ? times.sunriseEnd : null,
      end: isValidTime(times.goldenHourEnd) ? times.goldenHourEnd : null
    },
    goldenHourEvening: {
      start: isValidTime(times.goldenHour) ? times.goldenHour : null,
      end: isValidTime(times.sunsetStart) ? times.sunsetStart : null
    }
  }
  
  if (includeBlueHour) {
    result.blueHourMorning = {
      start: isValidTime(times.dawn) ? times.dawn : null,
      end: isValidTime(times.sunrise) ? times.sunrise : null
    }
    result.blueHourEvening = {
      start: isValidTime(times.sunset) ? times.sunset : null,
      end: isValidTime(times.dusk) ? times.dusk : null
    }
  }
  
  return result
}

/**
 * Calculate sun times for an entire month
 */
export function getMonthTimes(
  year: number,
  month: number, // 1-12
  lat: number,
  lng: number,
  includeBlueHour = false
): MonthTimes {
  const daysInMonth = new Date(year, month, 0).getDate()
  const days: DayTimes[] = []
  
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month - 1, day) // month is 0-indexed in Date constructor
    days.push(getDayTimes(date, lat, lng, includeBlueHour))
  }
  
  return {
    year,
    month,
    days
  }
}

/**
 * Get today's times in a specific timezone
 */
export function getTodayTimes(
  lat: number,
  lng: number,
  timezone: string,
  includeBlueHour = false
): DayTimes {
  // Get current date in the target timezone
  const now = new Date()
  const todayInTz = new Date(now.toLocaleString('en-US', { timeZone: timezone }))
  
  // Create a date object for today in UTC but representing the local date
  const today = new Date(todayInTz.getFullYear(), todayInTz.getMonth(), todayInTz.getDate())
  
  return getDayTimes(today, lat, lng, includeBlueHour)
}

/**
 * Get current month times in a specific timezone
 */
export function getCurrentMonthTimes(
  lat: number,
  lng: number,
  timezone: string,
  includeBlueHour = false
): MonthTimes {
  // Get current date in the target timezone
  const now = new Date()
  const nowInTz = new Date(now.toLocaleString('en-US', { timeZone: timezone }))
  
  return getMonthTimes(
    nowInTz.getFullYear(),
    nowInTz.getMonth() + 1, // getMonth() returns 0-11
    lat,
    lng,
    includeBlueHour
  )
}

/**
 * Format time for display in a specific timezone
 */
export function formatTime(date: Date | null, timezone: string): string {
  if (!date) return 'N/A'
  
  return new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  }).format(date)
}

/**
 * Format date for display
 */
export function formatDate(date: Date, timezone: string): string {
  return new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(date)
}

/**
 * Get month name
 */
export function getMonthName(month: number): string {
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]
  return monthNames[month - 1] || ''
}
