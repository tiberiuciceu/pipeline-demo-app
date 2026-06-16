export type Status = 'open' | 'in-progress' | 'completed' | 'blocked'

const variants: Record<Status, { label: string; className: string }> = {
  open: { label: 'Open', className: 'bg-blue-50 text-blue-600 ring-1 ring-inset ring-blue-200' },
  'in-progress': { label: 'In Progress', className: 'bg-amber-50 text-amber-600 ring-1 ring-inset ring-amber-200' },
  completed: { label: 'Completed', className: 'bg-emerald-50 text-emerald-600 ring-1 ring-inset ring-emerald-200' },
  blocked: { label: 'Blocked', className: 'bg-red-50 text-red-600 ring-1 ring-inset ring-red-200' },
}

interface StatusBadgeProps {
  status: Status
}

export const StatusBadge = ({ status }: StatusBadgeProps): React.ReactElement => {
  const { label, className } = variants[status]
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${className}`}>
      {label}
    </span>
  )
}
