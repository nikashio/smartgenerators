"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { CalendarDays, Clock, ExternalLink, Sun, Moon } from "lucide-react"
import {
  PlannerState,
  TimeSlot,
  generateTimeSlots,
  formatTimeSlot,
  getMajorCities,
  decodePlannerState
} from "@/lib/time-zone-utils"

/**
 * Embedded compact widget for time zone meeting planner
 * Shows a simplified view suitable for embedding
 */
export default function TimeZonePlannerEmbed() {
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const [plannerState, setPlannerState] = useState<PlannerState | null>(null)
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
      title: `${newTheme ? "Dark" : "Light"} mode`,
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
      }
    }
  }, [searchParams])

  // Generate time slots and show only top 5
  const timeSlots = useMemo(() => {
    return plannerState ? generateTimeSlots(plannerState, 5) : []
  }, [plannerState])

  const addToCalendar = (slot: TimeSlot) => {
    if (!plannerState) return

    const title = `Meeting (${plannerState.participants.length} people)`
    const details = plannerState.participants.map(p =>
      `${p.name}: ${slot.localTimes[p.id]?.formatted || 'N/A'}`
    ).join('\n')

    const googleUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(title)}&dates=${slot.startUTC.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')}/${slot.endUTC.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')}&details=${encodeURIComponent(details)}`

    window.open(googleUrl, '_blank')
    toast({
      title: "Added to calendar",
      description: "Meeting added successfully.",
    })
  }

  const openFullPlanner = () => {
    const encoded = searchParams.get('p')
    if (encoded) {
      window.open(`/time-zone-planner/view?p=${encoded}`, '_blank')
    }
  }

  if (!plannerState) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-950 dark:to-blue-950 p-4">
        <div className="max-w-md mx-auto text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p className="text-sm text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-950 dark:to-blue-950 p-4">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="bg-white/80 backdrop-blur-sm border border-gray-200/50 dark:bg-gray-900/80 dark:border-gray-700/50 rounded-xl shadow-lg p-4 mb-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 text-white">
                <Clock className="h-4 w-4" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-gray-900 dark:text-white">
                  Meeting Times
                </h2>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  {new Date(plannerState.dateISO).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric'
                  })}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <Button
                onClick={toggleTheme}
                size="sm"
                variant="ghost"
                className="h-8 w-8 p-0"
                aria-label={`Switch to ${isDarkMode ? "light" : "dark"} mode`}
                title={`Switch to ${isDarkMode ? "light" : "dark"} mode`}
              >
                {isDarkMode ? (
                  <Sun className="h-3 w-3" />
                ) : (
                  <Moon className="h-3 w-3" />
                )}
              </Button>
              
              <Button
                onClick={openFullPlanner}
                size="sm"
                variant="ghost"
                className="h-8 w-8 p-0"
              >
                <ExternalLink className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Participants summary */}
          <div className="text-xs text-gray-600 dark:text-gray-400 mb-3">
            {plannerState.participants.map((p, i) => (
              <span key={p.id}>
                {i > 0 && ', '}
                {cities.find(c => c.value === p.timeZone)?.city || p.timeZone.split('/').pop()?.replace('_', ' ')}
              </span>
            ))} • {plannerState.meetingDurationMinutes} min
          </div>

          {/* Participants list */}
          <div className="space-y-1 mb-4">
            {plannerState.participants.slice(0, 3).map((participant) => (
              <div key={participant.id} className="flex items-center gap-2">
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: participant.color }}
                />
                <span className="text-xs font-medium truncate">{participant.name}</span>
                <span className="text-xs text-gray-500 truncate">
                  {cities.find(c => c.value === participant.timeZone)?.city || participant.timeZone.split('/').pop()?.replace('_', ' ')}
                </span>
              </div>
            ))}
            {plannerState.participants.length > 3 && (
              <div className="text-xs text-gray-500">
                +{plannerState.participants.length - 3} more
              </div>
            )}
          </div>
        </div>

        {/* Time slots */}
        {timeSlots.length === 0 ? (
          <div className="bg-white/80 backdrop-blur-sm border border-gray-200/50 dark:bg-gray-900/80 dark:border-gray-700/50 rounded-xl shadow-lg p-6 text-center">
            <Clock className="h-12 w-12 mx-auto mb-3 text-gray-400" />
            <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-1">
              No Available Times
            </h3>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              Try adjusting working hours
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {timeSlots.map((slot, index) => (
              <div
                key={index}
                className="bg-white/80 backdrop-blur-sm border border-gray-200/50 dark:bg-gray-900/80 dark:border-gray-700/50 rounded-xl shadow-lg p-4 hover:shadow-xl transition-all"
              >
                <div className="flex items-center justify-between mb-3">
                  <Badge variant="secondary" className="text-xs px-2 py-1">
                    {formatTimeSlot(slot, plannerState.use24h)}
                  </Badge>
                  <Button
                    onClick={() => addToCalendar(slot)}
                    size="sm"
                    className="h-7 text-xs px-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white border-0 shadow-md hover:shadow-lg transition-all"
                  >
                    <CalendarDays className="h-3 w-3 mr-1" />
                    Add
                  </Button>
                </div>

                <div className="space-y-1">
                  {plannerState.participants.map(participant => (
                    <div
                      key={participant.id}
                      className="flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className="w-1.5 h-1.5 rounded-full"
                          style={{ backgroundColor: participant.color }}
                        />
                        <span className="font-medium truncate max-w-[60px]">
                          {participant.name}
                        </span>
                      </div>
                      <span className={`font-mono ${slot.conflicts.includes(participant.id) ? 'text-red-600' : 'text-gray-700 dark:text-gray-300'}`}>
                        {slot.localTimes[participant.id]?.formatted || 'N/A'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="mt-4 text-center">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Powered by Smart Generators
          </p>
        </div>
      </div>
    </div>
  )
}
