import type { ReactNode } from 'react'

interface StatCardProps {
  label: string
  value: number | string
  icon: ReactNode
  sub: string
  positive?: boolean
}

export const StatCard = ({ label, value, icon, sub, positive }: StatCardProps): React.ReactElement => (
  <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
    <div className="flex items-center justify-between">
      <span className="text-sm font-medium text-gray-500">{label}</span>
      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-50 text-gray-400">
        {icon}
      </span>
    </div>
    <p className="mt-3 text-3xl font-semibold tracking-tight text-gray-900">{value}</p>
    <p className={`mt-1 text-xs ${positive === false ? 'text-red-500' : positive ? 'text-emerald-600' : 'text-gray-400'}`}>
      {sub}
    </p>
  </div>
)
