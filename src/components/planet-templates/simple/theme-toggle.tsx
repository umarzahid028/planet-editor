import { Button } from "@/components/planet-ui-primitive/button"

// --- Icons ---
import { MoonStarIcon } from "@/components/planet-icons/moon-star-icon"
import { SunIcon } from "@/components/planet-icons/sun-icon"
import { useEffect, useState } from "react"

const THEME_STORAGE_KEY = "planet-editor-theme"

function readStoredTheme(): "dark" | "light" | null {
  try {
    const value = localStorage.getItem(THEME_STORAGE_KEY)
    return value === "dark" || value === "light" ? value : null
  } catch {
    return null
  }
}

export function ThemeToggle() {
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false)

  // Initialise from the saved choice, falling back to the meta tag / system.
  useEffect(() => {
    const stored = readStoredTheme()
    if (stored) {
      setIsDarkMode(stored === "dark")
      return
    }
    const initialDarkMode =
      !!document.querySelector('meta[name="color-scheme"][content="dark"]') ||
      window.matchMedia("(prefers-color-scheme: dark)").matches
    setIsDarkMode(initialDarkMode)
  }, [])

  // Follow the system theme only while the user hasn't picked one explicitly.
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)")
    const handleChange = () => {
      if (!readStoredTheme()) setIsDarkMode(mediaQuery.matches)
    }
    mediaQuery.addEventListener("change", handleChange)
    return () => mediaQuery.removeEventListener("change", handleChange)
  }, [])

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDarkMode)
  }, [isDarkMode])

  const toggleDarkMode = () =>
    setIsDarkMode((isDark) => {
      const next = !isDark
      try {
        localStorage.setItem(THEME_STORAGE_KEY, next ? "dark" : "light")
      } catch {
        // ignore storage errors (private mode, disabled, etc.)
      }
      return next
    })

  return (
    <Button
      onClick={toggleDarkMode}
      aria-label={`Switch to ${isDarkMode ? "light" : "dark"} mode`}
      variant="ghost"
    >
      {isDarkMode ? (
        <MoonStarIcon className="planet-button-icon" />
      ) : (
        <SunIcon className="planet-button-icon" />
      )}
    </Button>
  )
}
