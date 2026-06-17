import { StatCard } from '../components/StatCard'
import { StatusBadge } from '../components/StatusBadge'
import type { Status } from '../components/StatusBadge'
import { formatRelativeTime } from '../lib/formatters'

const stats = [
  {
    label: 'Open Tasks',
    value: 24,
    sub: '+3 since last week',
    positive: false,
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="h-4 w-4">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
      </svg>
    ),
  },
  {
    label: 'In Progress',
    value: 8,
    sub: '2 due today',
    positive: undefined,
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="h-4 w-4">
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
      </svg>
    ),
  },
  {
    label: 'Completed',
    value: 142,
    sub: '+12 this week',
    positive: true,
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="h-4 w-4">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    label: 'Team Members',
    value: 6,
    sub: '2 active now',
    positive: undefined,
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="h-4 w-4">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
      </svg>
    ),
  },
]

const now = Date.now()
const activity: Array<{ key: string; title: string; status: Status; assignee: string; date: Date }> = [
  { key: 'KAN-14', title: 'Add formatRelativeTime utility to formatters', status: 'in-progress', assignee: 'TC', date: new Date(now - 2 * 60 * 60 * 1000) },
  { key: 'KAN-13', title: 'Implement dark mode toggle for dashboard', status: 'open', assignee: 'AR', date: new Date(now - 4 * 60 * 60 * 1000) },
  { key: 'KAN-12', title: 'Add array utility functions to shared lib', status: 'completed', assignee: 'MJ', date: new Date(now - 24 * 60 * 60 * 1000) },
  { key: 'KAN-11', title: 'Fix pagination on projects list page', status: 'completed', assignee: 'TC', date: new Date(now - 36 * 60 * 60 * 1000) },
  { key: 'KAN-10', title: 'Migrate auth service to JWT tokens', status: 'blocked', assignee: 'SP', date: new Date(now - 3 * 24 * 60 * 60 * 1000) },
]

const avatarColors: Record<string, string> = {
  TC: 'bg-indigo-500',
  AR: 'bg-violet-500',
  MJ: 'bg-emerald-500',
  SP: 'bg-amber-500',
}

export default function DashboardPage(): React.ReactElement {
  return (
    <div className="flex flex-col gap-8 p-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-gray-900">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">Welcome back, Tiberiu. Here&apos;s what&apos;s happening.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        {stats.map(s => (
          <StatCard key={s.label} label={s.label} value={s.value} icon={s.icon} sub={s.sub} positive={s.positive} />
        ))}
      </div>

      {/* Recent Activity */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-semibold text-gray-900">Recent Activity</h2>
          <span className="text-xs text-gray-400">Last 7 days</span>
        </div>
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          <ul className="divide-y divide-gray-100">
            {activity.map(item => (
              <li key={item.key} className="flex items-center gap-4 px-5 py-3.5 hover:bg-gray-50 transition-colors">
                <span className="w-16 shrink-0 font-mono text-xs text-gray-400">{item.key}</span>
                <span className="flex-1 truncate text-sm text-gray-700">{item.title}</span>
                <StatusBadge status={item.status} />
                <div className="flex items-center gap-2">
                  <div className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold text-white ${avatarColors[item.assignee] ?? 'bg-gray-400'}`}>
                    {item.assignee}
                  </div>
                  <span className="w-20 text-right text-xs text-gray-400">{formatRelativeTime(item.date)}</span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}
