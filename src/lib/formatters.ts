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

export const formatRelativeTime = (date: Date | string, now: number = Date.now()): string => {
  const d = typeof date === 'string' ? new Date(date) : date
  const diffSeconds = Math.floor((now - d.getTime()) / 1000)

  if (diffSeconds < 60) return 'just now'

  const diffMinutes = Math.floor(diffSeconds / 60)
  if (diffMinutes < 60) return diffMinutes === 1 ? '1 minute ago' : `${diffMinutes} minutes ago`

  const diffHours = Math.floor(diffMinutes / 60)
  if (diffHours < 24) return diffHours === 1 ? '1 hour ago' : `${diffHours} hours ago`

  const diffDays = Math.floor(diffHours / 24)
  if (diffDays === 1) return 'yesterday'
  if (diffDays < 7) return `${diffDays} days ago`

  return formatDate(d)
}
