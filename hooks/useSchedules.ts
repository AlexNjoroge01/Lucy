'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { Schedule, ScheduleStatus, Platform, ContentType, RecurrenceType } from '@/types'

interface CreateScheduleData {
  projectId: string
  platforms: Platform[]
  contentTypes: ContentType[]
  scheduledDates: string[]
  timeOfDay: string
  recurrence: RecurrenceType
}

interface ExecuteResult {
  executed: number
  successful: number
  failed: number
  totalGenerated: number
  results: Array<{
    scheduleId: string
    success: boolean
    generatedCount?: number
    items?: Array<{ platform: string; contentType: string; itemId: string }>
    error?: string
  }>
}

async function fetchSchedules(status?: ScheduleStatus): Promise<Schedule[]> {
  const url = status ? `/api/schedules?status=${status}` : '/api/schedules'
  const res = await fetch(url)
  if (!res.ok) throw new Error('Failed to fetch schedules')
  const data = await res.json()
  return data.schedules
}

async function createSchedule(data: CreateScheduleData): Promise<Schedule> {
  const res = await fetch('/api/schedules', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!res.ok) {
    const error = await res.json()
    throw new Error(error.message || 'Failed to create schedule')
  }
  const result = await res.json()
  return result.schedule
}

async function deleteSchedule(id: string): Promise<{ success: boolean }> {
  const res = await fetch(`/api/schedules/${id}`, { method: 'DELETE' })
  if (!res.ok) throw new Error('Failed to delete schedule')
  return res.json()
}

async function executeSchedules(): Promise<ExecuteResult> {
  const res = await fetch('/api/schedules/execute', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  })
  if (!res.ok) {
    const error = await res.json()
    throw new Error(error.message || 'Failed to execute schedules')
  }
  return res.json()
}

export function useSchedules(status?: ScheduleStatus) {
  return useQuery({
    queryKey: ['schedules', status],
    queryFn: () => fetchSchedules(status),
  })
}

export function useCreateSchedule() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createSchedule,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schedules'] })
    },
  })
}

export function useDeleteSchedule() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteSchedule,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schedules'] })
    },
  })
}

export function useExecuteSchedules() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: executeSchedules,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schedules'] })
      queryClient.invalidateQueries({ queryKey: ['content'] })
    },
  })
}