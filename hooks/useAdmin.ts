'use client'

import { useQuery } from '@tanstack/react-query'
import type { AdminMetrics, UserWithRoles, AuditLog, Role } from '@/types'

// Admin Metrics Hook
export function useAdminMetrics() {
  return useQuery<{ metrics: AdminMetrics }>({
    queryKey: ['admin', 'metrics'],
    queryFn: async () => {
      const response = await fetch('/api/admin/metrics')
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to fetch metrics')
      }
      return response.json()
    },
  })
}

// Admin Users Hook
export function useAdminUsers(params?: {
  page?: number
  limit?: number
  search?: string
  role?: string
}) {
  const { page = 1, limit = 20, search = '', role = '' } = params || {}

  return useQuery<{
    users: UserWithRoles[]
    total: number
    page: number
    limit: number
    totalPages: number
  }>({
    queryKey: ['admin', 'users', { page, limit, search, role }],
    queryFn: async () => {
      const queryParams = new URLSearchParams({
        page: String(page),
        limit: String(limit),
        ...(search && { search }),
        ...(role && { role }),
      })

      const response = await fetch(`/api/admin/users?${queryParams}`)
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to fetch users')
      }
      return response.json()
    },
  })
}

// Admin Audit Logs Hook
export function useAdminAuditLogs(params?: {
  page?: number
  limit?: number
  action?: string
  entity?: string
  userId?: string
  startDate?: string
  endDate?: string
}) {
  const { page = 1, limit = 50, action = '', entity = '', userId = '', startDate = '', endDate = '' } = params || {}

  return useQuery<{
    logs: AuditLog[]
    total: number
    page: number
    limit: number
    totalPages: number
  }>({
    queryKey: ['admin', 'audit-logs', { page, limit, action, entity, userId, startDate, endDate }],
    queryFn: async () => {
      const queryParams = new URLSearchParams({
        page: String(page),
        limit: String(limit),
        ...(action && { action }),
        ...(entity && { entity }),
        ...(userId && { userId }),
        ...(startDate && { startDate }),
        ...(endDate && { endDate }),
      })

      const response = await fetch(`/api/admin/audit-logs?${queryParams}`)
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to fetch audit logs')
      }
      return response.json()
    },
  })
}

// Admin Roles Hook
export function useAdminRoles() {
  return useQuery<{ roles: Role[] }>({
    queryKey: ['admin', 'roles'],
    queryFn: async () => {
      const response = await fetch('/api/admin/roles')
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to fetch roles')
      }
      return response.json()
    },
  })
}
