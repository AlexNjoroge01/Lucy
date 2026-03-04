'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { useProjects } from '@/hooks/useProjects'
import { useCreateSchedule } from '@/hooks/useSchedules'
import { Loader2, Calendar, X, Check } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import type { Platform, ContentType, RecurrenceType } from '@/types'

const platforms: { value: Platform; label: string }[] = [
  { value: 'X', label: 'X (Twitter)' },
  { value: 'LINKEDIN', label: 'LinkedIn' },
  { value: 'FACEBOOK', label: 'Facebook' },
  { value: 'TIKTOK', label: 'TikTok' },
  { value: 'INSTAGRAM', label: 'Instagram' },
  { value: 'YOUTUBE', label: 'YouTube' },
  { value: 'MEDIUM', label: 'Medium' },
]

const contentTypes: { value: ContentType; label: string }[] = [
  { value: 'SHORT_POST', label: 'Short Post' },
  { value: 'LONG_POST', label: 'Long Post' },
  { value: 'ARTICLE', label: 'Article' },
  { value: 'THREAD', label: 'Thread' },
  { value: 'IMAGE_CAPTION', label: 'Image Caption' },
]

const recurrenceOptions: { value: RecurrenceType; label: string }[] = [
  { value: 'NONE', label: 'One-time' },
  { value: 'DAILY', label: 'Daily' },
  { value: 'WEEKLY', label: 'Weekly' },
  { value: 'MONTHLY', label: 'Monthly' },
]

interface ScheduleFormProps {
  open: boolean
  onClose: () => void
}

