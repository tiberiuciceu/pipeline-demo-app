import { describe, it, expect } from 'vitest'
import { formatCurrency, formatDate, truncate, formatRelativeTime } from '../formatters'

describe('formatCurrency', () => {
  it('formats USD by default', () => {
    expect(formatCurrency(1234.56)).toBe('$1,234.56')
  })

  it('formats other currencies', () => {
    expect(formatCurrency(100, 'EUR')).toContain('100')
  })
})

describe('formatDate', () => {
  it('formats a Date object', () => {
    expect(formatDate(new Date('2024-01-15'))).toContain('2024')
  })

  it('accepts a date string', () => {
    expect(formatDate('2024-06-01')).toContain('June')
  })
})

describe('truncate', () => {
  it('returns the string unchanged when short enough', () => {
    expect(truncate('hello', 10)).toBe('hello')
  })

  it('truncates and appends ellipsis', () => {
    const result = truncate('hello world', 5)
    expect(result).toMatch(/…$/)
    expect(result.length).toBeLessThanOrEqual(6)
  })
})

describe('formatRelativeTime', () => {
  const secondsAgo = (s: number) => new Date(Date.now() - s * 1000)
  const minutesAgo = (m: number) => new Date(Date.now() - m * 60 * 1000)
  const hoursAgo = (h: number) => new Date(Date.now() - h * 60 * 60 * 1000)
  const daysAgo = (d: number) => new Date(Date.now() - d * 24 * 60 * 60 * 1000)

  // AC1: A timestamp within the last 60 seconds returns "just now"
  describe('within the last 60 seconds', () => {
    it('returns "just now" for 0 seconds ago', () => {
      expect(formatRelativeTime(secondsAgo(0))).toBe('just now')
    })

    it('returns "just now" for 30 seconds ago', () => {
      expect(formatRelativeTime(secondsAgo(30))).toBe('just now')
    })

    it('returns "just now" for 59 seconds ago', () => {
      expect(formatRelativeTime(secondsAgo(59))).toBe('just now')
    })
  })

  // AC2: A timestamp 1–59 minutes ago returns "X minute ago" or "X minutes ago" with correct pluralisation
  describe('1–59 minutes ago', () => {
    it('returns "1 minute ago" (singular) for exactly 1 minute ago', () => {
      expect(formatRelativeTime(minutesAgo(1))).toBe('1 minute ago')
    })

    it('returns "2 minutes ago" (plural) for 2 minutes ago', () => {
      expect(formatRelativeTime(minutesAgo(2))).toBe('2 minutes ago')
    })

    it('returns "3 minutes ago" for 3 minutes ago', () => {
      expect(formatRelativeTime(minutesAgo(3))).toBe('3 minutes ago')
    })

    it('returns "59 minutes ago" for 59 minutes ago', () => {
      expect(formatRelativeTime(minutesAgo(59))).toBe('59 minutes ago')
    })
  })

  // AC3: A timestamp 1–23 hours ago returns "X hour ago" or "X hours ago" with correct pluralisation
  describe('1–23 hours ago', () => {
    it('returns "1 hour ago" (singular) for exactly 1 hour ago', () => {
      expect(formatRelativeTime(hoursAgo(1))).toBe('1 hour ago')
    })

    it('returns "2 hours ago" (plural) for 2 hours ago', () => {
      expect(formatRelativeTime(hoursAgo(2))).toBe('2 hours ago')
    })

    it('returns "5 hours ago" for 5 hours ago', () => {
      expect(formatRelativeTime(hoursAgo(5))).toBe('5 hours ago')
    })

    it('returns "23 hours ago" for 23 hours ago', () => {
      expect(formatRelativeTime(hoursAgo(23))).toBe('23 hours ago')
    })
  })

  // AC4: A timestamp of 1–6 days ago returns "yesterday" for exactly 1 day, or "X days ago" for 2–6 days
  describe('1–6 days ago', () => {
    it('returns "yesterday" for exactly 1 day ago', () => {
      expect(formatRelativeTime(daysAgo(1))).toBe('yesterday')
    })

    it('returns "2 days ago" for 2 days ago', () => {
      expect(formatRelativeTime(daysAgo(2))).toBe('2 days ago')
    })

    it('returns "3 days ago" for 3 days ago', () => {
      expect(formatRelativeTime(daysAgo(3))).toBe('3 days ago')
    })

    it('returns "6 days ago" for 6 days ago', () => {
      expect(formatRelativeTime(daysAgo(6))).toBe('6 days ago')
    })
  })

  // AC5: A timestamp 7 or more days ago returns the full formatted date using the existing formatDate function
  describe('7 or more days ago', () => {
    it('returns a formatted date string for exactly 7 days ago', () => {
      const date = daysAgo(7)
      const result = formatRelativeTime(date)
      // Should match the output of formatDate (e.g. "January 1, 2024")
      expect(result).toBe(formatDate(date))
    })

    it('does not return a relative string for 7 days ago', () => {
      const result = formatRelativeTime(daysAgo(7))
      expect(result).not.toMatch(/ago$/)
      expect(result).not.toBe('just now')
      expect(result).not.toBe('yesterday')
    })

    it('returns a formatted date string for 30 days ago', () => {
      const date = daysAgo(30)
      const result = formatRelativeTime(date)
      expect(result).toBe(formatDate(date))
    })

    it('returns a formatted date string containing the year for 365 days ago', () => {
      const date = daysAgo(365)
      const result = formatRelativeTime(date)
      expect(result).toContain(date.getFullYear().toString())
    })
  })

  // AC6: The function accepts both a Date object and an ISO date string
  describe('accepts both Date object and ISO date string', () => {
    it('returns "just now" when passed a Date object for 0 seconds ago', () => {
      expect(formatRelativeTime(secondsAgo(0))).toBe('just now')
    })

    it('returns "just now" when passed an ISO date string for 0 seconds ago', () => {
      expect(formatRelativeTime(secondsAgo(0).toISOString())).toBe('just now')
    })

    it('returns same result for Date object and equivalent ISO string', () => {
      const date = minutesAgo(5)
      const isoString = date.toISOString()
      expect(formatRelativeTime(date)).toBe(formatRelativeTime(isoString))
    })

    it('returns same result for hoursAgo Date object and equivalent ISO string', () => {
      const date = hoursAgo(3)
      const isoString = date.toISOString()
      expect(formatRelativeTime(date)).toBe(formatRelativeTime(isoString))
    })
  })
})
