"use client"

import * as React from "react"
import { CityOption, getCurrentCity } from "@/lib/time-zone-utils"
import { cn } from "@/lib/utils"
import { Search, ChevronDown } from "lucide-react"

interface Props {
  value?: string
  onValueChange?: (value: string) => void
  cities: CityOption[]
  className?: string
}

export default function CitySelectNB({ value, onValueChange, cities, className }: Props) {
  const [open, setOpen] = React.useState(false)
  const [query, setQuery] = React.useState("")
  const triggerRef = React.useRef<HTMLButtonElement>(null)

  const selected = cities.find(c => c.value === value)

  const suggested = React.useMemo(() => {
    const current = getCurrentCity()
    const ids = [current?.value, "Europe/London", "America/New_York", "Asia/Tokyo", "Asia/Tbilisi", "Australia/Sydney"].filter(Boolean) as string[]
    const map: Record<string, CityOption> = {}
    for (const c of cities) map[c.value] = c
    const seen = new Set<string>()
    return ids.map(id => map[id]).filter(Boolean).filter(c => (c && !seen.has(c.value) && seen.add(c.value))) as CityOption[]
  }, [cities])

  const filtered = React.useMemo(() => {
    if (!query) return cities
    const q = query.toLowerCase()
    return cities.filter(c => c.searchTerms.includes(q))
  }, [cities, query])

  return (
    <div className={cn("relative", className)}>
      <button
        ref={triggerRef}
        onClick={() => setOpen(v => !v)}
        className="h-10 px-3 rounded-lg border-2 border-gray-900 bg-white text-left w-full flex items-center justify-between shadow-[4px_4px_0_0_#111] dark:bg-gray-900 dark:border-white dark:shadow-[4px_4px_0_0_#fff]"
      >
        <span className="truncate">
          {selected ? selected.city : "Select city"}
        </span>
        <ChevronDown className="h-4 w-4 opacity-70" />
      </button>

      {open && (
        <div className="absolute z-50 mt-2 w-[320px] max-h-80 overflow-auto rounded-xl border-2 border-gray-900 bg-white p-2 shadow-[6px_6px_0_0_#111] dark:bg-gray-900 dark:border-white dark:shadow-[6px_6px_0_0_#fff]">
          <div className="sticky top-0 bg-inherit pb-2">
            <div className="flex items-center gap-2 rounded-lg border-2 border-gray-900 px-2 h-10 dark:border-white">
              <Search className="h-4 w-4 opacity-70" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search cities..."
                className="flex-1 bg-transparent outline-none text-sm"
              />
            </div>
          </div>

          {!query && suggested.length > 0 && (
            <div className="mb-2">
              <div className="text-xs font-bold mb-1">Suggested</div>
              {suggested.map((c) => (
                <Item key={"s-"+c.value} c={c} onPick={(v)=>{ onValueChange?.(v); setOpen(false) }} />
              ))}
              <div className="border-t my-2" />
            </div>
          )}

          {filtered.map((c) => (
            <Item key={c.value} c={c} onPick={(v)=>{ onValueChange?.(v); setOpen(false) }} />
          ))}
        </div>
      )}
    </div>
  )
}

function Item({ c, onPick }: { c: CityOption; onPick: (v: string)=>void }) {
  return (
    <button
      onClick={() => onPick(c.value)}
      className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
    >
      <div className="font-medium">{c.city}</div>
      <div className="text-xs opacity-70">{(c.country || c.region)} • {c.offset}</div>
    </button>
  )
}


