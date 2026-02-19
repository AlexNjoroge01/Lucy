'use client'

import { useContentList } from '@/hooks/useContent'
import { useContentStore } from '@/stores/useContentStore'
import { ContentCard } from './ContentCard'
import { EmptyState } from '@/components/shared/EmptyState'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function ContentList() {
  const { selectedStatus, selectedPlatform, selectedType } = useContentStore()

  const { data, isLoading, error } = useContentList({
    status: selectedStatus,
    platform: selectedPlatform,
    type: selectedType,
    page: 1,
    limit: 20,
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (error) {
    return (
      <EmptyState
        title="Error loading content"
        description="Something went wrong. Please try again."
        action={<Button onClick={() => window.location.reload()}>Retry</Button>}
      />
    )
  }

  if (!data?.items || data.items.length === 0) {
    return (
      <EmptyState
        title="No content found"
        description="Generate your first content or adjust your filters."
      />
    )
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4">
        {data.items.map((item) => (
          <ContentCard key={item.id} item={item} />
        ))}
      </div>

      {data.total > 20 && (
        <div className="text-center text-sm text-muted-foreground">
          Showing {data.items.length} of {data.total} items
        </div>
      )}
    </div>
  )
}
