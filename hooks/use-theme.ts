/**
 * Theme toggle hook
 * Provides theme state and toggle functionality with localStorage persistence
 */

"use client"

import { useState, useEffect } from "react"

export function useTheme() {
  const [isDarkMode, setIsDarkMode] = useState(false)

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
  const toggleTheme = () => {
    const newTheme = !isDarkMode
    setIsDarkMode(newTheme)
    localStorage.setItem("theme", newTheme ? "dark" : "light")

    if (newTheme) {
      document.documentElement.classList.add("dark")
    } else {
      document.documentElement.classList.remove("dark")
    }
  }

  return { isDarkMode, toggleTheme }
}
