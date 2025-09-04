/**
 * Time Zone Meeting Planner utilities
 * Handles timezone calculations, slot generation, and meeting time finding
 */

  export type TimeZoneId = string // e.g., "America/New_York"

export interface Participant {
  id: string
  name: string
  timeZone: TimeZoneId
  workStartMinutes: number // minutes from 00:00 local (e.g., 9 * 60 = 540)
  workEndMinutes: number // minutes from 00:00 local (e.g., 17 * 60 = 1020)
  color?: string
}

export interface PlannerState {
  participants: Participant[]
  meetingDurationMinutes: number
  dateISO: string // YYYY-MM-DD
  showWeekends: boolean
  use24h: boolean
  fairnessMode: "balanced" | "organizer_favor" | "rotate"
}

export interface TimeSlot {
  startUTC: Date
  endUTC: Date
  localTimes: Record<string, { start: Date; end: Date; formatted: string }>
  score: number // 0-100, higher is better
  conflicts: string[] // participant IDs with conflicts
}

/**
 * Get user's current timezone
 */
export function getCurrentTimeZone(): TimeZoneId {
  return Intl.DateTimeFormat().resolvedOptions().timeZone
}

import moment from 'moment-timezone'

export interface CityOption {
  value: TimeZoneId
  city: string
  country: string
  region: string
  offset: string
  searchTerms: string
}

