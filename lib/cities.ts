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
 * Get top cities for sitemap generation (more comprehensive list)
 */
export function getTopCitiesForSitemap(): City[] {
  const cities = getAllCities()
  
  // Get top 100 cities by population for sitemap
  return cities
    .sort((a, b) => b.population - a.population)
    .slice(0, 100)
}

/**
 * Get related cities for internal linking (excluding current city)
 */
export function getRelatedCities(currentCitySlug: string, count = 8): City[] {
  const featuredCities = getFeaturedCities()
  const filtered = featuredCities.filter(city => city.slug !== currentCitySlug)
  
  // Shuffle array and take requested count
  const shuffled = filtered.sort(() => 0.5 - Math.random())
  return shuffled.slice(0, count)
}

/**
 * Generate city-specific content for SEO and user engagement
 */
export function generateCityContent(city: City): {
  introParagraph: string
  uniqueFact: string
  activitySuggestion: string
  seasonalNote?: string
} {
  const cityName = city.name
  const country = city.country

  // Geographic and climate-based content
  const northern = city.lat > 40
  const southern = city.lat < -20
  const equatorial = Math.abs(city.lat) < 10
  const coastal = Math.abs(city.lng) < 20 || Math.abs(city.lng - 180) < 20

  // Time zone considerations
  const eastern = city.timezone.includes('Eastern') || city.timezone.includes('Europe') || city.timezone.includes('Asia')
  const western = city.timezone.includes('Pacific') || city.timezone.includes('Mountain') || city.timezone.includes('Western')

  // Generate unique content based on city characteristics
  const contentMap: Record<string, any> = {
    // Major European cities
    'london-gb': {
      introParagraph: `London's variable weather creates dramatic lighting conditions perfect for photographers. The city's historic landmarks along the Thames come alive during golden hour, making it a favorite spot for both amateur and professional photography.`,
      uniqueFact: `London's latitude means winter sunrises can occur as late as 8 AM, while summer evenings stay bright until 10 PM.`,
      activitySuggestion: `Plan your Thames River walks or Hyde Park visits around golden hour for the most magical experience.`,
      seasonalNote: `Don't miss the unique "London Particular" fog during autumn evenings - perfect for atmospheric photography.`
    },
    'paris-fr': {
      introParagraph: `Paris's elegant architecture and wide boulevards are transformed by the golden hour light, creating the perfect backdrop for capturing the City's romantic essence.`,
      uniqueFact: `The Eiffel Tower's lighting schedule coincides beautifully with sunset times throughout the year.`,
      activitySuggestion: `Position yourself along the Seine or at Sacré-Cœur for breathtaking golden hour views of the City of Light.`,
      seasonalNote: `Spring and fall offer the clearest skies for unobstructed photography of Paris's monuments.`
    },
    'rome-it': {
      introParagraph: `Rome's ancient architecture and Mediterranean climate create ideal conditions for outdoor photography. The city's historic sites are particularly stunning during the soft light of golden hour.`,
      uniqueFact: `Many ancient Roman sites are oriented to align with sunrise and sunset positions from the time of construction.`,
      activitySuggestion: `Visit the Colosseum or Roman Forum during golden hour when the crowds thin and the lighting is most dramatic.`,
      seasonalNote: `Summer evenings in Rome stay light until 9 PM, perfect for extended outdoor dining and exploration.`
    },
    'berlin-de': {
      introParagraph: `Berlin's modern architecture and historic sites create fascinating contrasts in golden hour light. The city's creative energy is especially vibrant during the extended summer evenings.`,
      uniqueFact: `Berlin's central European location means balanced day lengths year-round, with summer days lasting up to 17 hours.`,
      activitySuggestion: `Photograph the Berlin Wall remnants or Brandenburg Gate during golden hour for striking urban landscapes.`,
      seasonalNote: `Winter brings dramatic sunsets around 4 PM, creating cozy indoor-outdoor atmospheres perfect for café culture.`
    },
    // North American cities
    'new-york-us': {
      introParagraph: `New York's urban canyons create dramatic shadow play during sunrise and sunset. The city's skyscrapers frame the sky in ways that make every golden hour unique.`,
      uniqueFact: `Manhattan's grid layout was designed to maximize sunlight exposure for buildings constructed before air conditioning.`,
      activitySuggestion: `Find the perfect spot in Central Park or along the Hudson River for urban sunrise photography.`,
      seasonalNote: `Winter sunrises over the East River create stunning silhouettes of the Manhattan skyline.`
    },
    'los-angeles-us': {
      introParagraph: `Los Angeles's Mediterranean climate and coastal location create ideal conditions for year-round outdoor activities. The city's diverse landscapes offer endless photography opportunities.`,
      uniqueFact: `LA's latitude and coastal position mean consistent weather patterns with clear skies most of the year.`,
      activitySuggestion: `Visit Venice Beach or Santa Monica Pier during golden hour for that classic California sunset experience.`,
      seasonalNote: `June gloom brings magical diffused light perfect for portrait photography throughout the morning.`
    },
    'san-francisco-us': {
      introParagraph: `San Francisco's iconic fog and hilly terrain create dynamic lighting conditions. The city's famous landmarks are particularly striking when framed by the bay's waters.`,
      uniqueFact: `The city's microclimates mean you can experience different weather patterns within blocks of each other.`,
      activitySuggestion: `Photograph the Golden Gate Bridge from Marin Headlands during sunset for world-famous postcard shots.`,
      seasonalNote: `Summer fog creates ethereal lighting conditions, especially along the coastal areas.`
    },
    'chicago-us': {
      introParagraph: `Chicago's lakefront location and architectural skyline create dramatic sunrise and sunset opportunities. The city's windy conditions add to the dynamic outdoor experience.`,
      uniqueFact: `Lake Michigan's proximity moderates temperatures and creates stunning lakefront sunrises.`,
      activitySuggestion: `Visit Millennium Park or the Chicago Riverwalk for urban sunset photography with architectural elements.`,
      seasonalNote: `Winter brings crisp, clear air perfect for long-distance photography of the city skyline.`
    },
    // Asian cities
    'tokyo-jp': {
      introParagraph: `Tokyo's blend of traditional and modern elements creates fascinating contrasts during golden hour. The city's efficient public transport makes it easy to chase the best light.`,
      uniqueFact: `Tokyo's islands span multiple time zones, creating unique daylight patterns across the metropolis.`,
      activitySuggestion: `Visit Senso-ji Temple or Shibuya Crossing during golden hour for a mix of traditional and contemporary Japan.`,
      seasonalNote: `Cherry blossom season (sakura) creates magical lighting conditions in parks throughout the city.`
    },
    'mumbai-in': {
      introParagraph: `Mumbai's coastal location and tropical climate create vibrant golden hour conditions. The city's bustling energy is amplified by the warm evening light.`,
      uniqueFact: `Mumbai's Arabian Sea location means consistent sea breezes that affect sunrise and sunset visibility.`,
      activitySuggestion: `Visit Marine Drive or Chowpatty Beach during golden hour for that signature Mumbai sunset experience.`,
      seasonalNote: `Monsoon season brings dramatic cloud formations that create spectacular sunset displays.`
    },
    'shanghai-cn': {
      introParagraph: `Shanghai's modern skyline and historic waterfront create stunning contrasts during golden hour. The city's rapid development has created endless photography opportunities.`,
      uniqueFact: `The Bund's colonial architecture was specifically designed to face the sunset for optimal lighting.`,
      activitySuggestion: `Position yourself along the Bund or in Lujiazui district for dramatic skyline photography.`,
      seasonalNote: `Winter brings clearer skies, perfect for photographing Shanghai's illuminated skyline at dusk.`
    },
    // Default content generator for cities not specifically defined
    'default': function(city: City) {
      const isCoastal = coastal
      const isNorthern = northern
      const isSouthern = southern
      const isEastern = eastern

      let introParagraph = ""
      let uniqueFact = ""
      let activitySuggestion = ""

      // Generate content based on city characteristics
      if (isCoastal) {
        introParagraph = `${cityName}'s coastal location creates beautiful sunrise and sunset opportunities along the waterfront. The sea breezes and marine climate contribute to consistent lighting conditions.`
        uniqueFact = `Coastal cities like ${cityName} often experience clearer skies and more predictable weather patterns due to ocean proximity.`
        activitySuggestion = `Take advantage of ${cityName}'s waterfront locations for stunning sunrise photography and sunset strolls.`
      } else if (isNorthern) {
        introParagraph = `${cityName}'s northern latitude brings dramatic seasonal changes in daylight hours. Summer evenings stay bright late into the night, while winter brings early darkness.`
        uniqueFact = `${cityName}'s position means summer days can last up to 18 hours, while winter days may be as short as 6 hours.`
        activitySuggestion = `Plan outdoor activities during the extended summer daylight hours, and enjoy cozy indoor pursuits during winter evenings.`
      } else if (isSouthern) {
        introParagraph = `${cityName}'s southern location provides consistent daylight patterns with warm, sunny conditions year-round. The climate supports outdoor activities throughout the year.`
        uniqueFact = `Southern cities maintain more consistent day lengths throughout the year compared to northern locations.`
        activitySuggestion = `Take advantage of the reliable weather for year-round outdoor photography and evening activities.`
      } else {
        introParagraph = `${cityName} offers unique opportunities for experiencing sunrise and sunset based on its geographic location. Each season brings different lighting conditions perfect for various activities.`
        uniqueFact = `Every city's unique latitude and longitude create distinct sunrise and sunset patterns that locals learn to appreciate.`
        activitySuggestion = `Explore ${cityName}'s local parks, landmarks, and neighborhoods to discover the best spots for viewing sunrise and sunset.`
      }

      return {
        introParagraph,
        uniqueFact,
        activitySuggestion,
        seasonalNote: isNorthern ? `Winter brings early darkness while summer extends daylight until late evening.` :
                     isSouthern ? `Year-round consistent daylight patterns make planning activities easier.` :
                     `Local climate patterns affect sunrise and sunset visibility throughout the year.`
      }
    }
  }

  // Get city-specific content or use default generator
  const cityKey = city.slug
  const cityContent = contentMap[cityKey] || contentMap['default'](city)

  return cityContent
}

