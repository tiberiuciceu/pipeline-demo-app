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

  it('returns "offline" for an unknown user ID', () => {
    expect(getPresenceStatus('UNKNOWN')).toBe('offline')
  })

  it('returns "offline" for an empty string', () => {
    expect(getPresenceStatus('')).toBe('offline')
  })

  it('returns "offline" for a user ID not in the map', () => {
    expect(getPresenceStatus('XY')).toBe('offline')
  })

  it('is a named export (not a default export)', async () => {
    const mod = await import('../presence')
    expect(typeof mod.getPresenceStatus).toBe('function')
    expect('default' in mod).toBe(false)
  })

  it('return type is one of the three valid statuses', () => {
    const validStatuses: Array<'online' | 'offline' | 'away'> = ['online', 'offline', 'away']
    const users = ['TC', 'AR', 'MJ', 'SP', 'UNKNOWN']
    for (const userId of users) {
      expect(validStatuses).toContain(getPresenceStatus(userId))
    }
  })
})
