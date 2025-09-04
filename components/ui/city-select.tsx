"use client"

import * as React from "react"
import { Check, ChevronDown, Search } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { CityOption, getCurrentCity } from "@/lib/time-zone-utils"

interface CitySelectProps {
  value?: string
  onValueChange?: (value: string) => void
  cities: CityOption[]
  placeholder?: string
  className?: string
}

export function CitySelect({
  value,
  onValueChange,
  cities,
  placeholder = "Select city...",
  className
}: CitySelectProps) {
  const [open, setOpen] = React.useState(false)
  const [query, setQuery] = React.useState("")
  const selectedCity = cities.find(city => city.value === value)

  // Suggested cities: current + popular
  const suggested = React.useMemo(() => {
    const current = getCurrentCity()
    const popularIds = [
      "America/New_York",
      "Europe/London",
      "Asia/Tokyo",
      "Asia/Tbilisi",
      "Europe/Berlin",
      "Asia/Singapore",
      "Australia/Sydney",
    ]

    const byId: Record<string, CityOption> = {}
    for (const c of cities) byId[c.value] = c

    const ordered = [current?.value, ...popularIds]
      .filter(Boolean)
      .map((id) => byId[id as string])
      .filter(Boolean) as CityOption[]

    // Dedupe while preserving order
    const seen = new Set<string>()
    return ordered.filter((c) => (c && !seen.has(c.value) && seen.add(c.value)))
  }, [cities])

  // Alphabetical groups for easy scrolling when not searching
  const alphaGroups = React.useMemo(() => {
    const groups: Record<string, CityOption[]> = {}
    const sorted = [...cities].sort((a, b) => a.city.localeCompare(b.city))
    for (const c of sorted) {
      const letter = c.city.charAt(0).toUpperCase()
      if (!groups[letter]) groups[letter] = []
      groups[letter].push(c)
    }
    return groups
  }, [cities])

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("justify-between", className)}
        >
          {selectedCity ? (
            <div className="flex flex-col items-start">
              <span className="font-medium">{selectedCity.city}</span>
              <span className="text-xs text-gray-500">
                {selectedCity.country} • {selectedCity.offset}
              </span>
            </div>
          ) : (
            <span className="text-gray-500">{placeholder}</span>
          )}
          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[320px] p-0" align="start">
        <Command>
          <div className="flex items-center border-b px-3 sticky top-0 bg-popover z-10">
            <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
            <CommandInput 
              placeholder="Search cities..." 
              value={query}
              onValueChange={setQuery}
              className="flex h-10 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-gray-500 disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>
          <CommandList>
            <CommandEmpty>No cities found.</CommandEmpty>
            {/* Suggested group (shown only when not searching) */}
            {!query && suggested.length > 0 && (
              <CommandGroup heading="Suggested">
                {suggested.map((city) => (
                  <CommandItem
                    key={`s-${city.value}`}
                    value={city.searchTerms}
                    onSelect={() => {
                      onValueChange?.(city.value)
                      setOpen(false)
                    }}
                    className="cursor-pointer"
                  >
                    <div className="flex w-full items-center justify-between">
                      <span className="font-medium">{city.city}</span>
                      <span className="text-xs text-gray-500">
                        {(city.country || city.region) + " • " + city.offset}
                      </span>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}

            {/* When searching, render a flat filtered list for simplicity */}
            {query && (
              <CommandGroup>
                {cities.map((city) => (
                  <CommandItem
                    key={city.value}
                    value={city.searchTerms}
                    onSelect={() => {
                      onValueChange?.(city.value)
                      setOpen(false)
                    }}
                    className="cursor-pointer"
                  >
                    <div className="flex w-full items-center justify-between">
                      <span className="font-medium">{city.city}</span>
                      <span className="text-xs text-gray-500">
                        {(city.country || city.region) + " • " + city.offset}
                      </span>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}

            {/* Alphabetical groups for easy scroll when not searching */}
            {!query && (
              <>
                {Object.keys(alphaGroups).sort().map((letter) => (
                  <CommandGroup key={letter} heading={letter}>
                    {alphaGroups[letter].map((city) => (
                      <CommandItem
                        key={city.value}
                        value={city.searchTerms}
                        onSelect={() => {
                          onValueChange?.(city.value)
                          setOpen(false)
                        }}
                        className="cursor-pointer"
                      >
                        <div className="flex w-full items-center justify-between">
                          <span className="font-medium">{city.city}</span>
                          <span className="text-xs text-gray-500">
                            {(city.country || city.region) + " • " + city.offset}
                          </span>
                        </div>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                ))}
              </>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
