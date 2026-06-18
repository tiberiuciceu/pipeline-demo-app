export type PresenceStatus = 'online' | 'offline' | 'away'

const presenceMap: Record<string, PresenceStatus> = {
  TC: 'online',
  AR: 'online',
  MJ: 'away',
  SP: 'offline',
}

export function getPresenceStatus(userId: string): PresenceStatus {
  return presenceMap[userId] ?? 'offline'
}
