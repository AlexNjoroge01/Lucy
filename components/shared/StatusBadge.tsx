import { Badge } from '@/components/ui/badge'
import type { ContentStatus } from '@/types'

const statusConfig: Record<
  ContentStatus,
  { label: string; className: string }
> = {
  PENDING: {
    label: 'Pending',
    className: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100',
  },
  APPROVED: {
    label: 'Approved',
    className: 'bg-green-100 text-green-800 hover:bg-green-100',
  },
  POSTED: {
    label: 'Posted',
    className: 'bg-blue-100 text-blue-800 hover:bg-blue-100',
  },
  REJECTED: {
    label: 'Rejected',
    className: 'bg-red-100 text-red-800 hover:bg-red-100',
  },
}

interface StatusBadgeProps {
  status: ContentStatus
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const config = statusConfig[status]

  return <Badge className={config.className}>{config.label}</Badge>
}
