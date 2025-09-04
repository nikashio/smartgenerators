/**
 * Site header component with theme toggle
 * Reusable header for all pages with navigation and theme switching
 */

"use client"

import Link from "next/link"
import { useTheme } from "@/hooks/use-theme"

interface SiteHeaderProps {
  showBackLink?: boolean
  backHref?: string
  backText?: string
}

export function SiteHeader({ 
  showBackLink = false, 
  backHref = "/", 
  backText = "← Home" 
}: SiteHeaderProps) {
  const { isDarkMode, toggleTheme } = useTheme()

  return (
    <header className="relative">
      <div className="mx-auto max-w-7xl px-4 py-6">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white">
              <span className="text-lg font-bold">SG</span>
            </div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">
              Smart Generators
            </h1>
          </Link>

          <nav className="flex items-center gap-6">
            {showBackLink && (
              <Link 
                href={backHref}
                className="text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
              >
                {backText}
              </Link>
            )}
            <button
              onClick={toggleTheme}
              className="h-10 w-10 rounded-full border border-gray-200/50 bg-white/80 text-sm backdrop-blur-sm transition-all hover:bg-gray-50 hover:shadow-md dark:border-gray-700/50 dark:bg-gray-900/80 dark:hover:bg-gray-800"
              aria-label={`Switch to ${isDarkMode ? "light" : "dark"} mode`}
              title={`Switch to ${isDarkMode ? "light" : "dark"} mode`}
            >
              <span className="sr-only">{isDarkMode ? "Switch to light mode" : "Switch to dark mode"}</span>
              <span role="img" aria-hidden="true">{isDarkMode ? "🌙" : "☀️"}</span>
            </button>
          </nav>
        </div>
      </div>
    </header>
  )
}
