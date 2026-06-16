import { describe, it, expect } from 'vitest'
import { formatCurrency, formatDate, truncate } from '../formatters'

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
