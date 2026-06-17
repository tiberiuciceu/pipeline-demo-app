import { PresenceDot } from './PresenceDot'

export function SidebarUser(): React.ReactElement {
  return (
    <div className="border-t border-white/5 p-3">
      <div className="flex items-center gap-3 rounded-lg px-3 py-2">
        <div className="relative flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-indigo-500 text-xs font-bold text-white">
          TC
          <PresenceDot userId="TC" />
        </div>
        <div className="min-w-0">
          <p className="truncate text-xs font-medium text-white">Tiberiu Ciceu</p>
          <p className="truncate text-xs text-gray-400">Admin</p>
        </div>
      </div>
    </div>
  )
}
