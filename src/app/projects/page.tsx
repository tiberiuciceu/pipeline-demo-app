import { StatusBadge } from '../../components/StatusBadge'
import type { Status } from '../../components/StatusBadge'

const projects: Array<{
  name: string
  description: string
  tasks: number
  status: Status
  team: string[]
  updatedAt: string
}> = [
  {
    name: 'Platform UI',
    description: 'Core design system, shared components, and Tailwind token library.',
    tasks: 24,
    status: 'in-progress',
    team: ['TC', 'AR'],
    updatedAt: '2 hours ago',
  },
  {
    name: 'Auth Service',
    description: 'OAuth2, SSO, and JWT authentication layer for all platform apps.',
    tasks: 8,
    status: 'blocked',
    team: ['SP'],
    updatedAt: '1 day ago',
  },
  {
    name: 'Analytics Dashboard',
    description: 'Real-time metrics, funnel reporting, and data export pipeline.',
    tasks: 15,
    status: 'open',
    team: ['MJ', 'TC'],
    updatedAt: '2 days ago',
  },
  {
    name: 'Mobile App',
    description: 'React Native client for iOS and Android with offline-first sync.',
    tasks: 31,
    status: 'completed',
    team: ['AR', 'SP', 'MJ'],
    updatedAt: '5 days ago',
  },
]

const avatarColors: Record<string, string> = {
  TC: 'bg-indigo-500',
  AR: 'bg-violet-500',
  MJ: 'bg-emerald-500',
  SP: 'bg-amber-500',
}

export default function ProjectsPage(): React.ReactElement {
  return (
    <div className="flex flex-col gap-8 p-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-gray-900">Projects</h1>
          <p className="mt-1 text-sm text-gray-500">{projects.length} active projects</p>
        </div>
        <button className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-emerald-500 transition-colors">
          New Project
        </button>
      </div>

      {/* Project grid */}
      <div className="grid grid-cols-2 gap-4">
        {projects.map(project => (
          <div
            key={project.name}
            className="flex flex-col gap-4 rounded-xl border border-gray-200 bg-white p-5 shadow-sm hover:border-gray-300 transition-colors"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="font-semibold text-gray-900">{project.name}</h3>
                <p className="mt-1 text-sm text-gray-500 leading-relaxed">{project.description}</p>
              </div>
              <StatusBadge status={project.status} />
            </div>

            <div className="flex items-center justify-between border-t border-gray-100 pt-3">
              <div className="flex items-center gap-1.5">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="h-3.5 w-3.5 text-gray-400">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <span className="text-xs text-gray-500">{project.tasks} tasks</span>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex -space-x-1.5">
                  {project.team.map(initials => (
                    <div
                      key={initials}
                      className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold text-white ring-2 ring-white ${avatarColors[initials] ?? 'bg-gray-400'}`}
                    >
                      {initials}
                    </div>
                  ))}
                </div>
                <span className="text-xs text-gray-400">{project.updatedAt}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
