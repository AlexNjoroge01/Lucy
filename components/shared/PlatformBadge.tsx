import { Badge } from '@/components/ui/badge'
import { Twitter, Linkedin } from 'lucide-react'
import type { Platform } from '@/types'

const platformConfig: Record<Platform, { label: string; icon: React.ReactNode }> = {
  X: {
    label: 'X',
    icon: <Twitter className="h-3 w-3" />,
  },
  LINKEDIN: {
    label: 'LinkedIn',
    icon: <Linkedin className="h-3 w-3" />,
  },
}

interface PlatformBadgeProps {
  platform: Platform
}

export function PlatformBadge({ platform }: PlatformBadgeProps) {
  const config = platformConfig[platform]

  return (
    <Badge variant="outline" className="gap-1">
      {config.icon}
      {config.label}
    </Badge>
  )
}
