'use client'

import { useEffect, useState } from 'react'
import { useContentList } from '@/hooks/useContent'
import { useContentStore } from '@/stores/useContentStore'
import { ContentCard } from './ContentCard'
import { EmptyState } from '@/components/shared/EmptyState'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function ContentList() {
  const { selectedStatus, selectedPlatform, selectedType } = useContentStore()
  const [page, setPage] = useState(1)
  const limit = 10

  // Reset to first page when filters change
  useEffect(() => {
    setPage(1)
  }, [selectedStatus, selectedPlatform, selectedType])

  const { data, isLoading, error } = useContentList({
    status: selectedStatus,
    platform: selectedPlatform,
    type: selectedType,
    page,
    limit,
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

  const totalPages = Math.max(1, Math.ceil(data.total / limit))

  return (
    <div className="space-y-4">
      <div className="grid gap-4">
        {data.items.map((item) => (
          <ContentCard key={item.id} item={item} />
        ))}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-4 border-t">
          <p className="text-sm text-muted-foreground">
            Page {data.page} of {totalPages} • Showing {data.items.length} of {data.total} items
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((prev) => Math.max(1, prev - 1))}
              disabled={page === 1}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
              disabled={page === totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
