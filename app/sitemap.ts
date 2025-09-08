import { MetadataRoute } from 'next'
import { getAllEventSlugs } from '@/lib/seasonal-events'
import { getFeaturedCities, getTopCitiesForSitemap } from '@/lib/cities'
import { allTools } from '@/lib/tools'
import fs from 'fs'
import path from 'path'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://smartgenerators.dev'
  
  // Discover all static app routes that have a page.tsx and no dynamic segments
  const discoveredStaticPages = getAllStaticAppPages().map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.7 as const,
  }))
  
  // Static pages
  const staticPages = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 1,
    },
    {
      url: `${baseUrl}/tools`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/countdown`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/countdown/embed`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    },
    {
      url: `${baseUrl}/countdown/view`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    },
    {
      url: `${baseUrl}/discord-timestamp`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/chat-link-generator`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/add-to-calendar`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/time-zone-planner`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/time-zone-planner/view`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    },
    {
      url: `${baseUrl}/time-zone-planner/embed`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.5,
    },
    {
      url: `${baseUrl}/blog/whatsapp-link-generator-click-to-chat-guide`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    },
    {
      url: `${baseUrl}/sunrise-sunset`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/convert/heic-converter`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/convert/heic-to-jpg`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    },
  ]

  // All tool landing pages from central registry
  const toolPages = allTools.map((tool) => ({
    url: `${baseUrl}${tool.href}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.8 as const,
  }))

  // Dynamic countdown pages
  const countdownPages = getAllEventSlugs().map((slug) => ({
    url: `${baseUrl}/countdown/${slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }))

  // Sunrise sunset city pages - Featured cities (high priority)
  const featuredSunriseSunsetPages = getFeaturedCities().map((city) => ({
    url: `${baseUrl}/sunrise-sunset/${city.slug}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: 0.8,
  }))

  // Additional top cities by population (medium priority)
  const topCitiesPages = getTopCitiesForSitemap()
    .filter(city => !getFeaturedCities().some(featured => featured.slug === city.slug))
    .map((city) => ({
      url: `${baseUrl}/sunrise-sunset/${city.slug}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    }))

  // Merge and de-duplicate by URL
  const merged = [
    ...staticPages,
    // auto-discovered static pages (deduped later)
    ...discoveredStaticPages,
    ...toolPages,
    ...countdownPages,
    ...featuredSunriseSunsetPages,
    ...topCitiesPages,
  ]

  const seen = new Set<string>()
  const deduped: MetadataRoute.Sitemap = []
  for (const item of merged) {
    if (!seen.has(item.url)) {
      seen.add(item.url)
      deduped.push(item)
    }
  }

  return deduped
}

// Recursively scan the app/ directory for static page routes (no dynamic segments)
function getAllStaticAppPages(): string[] {
  const appDir = path.join(process.cwd(), 'app')
  const routes: string[] = []

  function walk(dir: string, routeBase: string) {
    // Skip api routes
    if (routeBase.startsWith('/api')) return

    const entries = fs.readdirSync(dir, { withFileTypes: true })

    // If this directory contains a page.tsx, record the route
    if (entries.some((e) => e.isFile() && e.name === 'page.tsx')) {
      routes.push(routeBase === '' ? '/' : routeBase)
    }

    for (const entry of entries) {
      if (!entry.isDirectory()) continue

      const name = entry.name

      // Skip route groups and dynamic segments
      if (name.startsWith('(') && name.endsWith(')')) continue
      if (name.includes('[') && name.includes(']')) continue
      if (name === 'api') continue

      const nextDir = path.join(dir, name)
      const nextRoute = routeBase + '/' + name
      walk(nextDir, nextRoute)
    }
  }

  walk(appDir, '')

  // Normalize and sort for stability
  const normalized = Array.from(new Set(routes.map((r) => r.replace(/\\+/g, '/'))))
  return normalized.sort((a, b) => a.localeCompare(b))
}