export function ScheduleForm({ open, onClose }: ScheduleFormProps) {
  const { data: projects, isLoading: projectsLoading } = useProjects()
  const createSchedule = useCreateSchedule()

  const [projectId, setProjectId] = useState('')
  const [selectedPlatforms, setSelectedPlatforms] = useState<Platform[]>(['X'])
  const [selectedContentTypes, setSelectedContentTypes] = useState<ContentType[]>(['SHORT_POST'])
  const [selectedDates, setSelectedDates] = useState<string[]>([])
  const [timeOfDay, setTimeOfDay] = useState('09:00')
  const [recurrence, setRecurrence] = useState<RecurrenceType>('NONE')
  const [currentMonth, setCurrentMonth] = useState(new Date())

  const togglePlatform = (platform: Platform) => {
    setSelectedPlatforms((prev) =>
      prev.includes(platform)
        ? prev.filter((p) => p !== platform)
        : [...prev, platform]
    )
  }

  const toggleContentType = (type: ContentType) => {
    setSelectedContentTypes((prev) =>
      prev.includes(type)
        ? prev.filter((t) => t !== type)
        : [...prev, type]
    )
  }

  const toggleDate = (dateStr: string) => {
    setSelectedDates((prev) =>
      prev.includes(dateStr)
        ? prev.filter((d) => d !== dateStr)
        : [...prev, dateStr]
    )
  }

  const generateCalendarDays = () => {
    const year = currentMonth.getFullYear()
    const month = currentMonth.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()

    const days: { date: number; dateStr: string; isCurrentMonth: boolean }[] = []

    // Previous month days
    const prevMonthLastDay = new Date(year, month, 0).getDate()
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      const date = new Date(year, month - 1, prevMonthLastDay - i)
      days.push({
        date: prevMonthLastDay - i,
        dateStr: date.toISOString().split('T')[0],
        isCurrentMonth: false,
      })
    }

    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
      const dateStr = new Date(year, month, i).toISOString().split('T')[0]
      days.push({ date: i, dateStr, isCurrentMonth: true })
    }

    // Next month days
    const remainingDays = 42 - days.length
    for (let i = 1; i <= remainingDays; i++) {
      const date = new Date(year, month + 1, i)
      days.push({
        date: i,
        dateStr: date.toISOString().split('T')[0],
        isCurrentMonth: false,
      })
    }

    return days
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!projectId) {
      toast.error('Please select a project')
      return
    }

    if (selectedPlatforms.length === 0) {
      toast.error('Please select at least one platform')
      return
    }

    if (selectedContentTypes.length === 0) {
      toast.error('Please select at least one content type')
      return
    }

    if (selectedDates.length === 0) {
      toast.error('Please select at least one date')
      return
    }

    // Create date objects with the selected time
    const scheduledDates = selectedDates.map((dateStr) => {
      const [hours, minutes] = timeOfDay.split(':')
      const date = new Date(dateStr)
      date.setHours(parseInt(hours), parseInt(minutes))
      return date.toISOString()
    })

    // Ensure at least one date is in the future (for non-recurring)
    const now = new Date()
    if (recurrence === 'NONE' && scheduledDates.every((d) => new Date(d) <= now)) {
      toast.error('At least one scheduled date must be in the future')
      return
    }

    try {
      await createSchedule.mutateAsync({
        projectId,
        platforms: selectedPlatforms,
        contentTypes: selectedContentTypes,
        scheduledDates,
        timeOfDay,
        recurrence,
      })
      toast.success('Schedule created successfully')
      handleClose()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to create schedule')
    }
  }

  const handleClose = () => {
    setProjectId('')
    setSelectedPlatforms(['X'])
    setSelectedContentTypes(['SHORT_POST'])
    setSelectedDates([])
    setTimeOfDay('09:00')
    setRecurrence('NONE')
    setCurrentMonth(new Date())
    onClose()
  }

  const calendarDays = generateCalendarDays()
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[650px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Create Schedule
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Project Selection */}
          <div className="space-y-2">
            <Label htmlFor="project">Project</Label>
            <Select
              value={projectId}
              onValueChange={setProjectId}
              disabled={projectsLoading}
            >
              <SelectTrigger id="project">
                <SelectValue placeholder="Select a project" />
              </SelectTrigger>
              <SelectContent>
                {projects?.map((project) => (
                  <SelectItem key={project.id} value={project.id}>
                    {project.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Platform Selection */}
          <div className="space-y-2">
            <Label>Platforms</Label>
            <div className="flex flex-wrap gap-2">
              {platforms.map((p) => (
                <Badge
                  key={p.value}
                  variant={selectedPlatforms.includes(p.value) ? 'default' : 'outline'}
                  className="cursor-pointer"
                  onClick={() => togglePlatform(p.value)}
                >
                  {selectedPlatforms.includes(p.value) && (
                    <Check className="h-3 w-3 mr-1" />
                  )}
                  {p.label}
                </Badge>
              ))}
            </div>
          </div>

          {/* Content Type Selection */}
          <div className="space-y-2">
            <Label>Content Types</Label>
            <div className="flex flex-wrap gap-2">
              {contentTypes.map((t) => (
                <Badge
                  key={t.value}
                  variant={selectedContentTypes.includes(t.value) ? 'default' : 'outline'}
                  className="cursor-pointer"
                  onClick={() => toggleContentType(t.value)}
                >
                  {selectedContentTypes.includes(t.value) && (
                    <Check className="h-3 w-3 mr-1" />
                  )}
                  {t.label}
                </Badge>
              ))}
            </div>
          </div>

          {/* Calendar */}
          <div className="space-y-2">
            <Label>Select Dates</Label>
            <div className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
                >
                  ←
                </Button>
                <span className="font-semibold">
                  {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
                </span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
                >
                  →
                </Button>
              </div>
              <div className="grid grid-cols-7 gap-1 text-center text-xs text-muted-foreground mb-2">
                {weekDays.map((day) => (
                  <div key={day}>{day}</div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-1">
                {calendarDays.map((day, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => day.isCurrentMonth && toggleDate(day.dateStr)}
                    disabled={!day.isCurrentMonth}
                    className={cn(
                      'h-8 w-8 rounded text-sm flex items-center justify-center',
                      !day.isCurrentMonth && 'text-muted-foreground/30',
                      day.isCurrentMonth && 'hover:bg-accent cursor-pointer',
                      selectedDates.includes(day.dateStr) && 'bg-primary text-primary-foreground hover:bg-primary/90',
                      day.isCurrentMonth &&
                        day.dateStr === new Date().toISOString().split('T')[0] &&
                        'border border-primary'
                    )}
                  >
                    {day.date}
                  </button>
                ))}
              </div>
            </div>
            {selectedDates.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {selectedDates.sort().map((date) => (
                  <Badge key={date} variant="secondary" className="gap-1">
                    {new Date(date).toLocaleDateString()}
                    <X
                      className="h-3 w-3 cursor-pointer"
                      onClick={() => toggleDate(date)}
                    />
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Time and Recurrence */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="time">Time of Day</Label>
              <input
                type="time"
                id="time"
                value={timeOfDay}
                onChange={(e) => setTimeOfDay(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="recurrence">Recurrence</Label>
              <Select value={recurrence} onValueChange={(v: RecurrenceType) => setRecurrence(v)}>
                <SelectTrigger id="recurrence">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {recurrenceOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={createSchedule.isPending}>
              {createSchedule.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Create Schedule
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