// City name mappings for better display names
const cityMappings: Record<string, { city: string; country: string }> = {
  // North America
  'America/New_York': { city: 'New York', country: 'United States' },
  'America/Los_Angeles': { city: 'Los Angeles', country: 'United States' },
  'America/Chicago': { city: 'Chicago', country: 'United States' },
  'America/Denver': { city: 'Denver', country: 'United States' },
  'America/Phoenix': { city: 'Phoenix', country: 'United States' },
  'America/Detroit': { city: 'Detroit', country: 'United States' },
  'America/Toronto': { city: 'Toronto', country: 'Canada' },
  'America/Vancouver': { city: 'Vancouver', country: 'Canada' },
  'America/Montreal': { city: 'Montreal', country: 'Canada' },
  'America/Mexico_City': { city: 'Mexico City', country: 'Mexico' },
  
  // Europe  
  'Europe/London': { city: 'London', country: 'United Kingdom' },
  'Europe/Paris': { city: 'Paris', country: 'France' },
  'Europe/Berlin': { city: 'Berlin', country: 'Germany' },
  'Europe/Rome': { city: 'Rome', country: 'Italy' },
  'Europe/Madrid': { city: 'Madrid', country: 'Spain' },
  'Europe/Amsterdam': { city: 'Amsterdam', country: 'Netherlands' },
  'Europe/Moscow': { city: 'Moscow', country: 'Russia' },
  'Europe/Stockholm': { city: 'Stockholm', country: 'Sweden' },
  'Europe/Zurich': { city: 'Zurich', country: 'Switzerland' },
  'Europe/Vienna': { city: 'Vienna', country: 'Austria' },
  'Europe/Prague': { city: 'Prague', country: 'Czech Republic' },
  'Europe/Warsaw': { city: 'Warsaw', country: 'Poland' },
  'Europe/Budapest': { city: 'Budapest', country: 'Hungary' },
  'Europe/Athens': { city: 'Athens', country: 'Greece' },
  'Europe/Istanbul': { city: 'Istanbul', country: 'Turkey' },
  'Europe/Dublin': { city: 'Dublin', country: 'Ireland' },
  'Europe/Brussels': { city: 'Brussels', country: 'Belgium' },
  'Europe/Copenhagen': { city: 'Copenhagen', country: 'Denmark' },
  'Europe/Helsinki': { city: 'Helsinki', country: 'Finland' },
  'Europe/Oslo': { city: 'Oslo', country: 'Norway' },
  'Europe/Lisbon': { city: 'Lisbon', country: 'Portugal' },
  
  // Asia
  'Asia/Tokyo': { city: 'Tokyo', country: 'Japan' },
  'Asia/Shanghai': { city: 'Shanghai', country: 'China' },
  'Asia/Hong_Kong': { city: 'Hong Kong', country: 'Hong Kong' },
  'Asia/Singapore': { city: 'Singapore', country: 'Singapore' },
  'Asia/Seoul': { city: 'Seoul', country: 'South Korea' },
  'Asia/Kolkata': { city: 'Mumbai', country: 'India' },
  'Asia/Dubai': { city: 'Dubai', country: 'UAE' },
  'Asia/Bangkok': { city: 'Bangkok', country: 'Thailand' },
  'Asia/Tbilisi': { city: 'Tbilisi', country: 'Georgia' },
  'Asia/Jakarta': { city: 'Jakarta', country: 'Indonesia' },
  'Asia/Manila': { city: 'Manila', country: 'Philippines' },
  'Asia/Kuala_Lumpur': { city: 'Kuala Lumpur', country: 'Malaysia' },
  'Asia/Tel_Aviv': { city: 'Tel Aviv', country: 'Israel' },
  'Asia/Karachi': { city: 'Karachi', country: 'Pakistan' },
  'Asia/Dhaka': { city: 'Dhaka', country: 'Bangladesh' },
  'Asia/Ho_Chi_Minh': { city: 'Ho Chi Minh City', country: 'Vietnam' },
  'Asia/Riyadh': { city: 'Riyadh', country: 'Saudi Arabia' },
  'Asia/Tehran': { city: 'Tehran', country: 'Iran' },
  'Asia/Yerevan': { city: 'Yerevan', country: 'Armenia' },
  'Asia/Baku': { city: 'Baku', country: 'Azerbaijan' },
  
  // Australia & Oceania
  'Australia/Sydney': { city: 'Sydney', country: 'Australia' },
  'Australia/Melbourne': { city: 'Melbourne', country: 'Australia' },
  'Australia/Brisbane': { city: 'Brisbane', country: 'Australia' },
  'Australia/Perth': { city: 'Perth', country: 'Australia' },
  'Pacific/Auckland': { city: 'Auckland', country: 'New Zealand' },
  'Pacific/Fiji': { city: 'Suva', country: 'Fiji' },
  
  // South America
  'America/Sao_Paulo': { city: 'São Paulo', country: 'Brazil' },
  'America/Buenos_Aires': { city: 'Buenos Aires', country: 'Argentina' },
  'America/Lima': { city: 'Lima', country: 'Peru' },
  'America/Santiago': { city: 'Santiago', country: 'Chile' },
  'America/Bogota': { city: 'Bogotá', country: 'Colombia' },
  'America/Caracas': { city: 'Caracas', country: 'Venezuela' },
  
  // Africa
  'Africa/Cairo': { city: 'Cairo', country: 'Egypt' },
  'Africa/Lagos': { city: 'Lagos', country: 'Nigeria' },
  'Africa/Johannesburg': { city: 'Johannesburg', country: 'South Africa' },
  'Africa/Casablanca': { city: 'Casablanca', country: 'Morocco' },
  'Africa/Nairobi': { city: 'Nairobi', country: 'Kenya' },
  'Africa/Algiers': { city: 'Algiers', country: 'Algeria' },
}

/**
 * Get all available cities with their timezones dynamically from moment-timezone
 * This provides comprehensive timezone coverage with proper city names
 */
