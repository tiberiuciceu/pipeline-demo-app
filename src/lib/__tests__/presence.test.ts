import { describe, it, expect } from 'vitest'
import { getPresenceStatus } from '../presence'

describe('getPresenceStatus', () => {
  it('returns "online" for TC', () => {
    expect(getPresenceStatus('TC')).toBe('online')
  })

  it('returns "online" for AR', () => {
    expect(getPresenceStatus('AR')).toBe('online')
  })

  it('returns "away" for MJ', () => {
    expect(getPresenceStatus('MJ')).toBe('away')
  })

  it('returns "offline" for SP', () => {
    expect(getPresenceStatus('SP')).toBe('offline')
  })

  it('returns "offline" for any user ID not in the map', () => {
    expect(getPresenceStatus('UNKNOWN')).toBe('offline')
  })

  it('returns "offline" for an empty string', () => {
    expect(getPresenceStatus('')).toBe('offline')
  })

  it('returns "offline" for a user ID with different casing', () => {
    // The map uses uppercase keys; lowercase 'tc' should not match
    expect(getPresenceStatus('tc')).toBe('offline')
  })

  it('is a named export (not a default export)', async () => {
    const mod = await import('../presence')
    expect(typeof mod.getPresenceStatus).toBe('function')
    // There should be no default export
    expect((mod as Record<string, unknown>).default).toBeUndefined()
  })

  it('return type is one of "online" | "offline" | "away"', () => {
    const validStatuses = ['online', 'offline', 'away']
    expect(validStatuses).toContain(getPresenceStatus('TC'))
    expect(validStatuses).toContain(getPresenceStatus('MJ'))
    expect(validStatuses).toContain(getPresenceStatus('SP'))
    expect(validStatuses).toContain(getPresenceStatus('NONEXISTENT'))
  })
})
