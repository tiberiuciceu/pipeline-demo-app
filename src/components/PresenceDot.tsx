import type { ReactElement } from 'react'
import { getPresenceStatus } from '../lib/presence'

interface PresenceDotProps {
  userId: string
}

const statusColorClass: Record<'online' | 'away' | 'offline', string> = {
  online: 'bg-emerald-500',
  away: 'bg-amber-500',
  offline: 'bg-gray-400',
}

export function PresenceDot({ userId }: PresenceDotProps): ReactElement {
  const status = getPresenceStatus(userId)
  return (
    <span
      aria-label={`${status}: ${userId}`}
      className={`absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full ring-2 ring-white ${statusColorClass[status]}`}
    />
  )
}
