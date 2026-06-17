import { describe, it, expect } from 'vitest'
import { getPresenceStatus } from '../presence'

describe('getPresenceStatus', () => {
  it('is a named export (not default)', async () => {
    const mod = await import('../presence')
    expect(typeof mod.getPresenceStatus).toBe('function')
    expect(mod.default).toBeUndefined()
  })

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

  it('returns "offline" for an unknown user ID', () => {
    expect(getPresenceStatus('UNKNOWN')).toBe('offline')
  })

  it('returns "offline" for an empty string user ID', () => {
    expect(getPresenceStatus('')).toBe('offline')
  })

  it('returns a valid PresenceStatus type for every known user', () => {
    const validStatuses = ['online', 'offline', 'away']
    for (const userId of ['TC', 'AR', 'MJ', 'SP']) {
      expect(validStatuses).toContain(getPresenceStatus(userId))
    }
  })
})
