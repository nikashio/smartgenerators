/**
 * Cities data utilities for sunrise/sunset calculator
 * Loads and indexes city data from the top_2000_cities.json dataset
 */

import citiesData from '../app/simplemaps_worldcities_baasicv1.901/top_2000_cities.json'

export interface City {
  name: string
  country: string
  lat: number
  lng: number
  iso2: string
  population: number
  slug: string
  timezone: string
}

// Timezone mapping for major cities
const TIMEZONE_MAP: Record<string, string> = {
  // North America
  'new-york-us': 'America/New_York',
  'los-angeles-us': 'America/Los_Angeles',
  'chicago-us': 'America/Chicago',
  'toronto-ca': 'America/Toronto',
  'mexico-city-mx': 'America/Mexico_City',

  // Europe
  'london-gb': 'Europe/London',
  'paris-fr': 'Europe/Paris',
  'berlin-de': 'Europe/Berlin',
  'rome-it': 'Europe/Rome',
  'barcelona-es': 'Europe/Madrid',
  'amsterdam-nl': 'Europe/Amsterdam',
  'vienna-at': 'Europe/Vienna',
  'moscow-ru': 'Europe/Moscow',

  // Asia
  'tbilisi-ge': 'Asia/Tbilisi',
  'tokyo-jp': 'Asia/Tokyo',
  'mumbai-in': 'Asia/Kolkata',
  'delhi-in': 'Asia/Kolkata',
  'shanghai-cn': 'Asia/Shanghai',
  'beijing-cn': 'Asia/Shanghai',
  'dubai-ae': 'Asia/Dubai',
  'singapore-sg': 'Asia/Singapore',
  'hong-kong-hk': 'Asia/Hong_Kong',
  'seoul-kr': 'Asia/Seoul',
  'bangkok-th': 'Asia/Bangkok',

  // South America
  'sao-paulo-br': 'America/Sao_Paulo',
  'rio-de-janeiro-br': 'America/Sao_Paulo',
  'buenos-aires-ar': 'America/Argentina/Buenos_Aires',

  // Africa
  'cape-town-za': 'Africa/Johannesburg',
  'cairo-eg': 'Africa/Cairo',

  // Oceania
  'sydney-au': 'Australia/Sydney'
}

/**
 * Generate URL-friendly slug from city name and country
 */
function generateSlug(city: string, iso2: string): string {
  if (!city || !iso2) return 'unknown'
  return `${city.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '')}-${iso2.toLowerCase()}`
}

/**
 * Get timezone for a city slug, fallback to UTC if not found
 */
function getTimezone(slug: string): string {
  return TIMEZONE_MAP[slug] || 'UTC'
}

/**
 * Transform raw city data into City objects
 */
function transformCities(): City[] {
  return citiesData
    .filter((rawCity) => rawCity.city && rawCity.country && rawCity.iso2 && rawCity.lat && rawCity.lng)
    .map((rawCity) => {
      const slug = generateSlug(rawCity.city, rawCity.iso2)
      return {
        name: rawCity.city,
        country: rawCity.country,
        lat: rawCity.lat,
        lng: rawCity.lng,
        iso2: rawCity.iso2,
        population: rawCity.population || 0,
        slug,
        timezone: getTimezone(slug)
      }
    })
}

// Cache transformed cities
let _cities: City[] | null = null

/**
 * Get all cities (cached)
 */
export function getAllCities(): City[] {
  if (!_cities) {
    _cities = transformCities()
  }
  return _cities
}

/**
 * Find city by slug
 */
export function findCityBySlug(slug: string): City | null {
  const cities = getAllCities()
  return cities.find(city => city.slug === slug) || null
}

/**
 * Search cities by name (case-insensitive)
 */
export function searchCities(query: string, limit = 20): City[] {
  if (!query.trim()) return []
  
  const cities = getAllCities()
  const searchTerm = query.toLowerCase()
  
  const matches = cities.filter(city => 
    city.name.toLowerCase().includes(searchTerm) ||
    city.country.toLowerCase().includes(searchTerm)
  )
  
  // Sort by population (descending) and take limit
  return matches
    .sort((a, b) => b.population - a.population)
    .slice(0, limit)
}

/**
 * Get featured cities for examples and static generation
 */
export function getFeaturedCities(): City[] {
  const featuredSlugs = [
    // Major world cities
    'new-york-us',
    'london-gb',
    'tbilisi-ge',
    'tokyo-jp',
    'paris-fr',
    'berlin-de',
    'sydney-au',
    'los-angeles-us',
    'chicago-us',
    'toronto-ca',
    'mumbai-in',
    'delhi-in',
    'shanghai-cn',
    'beijing-cn',
    'moscow-ru',
    'dubai-ae',
    'singapore-sg',
    'hong-kong-hk',
    'seoul-kr',
    'bangkok-th',
    'rome-it',
    'barcelona-es',
    'amsterdam-nl',
    'vienna-at',
    'mexico-city-mx',
    'sao-paulo-br',
    'rio-de-janeiro-br',
    'buenos-aires-ar',
    'cape-town-za',
    'cairo-eg'
  ]
  return featuredSlugs
    .map(slug => findCityBySlug(slug))
    .filter(Boolean) as City[]
}

/**
 * Format city display name
 */
export function formatCityName(city: City): string {
  return `${city.name}, ${city.country}`
}
