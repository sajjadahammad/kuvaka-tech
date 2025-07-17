import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatTimestamp(timestamp: string): string {
  const date = new Date(timestamp)
  const now = new Date()

  const isToday = date.toDateString() === now.toDateString()
  const isYesterday = new Date(now.setDate(now.getDate() - 1)).toDateString() === date.toDateString()

  if (isToday) {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  } else if (isYesterday) {
    return `Yesterday, ${date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    })}`
  } else {
    return date.toLocaleDateString([], {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }
}

export function debounce<T extends (...args: any[]) => void>(func: T, delay: number): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null

  return function (this: ThisParameterType<T>, ...args: Parameters<T>) {
    
    const later = () => {
      timeout = null
      func.apply(this, args)
    }
    if (timeout) {
      clearTimeout(timeout)
    }
    timeout = setTimeout(later, delay)
  }
}

export function throttle<T extends (...args: any[]) => void>(func: T, limit: number): (...args: Parameters<T>) => void {
  let inThrottle: boolean
  let lastResult: any
  let lastArgs: Parameters<T> | null
  let lastThis: ThisParameterType<T> | null

  return function (this: ThisParameterType<T>, ...args: Parameters<T>) {
    lastArgs = args
    lastThis = this
    if (!inThrottle) {
      inThrottle = true
      lastResult = func.apply(lastThis, lastArgs)
      setTimeout(() => {
        inThrottle = false
        if (lastArgs) {
          lastResult = func.apply(lastThis, lastArgs)
          lastArgs = null
          lastThis = null
        }
      }, limit)
    }
    return lastResult
  }
}
