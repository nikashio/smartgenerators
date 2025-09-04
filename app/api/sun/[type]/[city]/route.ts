/**
 * API endpoint for generating ICS calendar files
 * Supports sunrise-sunset, golden-hour, and blue-hour types
 */

import { NextRequest, NextResponse } from "next/server"
import { findCityBySlug } from "@/lib/cities"
import { generateSunICS, generateICSFilename } from "@/lib/sun-ics"

interface RouteParams {
  params: {
    type: string
    city: string
  }
}

// Enable edge runtime for better performance
export const runtime = 'edge'

export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { type, city: citySlug } = params
    const { searchParams } = new URL(request.url)
    
    // Validate type
    const validTypes = ['sunrise-sunset', 'golden-hour', 'blue-hour']
    if (!validTypes.includes(type)) {
      return NextResponse.json(
        { error: 'Invalid type. Must be one of: sunrise-sunset, golden-hour, blue-hour' },
        { status: 400 }
      )
    }

    // Find city
    const city = findCityBySlug(citySlug)
    if (!city) {
      return NextResponse.json(
        { error: 'City not found' },
        { status: 404 }
      )
    }

    // Parse query parameters
    const range = searchParams.get('range') // 'month' | 'year'
    const daysParam = searchParams.get('days')
    const startParam = searchParams.get('start')
    const includeBlueHour = searchParams.get('blue_hour') === 'true'

    // Calculate date range
    let startDate = new Date()
    let days = 30 // default to 1 month

    if (startParam) {
      startDate = new Date(startParam)
      if (isNaN(startDate.getTime())) {
        return NextResponse.json(
          { error: 'Invalid start date format. Use YYYY-MM-DD' },
          { status: 400 }
        )
      }
    }

    if (range === 'month') {
      days = 30
    } else if (range === 'year') {
      days = 365
    } else if (daysParam) {
      const parsedDays = parseInt(daysParam, 10)
      if (isNaN(parsedDays) || parsedDays < 1 || parsedDays > 365) {
        return NextResponse.json(
          { error: 'Invalid days parameter. Must be between 1 and 365' },
          { status: 400 }
        )
      }
      days = parsedDays
    }

    // Generate ICS content
    const icsContent = generateSunICS({
      type: type as 'sunrise-sunset' | 'golden-hour' | 'blue-hour',
      citySlug,
      startDate,
      days,
      includeBlueHour: type === 'blue-hour' || includeBlueHour
    })

    // Generate filename
    const filename = generateICSFilename(type, citySlug, range)

    // Return ICS file
    return new NextResponse(icsContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/calendar; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 's-maxage=86400, stale-while-revalidate=86400', // Cache for 24 hours
      },
    })

  } catch (error) {
    console.error('Error generating ICS:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Handle OPTIONS for CORS
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  })
}
