'use client'

import { useContentStore } from '@/stores/useContentStore'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import type { ContentStatus, Platform, ContentType } from '@/types'

const statusOptions: { value: ContentStatus | 'ALL'; label: string }[] = [
  { value: 'ALL', label: 'All Status' },
  { value: 'PENDING', label: 'Pending' },
  { value: 'APPROVED', label: 'Approved' },
  { value: 'POSTED', label: 'Posted' },
  { value: 'REJECTED', label: 'Rejected' },
]

const platformOptions: { value: Platform | 'ALL'; label: string }[] = [
  { value: 'ALL', label: 'All Platforms' },
  { value: 'X', label: 'X (Twitter)' },
  { value: 'LINKEDIN', label: 'LinkedIn' },
  { value: 'TIKTOK', label: 'TikTok' },
  { value: 'MEDIUM', label: 'Medium' },
  { value: 'INSTAGRAM', label: 'Instagram' },
  { value: 'YOUTUBE', label: 'YouTube' },
  { value: 'WHATSAPP', label: 'WhatsApp' },
  { value: 'REDDIT', label: 'Reddit' },
]

const typeOptions: { value: ContentType | 'ALL'; label: string }[] = [
  { value: 'ALL', label: 'All Types' },
  { value: 'SHORT_POST', label: 'Short Post' },
  { value: 'LONG_POST', label: 'Long Post' },
  { value: 'ARTICLE', label: 'Article' },
  { value: 'THREAD', label: 'Thread' },
  { value: 'IMAGE_CAPTION', label: 'Image Caption' },
]

export function ContentFilters() {
  const {
    selectedStatus,
    selectedPlatform,
    selectedType,
    setFilter,
    resetFilters,
  } = useContentStore()

  const hasActiveFilters =
    selectedStatus !== 'ALL' ||
    selectedPlatform !== 'ALL' ||
    selectedType !== 'ALL'

  return (
    <div className="flex flex-wrap items-center gap-3">
      <Select
        value={selectedStatus}
        onValueChange={(value) => setFilter('selectedStatus', value)}
      >
        <SelectTrigger className="w-[140px]">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          {statusOptions.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={selectedPlatform}
        onValueChange={(value) => setFilter('selectedPlatform', value)}
      >
        <SelectTrigger className="w-[150px]">
          <SelectValue placeholder="Platform" />
        </SelectTrigger>
        <SelectContent>
          {platformOptions.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={selectedType}
        onValueChange={(value) => setFilter('selectedType', value)}
      >
        <SelectTrigger className="w-[150px]">
          <SelectValue placeholder="Type" />
        </SelectTrigger>
        <SelectContent>
          {typeOptions.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {hasActiveFilters && (
        <Button variant="ghost" size="sm" onClick={resetFilters}>
          Clear Filters
        </Button>
      )}
    </div>
  )
}
