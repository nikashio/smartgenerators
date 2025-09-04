"use client"

import { useState, useEffect, useMemo, useCallback, Suspense } from "react"

// Force dynamic rendering - prevent static generation for client components
export const dynamic = 'force-dynamic'
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { CalendarDays, Clock, Users, ExternalLink, Sun, Moon } from "lucide-react"
import ToolHeader from "@/components/ui/tool-header"
import {
  PlannerState,
  TimeSlot,
  generateTimeSlots,
  formatTimeSlot,
  getParticipantColor,
  getMajorCities,
  decodePlannerState
} from "@/lib/time-zone-utils"

/**
 * Read-only view of shared time zone meeting planner
 * Shows suggested meeting times for a shared planner link
 */
function TimeZonePlannerViewContent() {
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const [plannerState, setPlannerState] = useState<PlannerState | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isDarkMode, setIsDarkMode] = useState(false)
  
  // Available cities for display
  const cities = useMemo(() => getMajorCities(), [])

  // Initialize theme
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem("theme")
      const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches

      if (savedTheme === "dark" || (!savedTheme && systemPrefersDark)) {
        setIsDarkMode(true)
        document.documentElement.classList.add("dark")
      } else {
        setIsDarkMode(false)
        document.documentElement.classList.remove("dark")
      }
    }
  }, [])

  // Toggle theme
  const toggleTheme = useCallback(() => {
    const newTheme = !isDarkMode
    setIsDarkMode(newTheme)
    localStorage.setItem("theme", newTheme ? "dark" : "light")

    if (newTheme) {
      document.documentElement.classList.add("dark")
    } else {
      document.documentElement.classList.remove("dark")
    }

    toast({
      title: `${newTheme ? "Dark" : "Light"} mode enabled`,
      description: `Switched to ${newTheme ? "dark" : "light"} theme.`,
    })
  }, [isDarkMode, toast])

  // Decode planner state from URL
  useEffect(() => {
    const encoded = searchParams.get('p')
    if (encoded) {
      const decoded = decodePlannerState(encoded)
      if (decoded) {
        setPlannerState(decoded)
      } else {
        toast({
          title: "Invalid planner link",
          description: "This planner link appears to be corrupted or expired.",
          variant: "destructive"
        })
      }
    }
    setIsLoading(false)
  }, [searchParams, toast])

  // Generate time slots
  const timeSlots = useMemo(() => {
    return plannerState ? generateTimeSlots(plannerState) : []
  }, [plannerState])

  const addToCalendar = (slot: TimeSlot) => {
    if (!plannerState) return

    const title = `Meeting with ${plannerState.participants.length} participants`
    const details = plannerState.participants.map(p =>
      `${p.name}: ${slot.localTimes[p.id]?.formatted || 'N/A'}`
    ).join('\n')

    const googleUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(title)}&dates=${slot.startUTC.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')}/${slot.endUTC.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')}&details=${encodeURIComponent(details)}`

    window.open(googleUrl, '_blank')
    toast({
      title: "Added to Google Calendar",
      description: "The meeting has been added to your calendar.",
    })
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 dark:from-gray-950 dark:via-gray-900 dark:to-blue-950">
        <div className="mx-auto max-w-4xl px-4 py-16">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Loading planner...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!plannerState) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 dark:from-gray-950 dark:via-gray-900 dark:to-blue-950">
        <div className="mx-auto max-w-4xl px-4 py-16">
          <div className="text-center">
            <div className="text-6xl mb-4">🤔</div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Invalid Planner Link
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mb-8">
              This planner link appears to be corrupted or expired.
            </p>
            <Link href="/time-zone-planner">
              <Button>Create New Planner</Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 dark:from-gray-950 dark:via-gray-900 dark:to-blue-950">
      <ToolHeader />
      {/* Header */}
      <header className="border-b border-gray-200/50 bg-white/80 backdrop-blur-sm dark:border-gray-700/50 dark:bg-gray-900/80">
        <div className="mx-auto max-w-7xl px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white">
                <Clock className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Shared Meeting Planner
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {new Date(plannerState.dateISO).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Button
                onClick={toggleTheme}
                variant="outline"
                size="sm"
                className="h-10 w-10 p-0 rounded-full border-gray-200/50 bg-white/80 backdrop-blur-sm transition-all hover:bg-gray-50 hover:shadow-md dark:border-gray-700/50 dark:bg-gray-900/80 dark:hover:bg-gray-800"
                aria-label={`Switch to ${isDarkMode ? "light" : "dark"} mode`}
                title={`Switch to ${isDarkMode ? "light" : "dark"} mode`}
              >
                {isDarkMode ? (
                  <Sun className="h-4 w-4" />
                ) : (
                  <Moon className="h-4 w-4" />
                )}
              </Button>
              
              <Link href="/time-zone-planner">
                <Button variant="outline" className="gap-2">
                  <ExternalLink className="h-4 w-4" />
                  Create Your Own
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-8">
        {/* Participants Summary */}
        <Card className="mb-8 bg-white/80 backdrop-blur-sm border-gray-200/50 shadow-lg dark:bg-gray-900/80 dark:border-gray-700/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Meeting Participants ({plannerState.participants.length})
            </CardTitle>
            <CardDescription>
              Duration: {plannerState.meetingDurationMinutes} minutes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 md:grid-cols-2">
              {plannerState.participants.map((participant, index) => (
                <div
                  key={participant.id}
                  className="flex items-center gap-3 p-3 rounded-lg border border-gray-200/50 bg-white/50 backdrop-blur-sm dark:bg-gray-800/50 dark:border-gray-700/50"
                >
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: participant.color || getParticipantColor(index) }}
                  />
                  <div className="flex-1">
                    <div className="font-medium text-gray-900 dark:text-white">
                      {participant.name}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {cities.find(c => c.value === participant.timeZone)?.city || participant.timeZone.replace(/_/g, ' ')}
                      {cities.find(c => c.value === participant.timeZone)?.country && (
                        <span className="text-xs"> • {cities.find(c => c.value === participant.timeZone)?.country}</span>
                      )}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-500">
                      {Math.floor(participant.workStartMinutes / 60)}:{(participant.workStartMinutes % 60).toString().padStart(2, '0')} - {Math.floor(participant.workEndMinutes / 60)}:{(participant.workEndMinutes % 60).toString().padStart(2, '0')} local time
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Suggested Times */}
        <Card className="bg-white/80 backdrop-blur-sm border-gray-200/50 shadow-lg dark:bg-gray-900/80 dark:border-gray-700/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarDays className="h-5 w-5" />
              Suggested Meeting Times
            </CardTitle>
            <CardDescription>
              {timeSlots.length > 0
                ? `${timeSlots.length} available time slot${timeSlots.length > 1 ? 's' : ''} found`
                : 'No overlapping time slots found for the selected participants and date.'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {timeSlots.length === 0 ? (
              <div className="text-center py-12">
                <Clock className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  No Available Times
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Try adjusting working hours or selecting a different date.
                </p>
                <Link href="/time-zone-planner">
                  <Button>Customize This Planner</Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {timeSlots.map((slot, index) => (
                  <div
                    key={index}
                    className="border border-gray-200/50 rounded-xl p-6 hover:shadow-xl transition-all bg-white/50 backdrop-blur-sm dark:bg-gray-800/50 dark:border-gray-700/50"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <Badge variant="secondary" className="text-base px-3 py-1">
                          {formatTimeSlot(slot, plannerState.use24h)}
                        </Badge>
                        {slot.conflicts.length > 0 && (
                          <Badge variant="destructive">
                            {slot.conflicts.length} conflict{slot.conflicts.length > 1 ? 's' : ''}
                          </Badge>
                        )}
                      </div>
                      <Button
                        onClick={() => addToCalendar(slot)}
                        className="gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white border-0 shadow-lg hover:shadow-xl transition-all"
                      >
                        <CalendarDays className="h-4 w-4" />
                        Add to Calendar
                      </Button>
                    </div>

                    <div className="grid gap-3">
                      {plannerState.participants.map(participant => (
                        <div
                          key={participant.id}
                          className="flex items-center justify-between py-2 px-3 rounded-lg bg-gray-50/80 dark:bg-gray-700/50"
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: participant.color || getParticipantColor(plannerState.participants.indexOf(participant)) }}
                            />
                            <span className="font-medium">{participant.name}</span>
                            <span className="text-sm text-gray-500">
                              ({cities.find(c => c.value === participant.timeZone)?.city || participant.timeZone.split('/').pop()?.replace('_', ' ')})
                            </span>
                          </div>
                          <span className={`font-mono text-sm ${slot.conflicts.includes(participant.id) ? 'text-red-600' : 'text-gray-700 dark:text-gray-300'}`}>
                            {slot.localTimes[participant.id]?.formatted || 'N/A'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="mt-12 text-center">
          <div className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            Time zone calculations are performed locally in your browser.
            No personal data is stored or transmitted.
          </div>
          <Link href="/time-zone-planner">
            <Button variant="outline">Create Your Own Meeting Planner</Button>
          </Link>
        </div>
      </main>
    </div>
  )
}

export default function TimeZonePlannerView() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-cyan-50 dark:from-gray-950 dark:via-gray-900 dark:to-cyan-950 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading shared planner...</p>
        </div>
      </div>
    }>
      <TimeZonePlannerViewContent />
    </Suspense>
  )
}
