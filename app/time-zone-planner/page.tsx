"use client"

import { useState, useEffect, useMemo, useCallback, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Calendar from "@/components/ui/calendar"
import NBButton from "@/components/nb/button"
import { NBCard, NBCardContent, NBCardHeader, NBCardTitle } from "@/components/nb/card"
import CitySelectNB from "@/components/nb/city-select-nb"
import { useToast } from "@/hooks/use-toast"
import { CalendarDays, Clock, Users, Share2, Plus, X, AlertCircle, CheckCircle, Sun, Moon } from "lucide-react"
import {
  Participant,
  PlannerState,
  TimeSlot,
  getCurrentTimeZone,
  getMajorCities,
  getCurrentCity,
  generateTimeSlots,
  formatTimeSlot,
  getParticipantColor,
  encodePlannerState,
  decodePlannerState
} from "@/lib/time-zone-utils"

/**
 * Time Zone Meeting Planner - Main tool page
 * Refactored for better reliability and user experience
 */
function TimeZonePlannerContent() {
  const searchParams = useSearchParams()
  const { toast } = useToast()

  // Core state management
  const [state, setState] = useState<PlannerState>({
    participants: [],
    meetingDurationMinutes: 60,
    dateISO: new Date().toISOString().split('T')[0],
    showWeekends: true,
    use24h: false,
    fairnessMode: "balanced"
  })

  const [isLoading, setIsLoading] = useState(true)
  const [hasInitialized, setHasInitialized] = useState(false)
  const [isDarkMode, setIsDarkMode] = useState(false)

  // Available cities for selector
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

  // Load state from URL parameters
  useEffect(() => {
    const encoded = searchParams.get('p')
    if (encoded) {
      try {
        const decoded = decodePlannerState(encoded)
        if (decoded) {
          setState(decoded)
          setHasInitialized(true)
          toast({
            title: "Planner loaded",
            description: "Meeting planner loaded from shared link.",
          })
        } else {
          throw new Error("Invalid planner data")
        }
      } catch {
        toast({
          title: "Invalid link",
          description: "Could not load planner from this link. Starting fresh.",
          variant: "destructive"
        })
      }
    }
    setIsLoading(false)
  }, [searchParams, toast])

  // Initialize default participant if none exist and not loaded from URL
  useEffect(() => {
    if (!isLoading && !hasInitialized && state.participants.length === 0) {
      const currentTz = getCurrentTimeZone()
      const currentCity = getCurrentCity()
      setState(prev => ({
        ...prev,
        participants: [{
          id: 'user-default',
          name: currentCity ? `You (${currentCity.city})` : 'You',
          timeZone: currentTz,
          workStartMinutes: 9 * 60, // 9 AM
          workEndMinutes: 17 * 60, // 5 PM
          color: getParticipantColor(0)
        }]
      }))
      setHasInitialized(true)
    }
  }, [isLoading, hasInitialized, state.participants.length])

  // Generate time slots with memoization
  const timeSlots = useMemo(() => {
    if (state.participants.length === 0) return []
    try {
      return generateTimeSlots(state, 20)
    } catch (error) {
      console.error('Error generating time slots:', error)
      return []
    }
  }, [state])

  const [selectedSlot, setSelectedSlot] = useState<number | null>(null)

  // Meeting settings handlers
  const handleDateChange = useCallback((date: string) => {
    if (!date) return
    setState(prev => ({ ...prev, dateISO: date }))
  }, [])

  const handleDurationChange = useCallback((duration: string) => {
    const minutes = parseInt(duration)
    if (isNaN(minutes) || minutes <= 0) return
    setState(prev => ({ ...prev, meetingDurationMinutes: minutes }))
  }, [])

  const handleTimeFormatToggle = useCallback((use24h: boolean) => {
    setState(prev => ({ ...prev, use24h }))
  }, [])

  // Participant management
  const addParticipant = useCallback(() => {
    const defaultCity = cities[0] // Use first city as default
    const newParticipant: Participant = {
      id: `participant_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: `Person ${state.participants.length + 1}`,
      timeZone: defaultCity?.value || getCurrentTimeZone(),
      workStartMinutes: 9 * 60,
      workEndMinutes: 17 * 60,
      color: getParticipantColor(state.participants.length)
    }
    
    setState(prev => ({
      ...prev,
      participants: [...prev.participants, newParticipant]
    }))

    toast({
      title: "Participant added",
      description: `Added ${newParticipant.name} to the meeting planner.`,
    })
  }, [state.participants.length, cities, toast])

  const removeParticipant = useCallback((id: string) => {
    setState(prev => ({
      ...prev,
      participants: prev.participants.filter(p => p.id !== id)
    }))

    toast({
      title: "Participant removed",
      description: "Participant has been removed from the planner.",
    })
  }, [toast])

  const updateParticipant = useCallback((id: string, updates: Partial<Participant>) => {
    setState(prev => ({
      ...prev,
      participants: prev.participants.map(p =>
        p.id === id ? { ...p, ...updates } : p
      )
    }))
  }, [])

  const updateParticipantName = useCallback((id: string, name: string) => {
    if (name.trim().length === 0) return
    updateParticipant(id, { name: name.trim() })
  }, [updateParticipant])

  const updateParticipantTimeZone = useCallback((id: string, timeZone: string) => {
    updateParticipant(id, { timeZone })
  }, [updateParticipant])

  const updateParticipantWorkHours = useCallback((id: string, type: 'start' | 'end', timeString: string) => {
    if (!timeString) return
    
    const [hours, minutes] = timeString.split(':').map(Number)
    if (isNaN(hours) || isNaN(minutes)) return
    
    const totalMinutes = hours * 60 + minutes
    
    if (type === 'start') {
      updateParticipant(id, { workStartMinutes: totalMinutes })
    } else {
      updateParticipant(id, { workEndMinutes: totalMinutes })
    }
  }, [updateParticipant])

  // v2-style time selects helpers
  const updateParticipantStart = useCallback((id: string, minutes: number) => {
    setState(prev => ({
      ...prev,
      participants: prev.participants.map((p) => (p.id === id ? { ...p, workStartMinutes: minutes } : p)),
    }))
  }, [])

  const updateParticipantEnd = useCallback((id: string, minutes: number) => {
    setState(prev => ({
      ...prev,
      participants: prev.participants.map((p) => (p.id === id ? { ...p, workEndMinutes: minutes } : p)),
    }))
  }, [])

  // Sharing functionality
  const sharePlanner = useCallback(async () => {
    try {
      const encoded = encodePlannerState(state)
      const url = `${window.location.origin}${window.location.pathname}?p=${encoded}`

      await navigator.clipboard.writeText(url)
      toast({
        title: "Link copied!",
        description: "Share this link with others to view the planner.",
      })
    } catch {
      // Fallback for browsers that don't support clipboard API
      const encoded = encodePlannerState(state)
      const url = `${window.location.origin}${window.location.pathname}?p=${encoded}`
      
      toast({
        title: "Copy this link",
        description: url,
        variant: "default"
      })
    }
  }, [state, toast])

  // Calendar integration
  const addToCalendar = useCallback((slot: TimeSlot) => {
    const title = `Meeting with ${state.participants.length} participant${state.participants.length > 1 ? 's' : ''}`
    const details = state.participants.map(p => 
      `${p.name}: ${slot.localTimes[p.id]?.formatted || 'Time not available'}`
    ).join('\n')

    const startTime = slot.startUTC.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')
    const endTime = slot.endUTC.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')
    
    const googleUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(title)}&dates=${startTime}/${endTime}&details=${encodeURIComponent(details)}`

    window.open(googleUrl, '_blank')
    toast({
      title: "Opening Google Calendar",
      description: "Meeting details will be pre-filled for you.",
    })
  }, [state.participants, toast])

  // Format time for display
  const formatWorkTime = useCallback((minutes: number): string => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`
  }, [])

  const timeOptions = useMemo(() => {
    const opts: { label: string; value: number }[] = []
    for (let m = 0; m < 24 * 60; m += 30) {
      opts.push({ label: formatMinutesLabel(m), value: m })
    }
    return opts
  }, [])

  function formatMinutesLabel(total: number): string {
    const h24 = Math.floor(total / 60)
    const min = total % 60
    const ampm = h24 >= 12 ? "PM" : "AM"
    const h12 = ((h24 + 11) % 12) + 1
    return `${h12}:${min.toString().padStart(2, '0')} ${ampm}`
  }

  const durationOptions = [15, 30, 45, 60, 90, 120]

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 dark:from-gray-950 dark:via-gray-900 dark:to-blue-950">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Loading planner...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 dark:from-gray-950 dark:via-gray-900 dark:to-blue-950">
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
                  Time Zone Meeting Planner
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Find the perfect meeting time across multiple time zones
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
              
              <Button 
                onClick={sharePlanner} 
                variant="outline" 
                className="gap-2 hover:bg-blue-50 dark:hover:bg-blue-950"
                disabled={state.participants.length === 0}
              >
                <Share2 className="h-4 w-4" />
                Share Planner
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8">
        <div className="grid gap-8 lg:grid-cols-3">
          <NBCard className="lg:col-span-1">
            <NBCardHeader>
              <NBCardTitle>Select date</NBCardTitle>
            </NBCardHeader>
            <NBCardContent>
              <Calendar
                mode="single"
                selected={new Date(state.dateISO + "T00:00:00Z")}
                onSelect={(d) => d && handleDateChange(d.toISOString().slice(0, 10))}
              />
            </NBCardContent>
          </NBCard>

          <NBCard className="lg:col-span-2">
            <NBCardHeader className="flex items-center justify-between">
              <NBCardTitle>Participants</NBCardTitle>
              <div className="flex items-center gap-3">
                <label className="text-sm opacity-70">Duration</label>
                <select
                  value={state.meetingDurationMinutes}
                  onChange={(e) => handleDurationChange(e.target.value)}
                  className="h-10 px-2 rounded-lg border-2 border-gray-900 bg-white dark:bg-gray-900 dark:border-white"
                >
                  {durationOptions.map((m) => (
                    <option key={m} value={m}>{m} min</option>
                  ))}
                </select>
                <NBButton onClick={addParticipant} size="sm">Add participant</NBButton>
              </div>
            </NBCardHeader>
            <NBCardContent className="space-y-4">
              {state.participants.map((participant) => (
                <div key={participant.id} className="flex flex-wrap items-center gap-3">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: participant.color }} />
                  <Input
                    value={participant.name}
                    onChange={(e) => updateParticipantName(participant.id, e.target.value)}
                    className="h-10 px-3 w-40"
                    placeholder="Name"
                    maxLength={50}
                  />
                  <CitySelectNB
                    value={participant.timeZone}
                    cities={cities}
                    onValueChange={(v) => updateParticipantTimeZone(participant.id, v)}
                    className="h-10"
                  />
                  <div className="flex items-center gap-2">
                    <label className="text-sm opacity-70">Work from</label>
                    <select
                      value={participant.workStartMinutes}
                      onChange={(e) => updateParticipantStart(participant.id, Number(e.target.value))}
                      className="h-10 px-2 rounded-lg border-2 border-gray-900 bg-white dark:bg-gray-900 dark:border-white"
                    >
                      {timeOptions.map((o) => (
                        <option key={o.value} value={o.value}>{o.label}</option>
                      ))}
                    </select>
                    <label className="text-sm opacity-70">to</label>
                    <select
                      value={participant.workEndMinutes}
                      onChange={(e) => updateParticipantEnd(participant.id, Number(e.target.value))}
                      className="h-10 px-2 rounded-lg border-2 border-gray-900 bg-white dark:bg-gray-900 dark:border-white"
                    >
                      {timeOptions.map((o) => (
                        <option key={o.value} value={o.value}>{o.label}</option>
                      ))}
                    </select>
                  </div>
                  {state.participants.length > 1 && (
                    <NBButton variant="ghost" size="sm" onClick={() => removeParticipant(participant.id)}>
                      Remove
                    </NBButton>
                  )}
                </div>
              ))}
            </NBCardContent>
          </NBCard>

          <NBCard className="lg:col-span-3">
            <NBCardHeader>
              <NBCardTitle>Suggested times</NBCardTitle>
            </NBCardHeader>
            {selectedSlot !== null && timeSlots[selectedSlot] && (
              <div className="mx-4 mb-3 rounded-lg border-2 border-gray-900 p-3 bg-white dark:bg-gray-900">
                <div className="font-semibold mb-2">Selected: {formatTimeSlot(timeSlots[selectedSlot], state.use24h)}</div>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
                  {state.participants.map((p) => (
                    <div key={p.id} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <span className="inline-block h-2 w-2 rounded-full" style={{ background: p.color }} />
                        <span>{p.name}</span>
                      </div>
                      <span className="font-mono text-xs opacity-80">{timeSlots[selectedSlot].localTimes[p.id]?.formatted || 'N/A'}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <NBCardContent className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
              {timeSlots.slice(0, 18).map((slot, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedSlot(i)}
                  className={`text-left rounded-lg border p-3 bg-white/70 dark:bg-gray-900/60 hover:bg-gray-100 dark:hover:bg-gray-800 ${selectedSlot === i ? 'ring-2 ring-gray-900 dark:ring-white' : ''}`}
                >
                  <div className="font-medium">{formatTimeSlot(slot, state.use24h)}</div>
                  <div className="mt-1 space-y-1">
                    {state.participants.map((p) => (
                      <div key={p.id} className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <span className="inline-block h-2 w-2 rounded-full" style={{ background: p.color }} />
                          <span>{p.name}</span>
                        </div>
                        <span className="font-mono text-xs opacity-80">{slot.localTimes[p.id]?.formatted || 'N/A'}</span>
                      </div>
                    ))}
                  </div>
                </button>
              ))}
            </NBCardContent>
          </NBCard>
        </div>
      </main>
    </div>
  )
}