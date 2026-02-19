'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { PlatformBadge } from '@/components/shared/PlatformBadge'
import { CopyButton } from '@/components/shared/CopyButton'
import { useUpdateContent } from '@/hooks/useContent'
import { toast } from 'sonner'
import { Pencil, Check, X, Share2, Loader2 } from 'lucide-react'
import type { ContentItem, ContentStatus } from '@/types'

const contentTypeLabels: Record<string, string> = {
  SHORT_POST: 'Short Post',
  LONG_POST: 'Long Post',
  ARTICLE: 'Article',
  THREAD: 'Thread',
  IMAGE_CAPTION: 'Image Caption',
}

interface ContentCardProps {
  item: ContentItem
}

export function ContentCard({ item }: ContentCardProps) {
  const [expanded, setExpanded] = useState(false)
  const updateContent = useUpdateContent()

  const handleStatusUpdate = async (status: ContentStatus) => {
    try {
      await updateContent.mutateAsync({ id: item.id, data: { status } })
      toast.success(`Content marked as ${status.toLowerCase()}`)
    } catch {
      toast.error('Failed to update status')
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    return date.toLocaleDateString()
  }

  const truncateText = (text: string, lines: number) => {
    if (expanded) return text
    return text.length > 200 ? text.slice(0, 200) + '...' : text
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card rounded-lg border p-4"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2 flex-wrap">
          <PlatformBadge platform={item.platform} />
          <StatusBadge status={item.status} />
          <span className="text-xs text-muted-foreground">
            {contentTypeLabels[item.type]}
          </span>
        </div>
        <span className="text-xs text-muted-foreground">
          {formatDate(item.generatedAt)}
        </span>
      </div>

      <div className="mb-3">
        <p className="text-sm whitespace-pre-wrap">
          {truncateText(item.body, 3)}
        </p>
        {item.body.length > 200 && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-xs text-primary hover:underline mt-1"
          >
            {expanded ? 'Show less' : 'Show more'}
          </button>
        )}
      </div>

      {item.project && (
        <p className="text-xs text-muted-foreground mb-3">
          Project: {item.project.name}
        </p>
      )}

      <div className="flex items-center gap-2 flex-wrap">
        <Link href={`/editor/${item.id}`}>
          <Button variant="outline" size="sm">
            <Pencil className="h-4 w-4 mr-1" />
            Edit
          </Button>
        </Link>
        <CopyButton text={item.body} />

        {item.status === 'PENDING' && (
          <>
            <Button
              variant="outline"
              size="sm"
              className="text-green-600 hover:text-green-700"
              onClick={() => handleStatusUpdate('APPROVED')}
              disabled={updateContent.isPending}
            >
              {updateContent.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Check className="h-4 w-4 mr-1" />
              )}
              Approve
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="text-red-600 hover:text-red-700"
              onClick={() => handleStatusUpdate('REJECTED')}
              disabled={updateContent.isPending}
            >
              <X className="h-4 w-4 mr-1" />
              Reject
            </Button>
          </>
        )}

        {item.status === 'APPROVED' && (
          <Button
            variant="outline"
            size="sm"
            className="text-blue-600 hover:text-blue-700"
            onClick={() => handleStatusUpdate('POSTED')}
            disabled={updateContent.isPending}
          >
            {updateContent.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Share2 className="h-4 w-4 mr-1" />
            )}
            Mark Posted
          </Button>
        )}
      </div>
    </motion.div>
  )
}
