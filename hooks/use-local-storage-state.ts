"use client"

import * as React from "react"

export function useLocalStorageState<T>(
  key: string,
  initialValue: T
): [T, React.Dispatch<React.SetStateAction<T>>] {
  const [value, setValue] = React.useState<T>(initialValue)
  const [isHydrated, setIsHydrated] = React.useState(false)

  React.useEffect(() => {
    try {
      const stored = localStorage.getItem(key)
      if (stored !== null) {
        setValue(JSON.parse(stored) as T)
      }
    } catch {
      // ignore corrupt data
    }
    setIsHydrated(true)
  }, [key])

  React.useEffect(() => {
    if (!isHydrated) return
    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch {
      // ignore quota errors
    }
  }, [key, value, isHydrated])

  return [value, setValue]
}
