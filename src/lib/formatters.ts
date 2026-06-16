/**
 * Shared formatting utilities used across the app.
 * Add new formatters here; each should have a corresponding Vitest test in src/lib/__tests__/formatters.test.ts
 */

export const formatCurrency = (amount: number, currency = 'USD'): string => {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount)
}

export const formatDate = (date: Date | string, locale = 'en-US'): string => {
  return new Intl.DateTimeFormat(locale, { year: 'numeric', month: 'long', day: 'numeric' }).format(
    typeof date === 'string' ? new Date(date) : date,
  )
}

export const truncate = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength).trimEnd() + '…'
}
