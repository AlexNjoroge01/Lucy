'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useSchedules, useDeleteSchedule, useExecuteSchedules } from '@/hooks/useSchedules'
import { ScheduleForm } from '@/components/schedules/ScheduleForm'
import { EmptyState } from '@/components/shared/EmptyState'
import { PlatformBadge } from '@/components/shared/PlatformBadge'
import { Plus, Loader2, Trash2, Calendar, Clock, CheckCircle2, XCircle, AlertCircle, ChevronLeft, ChevronRight, Play } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import type { Schedule, ScheduleStatus } from '@/types'

const statusConfig: Record<ScheduleStatus, { label: string; icon: React.ReactNode; color: string }> = {
  PENDING: {
    label: 'Pending',
    icon: <Clock className="h-3 w-3" />,
    color: 'bg-yellow-500/10 text-yellow-600',
  },
  ACTIVE: {
    label: 'Active',
    icon: <Clock className="h-3 w-3" />,
    color: 'bg-blue-500/10 text-blue-600',
  },
  COMPLETED: {
    label: 'Completed',
    icon: <CheckCircle2 className="h-3 w-3" />,
    color: 'bg-green-500/10 text-green-600',
  },
  FAILED: {
    label: 'Failed',
    icon: <XCircle className="h-3 w-3" />,
    color: 'bg-red-500/10 text-red-600',
  },
  CANCELLED: {
    label: 'Cancelled',
    icon: <AlertCircle className="h-3 w-3" />,
    color: 'bg-gray-500/10 text-gray-600',
  },
}

const contentTypeLabels: Record<string, string> = {
  SHORT_POST: 'Short Post',
  LONG_POST: 'Long Post',
  ARTICLE: 'Article',
  THREAD: 'Thread',
  IMAGE_CAPTION: 'Image Caption',
}

const recurrenceLabels: Record<string, string> = {
  NONE: 'One-time',
  DAILY: 'Daily',
  WEEKLY: 'Weekly',
  MONTHLY: 'Monthly',
}

