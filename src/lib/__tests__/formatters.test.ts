import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
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
  const FIXED_NOW = new Date('2024-06-15T12:00:00.000Z')

  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(FIXED_NOW)
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  const now = FIXED_NOW.getTime()

  // AC1: A timestamp within the last 60 seconds returns "just now"
  it('returns "just now" for 0 seconds ago', () => {
    expect(formatRelativeTime(new Date(now))).toBe('just now')
  })

  it('returns "just now" for a timestamp 30 seconds ago', () => {
    expect(formatRelativeTime(new Date(now - 30 * 1000))).toBe('just now')
  })

  it('returns "just now" for a timestamp 59 seconds ago', () => {
    expect(formatRelativeTime(new Date(now - 59 * 1000))).toBe('just now')
  })

  it('returns "just now" for a future timestamp', () => {
    expect(formatRelativeTime(new Date(now + 5 * 1000))).toBe('just now')
  })

  // AC2: A timestamp 1–59 minutes ago returns "X minute ago" or "X minutes ago" with correct pluralisation
  it('returns "1 minute ago" for exactly 1 minute ago', () => {
    expect(formatRelativeTime(new Date(now - 60 * 1000))).toBe('1 minute ago')
  })

  it('returns "5 minutes ago" for 5 minutes ago', () => {
    expect(formatRelativeTime(new Date(now - 5 * 60 * 1000))).toBe('5 minutes ago')
  })

  it('returns "59 minutes ago" for 59 minutes ago', () => {
    expect(formatRelativeTime(new Date(now - 59 * 60 * 1000))).toBe('59 minutes ago')
  })

  // AC3: A timestamp 1–23 hours ago returns "X hour ago" or "X hours ago" with correct pluralisation
  it('returns "1 hour ago" for exactly 1 hour ago', () => {
    expect(formatRelativeTime(new Date(now - 60 * 60 * 1000))).toBe('1 hour ago')
  })

  it('returns "3 hours ago" for 3 hours ago', () => {
    expect(formatRelativeTime(new Date(now - 3 * 60 * 60 * 1000))).toBe('3 hours ago')
  })

  it('returns "23 hours ago" for 23 hours ago', () => {
    expect(formatRelativeTime(new Date(now - 23 * 60 * 60 * 1000))).toBe('23 hours ago')
  })

  // AC4: A timestamp of 1–6 days ago returns "yesterday" for exactly 1 day, or "X days ago" for 2–6 days
  it('returns "yesterday" for exactly 1 day ago', () => {
    expect(formatRelativeTime(new Date(now - 24 * 60 * 60 * 1000))).toBe('yesterday')
  })

  it('returns "2 days ago" for 2 days ago', () => {
    expect(formatRelativeTime(new Date(now - 2 * 24 * 60 * 60 * 1000))).toBe('2 days ago')
  })

  it('returns "3 days ago" for 3 days ago', () => {
    expect(formatRelativeTime(new Date(now - 3 * 24 * 60 * 60 * 1000))).toBe('3 days ago')
  })

  it('returns "6 days ago" for 6 days ago', () => {
    expect(formatRelativeTime(new Date(now - 6 * 24 * 60 * 60 * 1000))).toBe('6 days ago')
  })

  // AC5: A timestamp 7 or more days ago returns the full formatted date using the existing formatDate function
  it('returns a formatted date for exactly 7 days ago', () => {
    const sevenDaysAgo = new Date(now - 7 * 24 * 60 * 60 * 1000)
    expect(formatRelativeTime(sevenDaysAgo)).toBe(formatDate(sevenDaysAgo))
  })

  it('returns a formatted date for 30 days ago', () => {
    const thirtyDaysAgo = new Date(now - 30 * 24 * 60 * 60 * 1000)
    expect(formatRelativeTime(thirtyDaysAgo)).toBe(formatDate(thirtyDaysAgo))
  })

  it('returns a formatted date for 365 days ago', () => {
    const oneYearAgo = new Date(now - 365 * 24 * 60 * 60 * 1000)
    expect(formatRelativeTime(oneYearAgo)).toBe(formatDate(oneYearAgo))
  })

  // AC6: The function accepts both a Date object and an ISO date string
  it('accepts a Date object', () => {
    expect(formatRelativeTime(new Date(now - 30 * 1000))).toBe('just now')
  })

  it('accepts an ISO date string', () => {
    const isoString = new Date(now - 30 * 1000).toISOString()
    expect(formatRelativeTime(isoString)).toBe('just now')
  })

  it('accepts an ISO date string for minutes range', () => {
    const isoString = new Date(now - 5 * 60 * 1000).toISOString()
    expect(formatRelativeTime(isoString)).toBe('5 minutes ago')
  })
})
