const presenceMap: Record<string, 'online' | 'offline' | 'away'> = {
  TC: 'online',
  AR: 'online',
  MJ: 'away',
  SP: 'offline',
}

export function getPresenceStatus(userId: string): 'online' | 'offline' | 'away' {
  return presenceMap[userId] ?? 'offline'
}

export const presenceColors: Record<'online' | 'away' | 'offline', string> = {
  online: 'bg-emerald-500',
  away: 'bg-amber-500',
  offline: 'bg-gray-400',
}