/**
 * Calculate distance between two points using Haversine formula
 */
function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371 // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLng = (lng2 - lng1) * Math.PI / 180
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng/2) * Math.sin(dLng/2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
  return R * c
}

/**
 * Find nearby cities within a certain radius
 */
export function findNearbyCities(citySlug: string, maxDistance: number = 1000, limit: number = 6): City[] {
  const currentCity = findCityBySlug(citySlug)
  if (!currentCity) return []

  const cities = getAllCities()

  // Filter out the current city and find nearby cities
  const nearbyCities = cities
    .filter(city => city.slug !== citySlug)
    .map(city => ({
      ...city,
      distance: calculateDistance(currentCity.lat, currentCity.lng, city.lat, city.lng)
    }))
    .filter(city => city.distance <= maxDistance)
    .sort((a, b) => a.distance - b.distance)
    .slice(0, limit)

  return nearbyCities.map(({ distance, ...city }) => city)
}

/**
 * Get nearby popular cities (prioritizes featured cities within distance)
 */
export function getNearbyPopularCities(citySlug: string, maxDistance: number = 1500, limit: number = 8): City[] {
  const currentCity = findCityBySlug(citySlug)
  if (!currentCity) return []

  const featuredCities = getFeaturedCities()
  const cities = getAllCities()

  // First, try to find featured cities within the distance
  const nearbyFeatured = featuredCities
    .filter(city => city.slug !== citySlug)
    .map(city => ({
      ...city,
      distance: calculateDistance(currentCity.lat, currentCity.lng, city.lat, city.lng)
    }))
    .filter(city => city.distance <= maxDistance)
    .sort((a, b) => a.distance - b.distance)

  // If we have enough featured cities, return them
  if (nearbyFeatured.length >= Math.min(limit, 4)) {
    return nearbyFeatured.slice(0, limit).map(({ distance, ...city }) => city)
  }

  // Otherwise, supplement with other nearby cities
  const remainingSlots = limit - nearbyFeatured.length
  const otherNearby = cities
    .filter(city =>
      city.slug !== citySlug &&
      !featuredCities.some(featured => featured.slug === city.slug)
    )
    .map(city => ({
      ...city,
      distance: calculateDistance(currentCity.lat, currentCity.lng, city.lat, city.lng)
    }))
    .filter(city => city.distance <= maxDistance)
    .sort((a, b) => a.distance - b.distance)
    .slice(0, remainingSlots)

  return [...nearbyFeatured, ...otherNearby]
    .sort((a, b) => a.distance - b.distance)
    .slice(0, limit)
    .map(({ distance, ...city }) => city)
}

/**
 * Format city display name
 */
export function formatCityName(city: City): string {
  return `${city.name}, ${city.country}`
}
