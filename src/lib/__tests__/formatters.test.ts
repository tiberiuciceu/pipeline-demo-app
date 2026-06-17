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
  const NOW = new Date('2024-06-15T12:00:00.000Z').getTime()

  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(NOW)
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  // AC1: within the last 60 seconds → "just now"
  it('returns "just now" for a timestamp 0 seconds ago', () => {
    expect(formatRelativeTime(new Date(NOW))).toBe('just now')
  })

  it('returns "just now" for a timestamp 30 seconds ago', () => {
    expect(formatRelativeTime(new Date(NOW - 30 * 1000))).toBe('just now')
  })

  it('returns "just now" for a timestamp 59 seconds ago', () => {
    expect(formatRelativeTime(new Date(NOW - 59 * 1000))).toBe('just now')
  })

  // AC2: 1–59 minutes ago → "X minute(s) ago"
  it('returns "1 minute ago" for exactly 1 minute ago', () => {
    expect(formatRelativeTime(new Date(NOW - 1 * 60 * 1000))).toBe('1 minute ago')
  })

  it('returns "2 minutes ago" for 2 minutes ago (plural)', () => {
    expect(formatRelativeTime(new Date(NOW - 2 * 60 * 1000))).toBe('2 minutes ago')
  })

  it('returns "59 minutes ago" for 59 minutes ago', () => {
    expect(formatRelativeTime(new Date(NOW - 59 * 60 * 1000))).toBe('59 minutes ago')
  })

  // AC3: 1–23 hours ago → "X hour(s) ago"
  it('returns "1 hour ago" for exactly 1 hour ago', () => {
    expect(formatRelativeTime(new Date(NOW - 1 * 60 * 60 * 1000))).toBe('1 hour ago')
  })

  it('returns "2 hours ago" for 2 hours ago (plural)', () => {
    expect(formatRelativeTime(new Date(NOW - 2 * 60 * 60 * 1000))).toBe('2 hours ago')
  })

  it('returns "23 hours ago" for 23 hours ago', () => {
    expect(formatRelativeTime(new Date(NOW - 23 * 60 * 60 * 1000))).toBe('23 hours ago')
  })

  // AC4: exactly 1 day ago → "yesterday"; 2–6 days ago → "X days ago"
  it('returns "yesterday" for exactly 1 day ago', () => {
    expect(formatRelativeTime(new Date(NOW - 1 * 24 * 60 * 60 * 1000))).toBe('yesterday')
  })

  it('returns "2 days ago" for 2 days ago', () => {
    expect(formatRelativeTime(new Date(NOW - 2 * 24 * 60 * 60 * 1000))).toBe('2 days ago')
  })

  it('returns "6 days ago" for 6 days ago', () => {
    expect(formatRelativeTime(new Date(NOW - 6 * 24 * 60 * 60 * 1000))).toBe('6 days ago')
  })

  // AC5: 7 or more days ago → full formatted date via formatDate
  it('returns the full formatted date for exactly 7 days ago', () => {
    const sevenDaysAgo = new Date(NOW - 7 * 24 * 60 * 60 * 1000)
    expect(formatRelativeTime(sevenDaysAgo)).toBe(formatDate(sevenDaysAgo))
  })

  it('returns the full formatted date for 30 days ago', () => {
    const thirtyDaysAgo = new Date(NOW - 30 * 24 * 60 * 60 * 1000)
    expect(formatRelativeTime(thirtyDaysAgo)).toBe(formatDate(thirtyDaysAgo))
  })

  // AC6: accepts both Date object and ISO date string
  it('accepts a Date object', () => {
    expect(formatRelativeTime(new Date(NOW - 5 * 60 * 1000))).toBe('5 minutes ago')
  })

  it('accepts an ISO date string', () => {
    const isoString = new Date(NOW - 5 * 60 * 1000).toISOString()
    expect(formatRelativeTime(isoString)).toBe('5 minutes ago')
  })
})
