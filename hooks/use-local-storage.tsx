"use client"

import { useCallback } from "react"

export function useLocalStorage() {
  const getItem = useCallback(<T = string>(key: string): T | null => {
    if (typeof window === "undefined") {
      return null
    }

    try {
      const item = window.localStorage.getItem(key)
      return item ? JSON.parse(item) : null
    } catch (error) {
      console.error(`Error getting item ${key} from localStorage:`, error)
      return null
    }
  }, [])

  const setItem = useCallback((key: string, value: unknown): void => {
    if (typeof window === "undefined") {
      return
    }

    try {
      window.localStorage.setItem(key, JSON.stringify(value))
    } catch (error) {
      console.error(`Error setting item ${key} in localStorage:`, error)
    }
  }, [])

  const removeItem = useCallback((key: string): void => {
    if (typeof window === "undefined") {
      return
    }

    try {
      window.localStorage.removeItem(key)
    } catch (error) {
      console.error(`Error removing item ${key} from localStorage:`, error)
    }
  }, [])

  return { getItem, setItem, removeItem }
}