export function getMajorCities(): CityOption[] {
  // Get all timezone names from moment-timezone
  const allTimezones = moment.tz.names()
  
  // Filter to get city-based timezones (exclude things like GMT, UTC, etc.)
  const cityTimezones = allTimezones.filter(tz => {
    // Include timezones that have city mappings or follow city patterns
    return cityMappings[tz] || 
           (tz.includes('/') && 
            !tz.includes('GMT') && 
            !tz.includes('UTC') && 
            !tz.startsWith('Etc/') &&
            !tz.startsWith('US/') &&
            !tz.startsWith('Canada/') &&
            !tz.includes('ACT') &&
            !tz.includes('EST') &&
            !tz.includes('MST') &&
            !tz.includes('PST'))
  })

  const now = new Date()

  return cityTimezones.map(tz => {
    const mapping = cityMappings[tz]
    
    // Extract region and city from timezone if no mapping exists
    const [region, cityPart] = tz.split('/')
    const fallbackCity = cityPart ? cityPart.replace(/_/g, ' ') : tz
    const fallbackCountry = getCountryFromRegion(region, cityPart)
    
    const city = mapping?.city || fallbackCity
    const country = mapping?.country || fallbackCountry
    const regionName = getRegionName(region)

    try {
      const formatter = new Intl.DateTimeFormat('en-US', {
        timeZone: tz,
        timeZoneName: 'short'
      })
      const parts = formatter.formatToParts(now)
      const offset = parts.find(p => p.type === 'timeZoneName')?.value || ''

      return {
        value: tz,
        city,
        country,
        region: regionName,
        offset,
        searchTerms: `${city} ${country} ${regionName} ${tz}`.toLowerCase()
      }
    } catch {
      return {
        value: tz,
        city,
        country,
        region: regionName,
        offset: '',
        searchTerms: `${city} ${country} ${regionName} ${tz}`.toLowerCase()
      }
    }
  })
  .filter(city => city.city && city.city.length > 1) // Filter out invalid entries
  .sort((a, b) => a.city.localeCompare(b.city))
}

/**
 * Get region display name from timezone region
 */
function getRegionName(region: string): string {
  const regionMap: Record<string, string> = {
    'America': 'Americas',
    'Europe': 'Europe',
    'Asia': 'Asia',
    'Africa': 'Africa',
    'Australia': 'Oceania',
    'Pacific': 'Oceania',
    'Indian': 'Indian Ocean',
    'Atlantic': 'Atlantic',
    'Antarctica': 'Antarctica'
  }
  return regionMap[region] || region
}

/**
 * Get country from region and city for fallback
 */
function getCountryFromRegion(region: string, city?: string): string {
  if (!city) return region
  
  // Simple mapping for common patterns
  const countryMap: Record<string, string> = {
    // Americas
    'New_York': 'United States',
    'Los_Angeles': 'United States', 
    'Chicago': 'United States',
    'Toronto': 'Canada',
    'Mexico_City': 'Mexico',
    
    // Europe patterns - most European cities can use the city name
    // Asia patterns
    'Tokyo': 'Japan',
    'Shanghai': 'China',
    'Mumbai': 'India',
    
    // Default fallbacks by region
    'America': 'Americas',
    'Europe': 'Europe', 
    'Asia': 'Asia',
    'Africa': 'Africa',
    'Australia': 'Australia',
    'Pacific': 'Pacific Islands'
  }
  
  return countryMap[city] || countryMap[region] || region
}

/**
 * Get user's current city based on timezone
 */
export function getCurrentCity(): CityOption | null {
  const currentTz = getCurrentTimeZone()
  const cities = getMajorCities()
  return cities.find(city => city.value === currentTz) || null
}

/**
 * Convert local time to UTC
 */
export function localToUTC(date: Date, timeZone: TimeZoneId): Date {
  const utc = new Date(date.toLocaleString("en-US", {timeZone: "UTC"}))
  const local = new Date(date.toLocaleString("en-US", {timeZone}))
  return new Date(utc.getTime() + (utc.getTime() - local.getTime()))
}

/**
 * Convert UTC to local time for a timezone
 */
export function utcToLocal(utcDate: Date, timeZone: TimeZoneId): Date {
  return new Date(utcDate.toLocaleString("en-US", {timeZone}))
}

/**
 * Generate available time slots for a given date and participants
 */