function ScheduleCard({
  schedule,
  onDelete,
}: {
  schedule: Schedule
  onDelete: (id: string) => void
}) {
  const status = statusConfig[schedule.status]
  const nextDate = schedule.scheduledDates
    .map((d) => new Date(d))
    .filter((d) => d > new Date())
    .sort((a, b) => a.getTime() - b.getTime())[0]

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-base font-semibold">
              {schedule.project?.name || 'Unknown Project'}
            </CardTitle>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-3.5 w-3.5" />
              {schedule.timeOfDay}
              <span className="mx-1">•</span>
              {recurrenceLabels[schedule.recurrence]}
            </div>
            {nextDate && (
              <div className="text-xs text-muted-foreground">
                Next: {nextDate.toLocaleDateString()}
              </div>
            )}
          </div>
          <Badge variant="outline" className={`gap-1 ${status.color}`}>
            {status.icon}
            {status.label}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-0 space-y-3">
        <div className="flex flex-wrap gap-1">
          {schedule.platforms.map((platform) => (
            <PlatformBadge key={platform} platform={platform} />
          ))}
        </div>
        <div className="flex flex-wrap gap-1">
          {schedule.contentTypes.map((type) => (
            <Badge key={type} variant="secondary" className="text-xs">
              {contentTypeLabels[type]}
            </Badge>
          ))}
        </div>
        <div className="flex items-center justify-between pt-2 border-t">
          <span className="text-xs text-muted-foreground">
            {schedule.scheduledDates.length} date{schedule.scheduledDates.length !== 1 ? 's' : ''}
          </span>
          {(schedule.status === 'PENDING' || schedule.status === 'ACTIVE') && (
            <Button
              variant="ghost"
              size="sm"
              className="text-destructive hover:text-destructive"
              onClick={() => onDelete(schedule.id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
        {schedule.error && (
          <p className="text-xs text-destructive">{schedule.error}</p>
        )}
      </CardContent>
    </Card>
  )
}

function CalendarView({ schedules }: { schedules: Schedule[] }) {
  const [currentMonth, setCurrentMonth] = useState(new Date())

  const generateCalendarDays = () => {
    const year = currentMonth.getFullYear()
    const month = currentMonth.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()

    const days: { date: number; dateStr: string; isCurrentMonth: boolean; schedules: Schedule[] }[] = []

    // Previous month days
    const prevMonthLastDay = new Date(year, month, 0).getDate()
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      const date = new Date(year, month - 1, prevMonthLastDay - i)
      const dateStr = date.toISOString().split('T')[0]
      days.push({
        date: prevMonthLastDay - i,
        dateStr,
        isCurrentMonth: false,
        schedules: getSchedulesForDate(dateStr, schedules),
      })
    }

    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
      const dateStr = new Date(year, month, i).toISOString().split('T')[0]
      days.push({
        date: i,
        dateStr,
        isCurrentMonth: true,
        schedules: getSchedulesForDate(dateStr, schedules),
      })
    }

    // Next month days
    const remainingDays = 42 - days.length
    for (let i = 1; i <= remainingDays; i++) {
      const date = new Date(year, month + 1, i)
      const dateStr = date.toISOString().split('T')[0]
      days.push({
        date: i,
        dateStr,
        isCurrentMonth: false,
        schedules: getSchedulesForDate(dateStr, schedules),
      })
    }

    return days
  }

  const getSchedulesForDate = (dateStr: string, allSchedules: Schedule[]): Schedule[] => {
    return allSchedules.filter((schedule) => {
      // Check if this date is in scheduledDates
      const isScheduled = schedule.scheduledDates.some(
        (d) => new Date(d).toISOString().split('T')[0] === dateStr
      )
      if (isScheduled) return true

      // Check recurrence patterns
      if (schedule.recurrence !== 'NONE' && schedule.scheduledDates.length > 0) {
        const firstDate = new Date(schedule.scheduledDates[0])
        const checkDate = new Date(dateStr)
        
        if (checkDate < firstDate) return false

        switch (schedule.recurrence) {
          case 'DAILY':
            return true
          case 'WEEKLY':
            return checkDate.getDay() === firstDate.getDay()
          case 'MONTHLY':
            return checkDate.getDate() === firstDate.getDate()
        }
      }
      return false
    })
  }

  const calendarDays = generateCalendarDays()
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  return (
    <div className="border rounded-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <span className="font-semibold">
          {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
        </span>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center text-xs text-muted-foreground mb-2">
        {weekDays.map((day) => (
          <div key={day}>{day}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {calendarDays.map((day, index) => (
          <div
            key={index}
            className={cn(
              'min-h-[80px] p-1 border rounded',
              !day.isCurrentMonth && 'bg-muted/30',
              day.isCurrentMonth && 'bg-card',
              day.dateStr === new Date().toISOString().split('T')[0] && 'border-primary'
            )}
          >
            <div className={cn(
              'text-sm mb-1',
              !day.isCurrentMonth && 'text-muted-foreground/50'
            )}>
              {day.date}
            </div>
            <div className="space-y-0.5">
              {day.schedules.slice(0, 3).map((schedule) => (
                <div
                  key={schedule.id}
                  className="text-[10px] truncate px-1 py-0.5 rounded bg-primary/10 text-primary"
                >
                  {schedule.timeOfDay} {schedule.project?.name}
                </div>
              ))}
              {day.schedules.length > 3 && (
                <div className="text-[10px] text-muted-foreground text-center">
                  +{day.schedules.length - 3} more
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function SchedulesPage() {
  const { data: schedules, isLoading } = useSchedules()
  const deleteSchedule = useDeleteSchedule()
  const executeSchedules = useExecuteSchedules()
  const [formOpen, setFormOpen] = useState(false)
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list')

  // Auto-check for due schedules on page load
  useEffect(() => {
    const checkDueSchedules = async () => {
      const now = new Date()
      const hasDueSchedules = schedules?.some((s) => {
        if (s.status !== 'PENDING' && s.status !== 'ACTIVE') return false
        const scheduledDate = s.scheduledDates.find((date) => {
          const d = new Date(date)
          return d.getFullYear() === now.getFullYear() &&
                 d.getMonth() === now.getMonth() &&
                 d.getDate() === now.getDate()
        })
        return scheduledDate
      })
      
      if (hasDueSchedules) {
        toast.info('You have schedules due today', {
          action: {
            label: 'Execute Now',
            onClick: handleExecute,
          },
        })
      }
    }
    
    if (schedules) {
      checkDueSchedules()
    }
  }, [schedules])

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to cancel this schedule?')) {
      try {
        await deleteSchedule.mutateAsync(id)
        toast.success('Schedule cancelled successfully')
      } catch {
        toast.error('Failed to cancel schedule')
      }
    }
  }

  const handleExecute = async () => {
    try {
      const result = await executeSchedules.mutateAsync()
      if (result.totalGenerated > 0) {
        toast.success(`Generated ${result.totalGenerated} content items from ${result.successful} schedules`)
      } else {
        toast.info('No schedules are due for execution')
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to execute schedules')
    }
  }

  // Separate schedules by status
  const pendingSchedules = schedules?.filter((s) => s.status === 'PENDING' || s.status === 'ACTIVE') || []
  const completedSchedules = schedules?.filter((s) => s.status === 'COMPLETED') || []
  const otherSchedules = schedules?.filter((s) => s.status === 'FAILED' || s.status === 'CANCELLED') || []

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Schedules</h1>
          <p className="text-muted-foreground">
            Schedule automatic content generation for your projects
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExecute}
            disabled={executeSchedules.isPending}
          >
            {executeSchedules.isPending ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Play className="h-4 w-4 mr-2" />
            )}
            Run Now
          </Button>
          <div className="flex bg-muted rounded-lg p-1 mx-2">
            <Button
              variant={viewMode === 'list' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('list')}
            >
              List
            </Button>
            <Button
              variant={viewMode === 'calendar' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('calendar')}
            >
              Calendar
            </Button>
          </div>
          <Button onClick={() => setFormOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Schedule
          </Button>
        </div>
      </div>

      {schedules && schedules.length > 0 ? (
        viewMode === 'calendar' ? (
          <CalendarView schedules={schedules} />
        ) : (
          <div className="space-y-8">
            {/* Pending/Active Schedules */}
            {pendingSchedules.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Clock className="h-5 w-5 text-yellow-500" />
                  Active & Pending ({pendingSchedules.length})
                </h2>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {pendingSchedules.map((schedule) => (
                    <ScheduleCard
                      key={schedule.id}
                      schedule={schedule}
                      onDelete={handleDelete}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Completed Schedules */}
            {completedSchedules.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                  Completed ({completedSchedules.length})
                </h2>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {completedSchedules.map((schedule) => (
                    <ScheduleCard
                      key={schedule.id}
                      schedule={schedule}
                      onDelete={handleDelete}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Other Schedules (Failed, Cancelled) */}
            {otherSchedules.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-gray-500" />
                  Other ({otherSchedules.length})
                </h2>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {otherSchedules.map((schedule) => (
                    <ScheduleCard
                      key={schedule.id}
                      schedule={schedule}
                      onDelete={handleDelete}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )
      ) : (
        <EmptyState
          title="No schedules yet"
          description="Create your first schedule to automatically generate content at specific times."
          action={
            <Button onClick={() => setFormOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Schedule
            </Button>
          }
        />
      )}

      <ScheduleForm open={formOpen} onClose={() => setFormOpen(false)} />
    </div>
  )
}
