import { Badge } from '@/components/ui/badge'
import {
  Twitter,
  Linkedin,
  Music2,
  Newspaper,
  Instagram,
  Youtube,
  MessageCircle,
  MessageSquare,
  Facebook,
} from 'lucide-react'
import type { Platform } from '@/types'

const platformConfig: Record<Platform, { label: string; icon: React.ReactNode; color: string }> = {
  X: {
    label: 'X',
    icon: <Twitter className="h-3 w-3" />,
    color: 'bg-black/10 text-black',
  },
  LINKEDIN: {
    label: 'LinkedIn',
    icon: <Linkedin className="h-3 w-3" />,
    color: 'bg-blue-600/10 text-blue-600',
  },
  FACEBOOK: {
    label: 'Facebook',
    icon: <Facebook className="h-3 w-3" />,
    color: 'bg-blue-700/10 text-blue-700',
  },
  TIKTOK: {
    label: 'TikTok',
    icon: <Music2 className="h-3 w-3" />,
    color: 'bg-pink-500/10 text-pink-600',
  },
  MEDIUM: {
    label: 'Medium',
    icon: <Newspaper className="h-3 w-3" />,
    color: 'bg-gray-600/10 text-gray-600',
  },
  INSTAGRAM: {
    label: 'Instagram',
    icon: <Instagram className="h-3 w-3" />,
    color: 'bg-purple-500/10 text-purple-600',
  },
  YOUTUBE: {
    label: 'YouTube',
    icon: <Youtube className="h-3 w-3" />,
    color: 'bg-red-500/10 text-red-600',
  },
  WHATSAPP: {
    label: 'WhatsApp',
    icon: <MessageCircle className="h-3 w-3" />,
    color: 'bg-green-500/10 text-green-600',
  },
  REDDIT: {
    label: 'Reddit',
    icon: <MessageSquare className="h-3 w-3" />,
    color: 'bg-orange-500/10 text-orange-600',
  },
}

interface PlatformBadgeProps {
  platform: Platform
}

export function PlatformBadge({ platform }: PlatformBadgeProps) {
  const config = platformConfig[platform]

  return (
    <Badge variant="outline" className={`gap-1 ${config.color}`}>
      {config.icon}
      {config.label}
    </Badge>
  )
}