export function generateTimeSlots(
  state: PlannerState,
  maxSlots: number = 20
): TimeSlot[] {
  if (state.participants.length === 0) return []

  // Validate input
  if (!state.dateISO || state.meetingDurationMinutes <= 0) return []

  const targetDate = new Date(state.dateISO + 'T12:00:00.000Z') // Use noon to avoid timezone issues
  const slots: TimeSlot[] = []

  // For each participant, get their working hours in UTC
  const participantWindows = state.participants.map(p => {
    // Validate participant data
    if (!p.timeZone || p.workStartMinutes < 0 || p.workEndMinutes <= p.workStartMinutes) {
      return null
    }

    try {
      // Create date objects for the participant's local timezone
      const workStart = new Date(targetDate)
      const workEnd = new Date(targetDate)
      
      // Set local working hours
      workStart.setUTCHours(Math.floor(p.workStartMinutes / 60), p.workStartMinutes % 60, 0, 0)
      workEnd.setUTCHours(Math.floor(p.workEndMinutes / 60), p.workEndMinutes % 60, 0, 0)

      // Convert to participant's timezone then back to UTC for comparison
      const startLocal = new Date(workStart.toLocaleString("en-US", {timeZone: p.timeZone}))
      const endLocal = new Date(workEnd.toLocaleString("en-US", {timeZone: p.timeZone}))
      
      // Calculate UTC offset and adjust
      const startUTC = new Date(workStart.getTime() + (workStart.getTime() - startLocal.getTime()))
      const endUTC = new Date(workEnd.getTime() + (workEnd.getTime() - endLocal.getTime()))

      return {
        participant: p,
        startUTC,
        endUTC
      }
    } catch {
      console.warn(`Invalid timezone for participant ${p.name}: ${p.timeZone}`)
      return null
    }
  }).filter(Boolean) // Remove null entries

  if (participantWindows.length === 0) return []

  // Find overlapping windows
  const startTimes = participantWindows.map(w => w!.startUTC.getTime())
  const endTimes = participantWindows.map(w => w!.endUTC.getTime())
  
  const globalStart = new Date(Math.max(...startTimes))
  const globalEnd = new Date(Math.min(...endTimes))

  if (globalStart >= globalEnd) return [] // No overlap

  // Generate slots within the overlapping window
  const slotDuration = state.meetingDurationMinutes * 60 * 1000 // milliseconds
  const increment = 15 * 60 * 1000 // 15-minute increments

  // Limit the search to prevent infinite loops
  const maxIterations = Math.min(200, Math.floor((globalEnd.getTime() - globalStart.getTime()) / increment))
  let iterations = 0

  for (let time = globalStart.getTime(); 
       time <= globalEnd.getTime() - slotDuration && iterations < maxIterations; 
       time += increment, iterations++) {
    
    const slotStart = new Date(time)
    const slotEnd = new Date(time + slotDuration)

    // Check if this slot fits within all participants' working hours
    const fitsAll = participantWindows.every(window =>
      window && slotStart >= window.startUTC && slotEnd <= window.endUTC
    )

    if (fitsAll) {
      const localTimes: Record<string, { start: Date; end: Date; formatted: string }> = {}
      const conflicts: string[] = []

      state.participants.forEach(p => {
        try {
          // Convert UTC times to participant's local time
          const localStart = new Date(slotStart.toLocaleString("en-US", {timeZone: p.timeZone}))
          const localEnd = new Date(slotEnd.toLocaleString("en-US", {timeZone: p.timeZone}))

          // Adjust for timezone conversion differences
          const offsetStart = slotStart.getTime() - localStart.getTime()
          const offsetEnd = slotEnd.getTime() - localEnd.getTime()
          
          const adjustedStart = new Date(slotStart.getTime() + offsetStart)
          const adjustedEnd = new Date(slotEnd.getTime() + offsetEnd)

          const formatTime = (date: Date) => {
            return date.toLocaleTimeString('en-US', {
              hour: 'numeric',
              minute: '2-digit',
              hour12: !state.use24h,
              timeZone: p.timeZone
            })
          }

          localTimes[p.id] = {
            start: adjustedStart,
            end: adjustedEnd,
            formatted: `${formatTime(adjustedStart)} - ${formatTime(adjustedEnd)}`
          }

          // Check for conflicts (outside preferred working hours)
          const startMinutes = adjustedStart.getHours() * 60 + adjustedStart.getMinutes()
          const endMinutes = startMinutes + state.meetingDurationMinutes
          
          if (startMinutes < p.workStartMinutes || endMinutes > p.workEndMinutes) {
            conflicts.push(p.id)
          }
        } catch (error) {
          console.warn(`Error calculating local time for ${p.name}:`, error)
          localTimes[p.id] = {
            start: slotStart,
            end: slotEnd,
            formatted: 'Time calculation error'
          }
          conflicts.push(p.id)
        }
      })

      // Calculate score (0-100)
      const score = calculateSlotScore(slotStart, state.participants, conflicts)

      slots.push({
        startUTC: slotStart,
        endUTC: slotEnd,
        localTimes,
        score,
        conflicts
      })
    }
  }

  // Sort by score (highest first) and return top slots
  return slots
    .sort((a, b) => b.score - a.score)
    .slice(0, maxSlots)
}

