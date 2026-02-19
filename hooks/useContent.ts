'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { ContentFilters, ContentItem, ContentType, Platform } from '@/types'

interface ContentListResponse {
  items: ContentItem[]
  total: number
  page: number
}

async function fetchContent(
  filters: ContentFilters
): Promise<ContentListResponse> {
  const params = new URLSearchParams()
  if (filters.status && filters.status !== 'ALL') {
    params.append('status', filters.status)
  }
  if (filters.platform && filters.platform !== 'ALL') {
    params.append('platform', filters.platform)
  }
  if (filters.type && filters.type !== 'ALL') {
    params.append('type', filters.type)
  }
  params.append('page', String(filters.page || 1))
  params.append('limit', String(filters.limit || 10))

  const res = await fetch(`/api/content?${params.toString()}`)
  if (!res.ok) throw new Error('Failed to fetch content')
  return res.json()
}

async function fetchContentItem(id: string): Promise<ContentItem> {
  const res = await fetch(`/api/content/${id}`)
  if (!res.ok) throw new Error('Failed to fetch content item')
  return res.json()
}

async function updateContentItem({
  id,
  data,
}: {
  id: string
  data: Partial<ContentItem>
}): Promise<ContentItem> {
  const res = await fetch(`/api/content/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error('Failed to update content item')
  return res.json()
}

async function deleteContentItem(id: string): Promise<{ success: boolean }> {
  const res = await fetch(`/api/content/${id}`, { method: 'DELETE' })
  if (!res.ok) throw new Error('Failed to delete content item')
  return res.json()
}

async function generateContent({
  contentType,
  platform,
  projectId,
}: {
  contentType: ContentType
  platform: Platform
  projectId?: string
}): Promise<ContentItem> {
  const res = await fetch('/api/content/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ contentType, platform, projectId }),
  })
  if (!res.ok) throw new Error('Failed to generate content')
  return res.json()
}

export function useContentList(filters: ContentFilters) {
  return useQuery({
    queryKey: ['content', filters],
    queryFn: () => fetchContent(filters),
  })
}

export function useContentItem(id: string) {
  return useQuery({
    queryKey: ['content', id],
    queryFn: () => fetchContentItem(id),
    enabled: !!id,
  })
}

export function useUpdateContent() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: updateContentItem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['content'] })
    },
  })
}

export function useDeleteContent() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteContentItem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['content'] })
    },
  })
}

export function useGenerateContent() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: generateContent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['content'] })
    },
  })
}
