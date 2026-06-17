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

  // Acceptance criterion 1: within the last 60 seconds → "just now"
  it('returns "just now" for a timestamp 0 seconds ago', () => {
    expect(formatRelativeTime(new Date())).toBe('just now')
  })

  it('returns "just now" for a timestamp 30 seconds ago', () => {
    expect(formatRelativeTime(secondsAgo(30))).toBe('just now')
  })

  it('returns "just now" for a timestamp 59 seconds ago', () => {
    expect(formatRelativeTime(secondsAgo(59))).toBe('just now')
  })

  // Acceptance criterion 2: 1–59 minutes ago with correct pluralisation
  it('returns "1 minute ago" for exactly 1 minute ago', () => {
    expect(formatRelativeTime(minutesAgo(1))).toBe('1 minute ago')
  })

  it('returns "2 minutes ago" for 2 minutes ago', () => {
    expect(formatRelativeTime(minutesAgo(2))).toBe('2 minutes ago')
  })

  it('returns "30 minutes ago" for 30 minutes ago', () => {
    expect(formatRelativeTime(minutesAgo(30))).toBe('30 minutes ago')
  })

  it('returns "59 minutes ago" for 59 minutes ago', () => {
    expect(formatRelativeTime(minutesAgo(59))).toBe('59 minutes ago')
  })

  // Acceptance criterion 3: 1–23 hours ago with correct pluralisation
  it('returns "1 hour ago" for exactly 1 hour ago', () => {
    expect(formatRelativeTime(hoursAgo(1))).toBe('1 hour ago')
  })

  it('returns "2 hours ago" for 2 hours ago', () => {
    expect(formatRelativeTime(hoursAgo(2))).toBe('2 hours ago')
  })

  it('returns "23 hours ago" for 23 hours ago', () => {
    expect(formatRelativeTime(hoursAgo(23))).toBe('23 hours ago')
  })

  // Acceptance criterion 4: 1–6 days ago → "yesterday" or "X days ago"
  it('returns "yesterday" for exactly 1 day ago', () => {
    expect(formatRelativeTime(daysAgo(1))).toBe('yesterday')
  })

  it('returns "2 days ago" for 2 days ago', () => {
    expect(formatRelativeTime(daysAgo(2))).toBe('2 days ago')
  })

  it('returns "6 days ago" for 6 days ago', () => {
    expect(formatRelativeTime(daysAgo(6))).toBe('6 days ago')
  })

  // Acceptance criterion 5: 7 or more days ago → full formatted date via formatDate
  it('returns a full formatted date for exactly 7 days ago', () => {
    const date = daysAgo(7)
    expect(formatRelativeTime(date)).toBe(formatDate(date))
  })

  it('returns a full formatted date for 30 days ago', () => {
    const date = daysAgo(30)
    expect(formatRelativeTime(date)).toBe(formatDate(date))
  })

  it('returns a full formatted date for 365 days ago', () => {
    const date = daysAgo(365)
    expect(formatRelativeTime(date)).toBe(formatDate(date))
  })

  // Acceptance criterion 6: accepts both a Date object and an ISO date string
  it('accepts a Date object', () => {
    expect(formatRelativeTime(secondsAgo(5))).toBe('just now')
  })

  it('accepts an ISO date string', () => {
    const isoString = secondsAgo(5).toISOString()
    expect(formatRelativeTime(isoString)).toBe('just now')
  })

  it('produces the same result for a Date object and its ISO string equivalent', () => {
    const date = minutesAgo(10)
    const isoString = date.toISOString()
    expect(formatRelativeTime(date)).toBe(formatRelativeTime(isoString))
  })
})