/**
 * Calculate how good a time slot is (0-100 score)
 */
function calculateSlotScore(slotStart: Date, participants: Participant[], conflicts: string[]): number {
  if (participants.length === 0) return 0

  // Base score starts at 100
  let score = 100

  // Penalty for conflicts (each conflict reduces score)
  const conflictPenalty = (conflicts.length / participants.length) * 30
  score -= conflictPenalty

  // Bonus for being close to middle of typical working day (12 PM UTC)
  const slotHour = slotStart.getUTCHours()
  const distanceFromNoon = Math.abs(slotHour - 12)
  const noonBonus = Math.max(0, 20 - distanceFromNoon * 2)
  score += noonBonus

  // Ensure score stays within bounds
  return Math.max(0, Math.min(100, score))
}

/**
 * Format time slot for display
 */
export function formatTimeSlot(slot: TimeSlot, use24h: boolean): string {
  const startTime = slot.startUTC.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: !use24h
  })

  const endTime = slot.endUTC.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: !use24h
  })

  return `${startTime} - ${endTime} UTC`
}

/**
 * Get participant colors for visual distinction
 */
export const participantColors = [
  '#3B82F6', // blue
  '#10B981', // emerald
  '#F59E0B', // amber
  '#8B5CF6', // violet
  '#06B6D4', // cyan
  '#F97316', // orange
  '#EF4444', // red
  '#84CC16', // lime
  '#EC4899', // pink
  '#6366F1', // indigo
]

export function getParticipantColor(index: number): string {
  return participantColors[index % participantColors.length]
}

/**
 * Encode planner state to URL-safe string
 */
export function encodePlannerState(state: PlannerState): string {
  const data = {
    p: state.participants.map(p => ({
      i: p.id,
      n: p.name,
      tz: p.timeZone,
      ws: p.workStartMinutes,
      we: p.workEndMinutes,
      c: p.color
    })),
    d: state.meetingDurationMinutes,
    dt: state.dateISO,
    sw: state.showWeekends,
    h24: state.use24h,
    fm: state.fairnessMode
  }

  return btoa(JSON.stringify(data)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '')
}

/**
 * Decode planner state from URL-safe string
 */
interface EncodedParticipant {
  i: string
  n: string
  tz: string
  ws: number
  we: number
  c?: string
}

interface EncodedPlannerData {
  p: EncodedParticipant[]
  d: number
  dt: string
  sw: boolean
  h24: boolean
  fm: string
}

export function decodePlannerState(encoded: string): PlannerState | null {
  try {
    const jsonStr = atob(encoded.replace(/-/g, '+').replace(/_/g, '/'))
    const data: EncodedPlannerData = JSON.parse(jsonStr)

    return {
      participants: data.p.map((p: EncodedParticipant) => ({
        id: p.i,
        name: p.n,
        timeZone: p.tz,
        workStartMinutes: p.ws,
        workEndMinutes: p.we,
        color: p.c
      })),
      meetingDurationMinutes: data.d,
      dateISO: data.dt,
      showWeekends: data.sw,
      use24h: data.h24,
      fairnessMode: data.fm as PlannerState['fairnessMode']
    }
  } catch {
    return null
  }
}
