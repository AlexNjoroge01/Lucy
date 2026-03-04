import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import type { ScheduleStatus, Platform, ContentType, RecurrenceType } from '@/types'

// GET /api/schedules - Get all schedules for the current user
export async function GET(request: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') as ScheduleStatus | null

    const where: { userId: string; status?: ScheduleStatus } = { userId: session.user.id }
    if (status) {
      where.status = status
    }

    const schedules = await prisma.schedule.findMany({
      where,
      include: {
        project: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json({
      schedules: schedules.map((schedule) => ({
        id: schedule.id,
        userId: schedule.userId,
        projectId: schedule.projectId,
        platforms: schedule.platforms as Platform[],
        contentTypes: schedule.contentTypes as ContentType[],
        scheduledDates: schedule.scheduledDates.map((d) => d.toISOString()),
        timeOfDay: schedule.timeOfDay,
        status: schedule.status as ScheduleStatus,
        recurrence: schedule.recurrence as RecurrenceType,
        createdAt: schedule.createdAt.toISOString(),
        executedDates: schedule.executedDates.map((d) => d.toISOString()),
        lastExecutedAt: schedule.lastExecutedAt?.toISOString() || null,
        error: schedule.error,
        project: schedule.project
          ? {
              id: schedule.project.id,
              userId: schedule.project.userId,
              name: schedule.project.name,
              description: schedule.project.description,
              url: schedule.project.url || undefined,
              techStack: schedule.project.techStack,
              status: schedule.project.status,
            }
          : undefined,
      })),
    })
  } catch (error) {
    console.error('Error fetching schedules:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/schedules - Create a new schedule
export async function POST(request: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { projectId, platforms, contentTypes, scheduledDates, timeOfDay, recurrence } = body

    // Validate required fields
    if (!projectId || !platforms?.length || !contentTypes?.length || !scheduledDates?.length || !timeOfDay) {
      return NextResponse.json(
        { message: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Validate project belongs to user
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        userId: session.user.id,
      },
    })

    if (!project) {
      return NextResponse.json(
        { message: 'Project not found' },
        { status: 404 }
      )
    }

    // Parse and validate dates
    const parsedDates = scheduledDates.map((date: string) => new Date(date))
    const invalidDates = parsedDates.filter((d: Date) => isNaN(d.getTime()))
    if (invalidDates.length > 0) {
      return NextResponse.json(
        { message: 'Invalid scheduled dates' },
        { status: 400 }
      )
    }

    // Ensure at least one date is in the future (for non-recurring)
    const now = new Date()
    if (recurrence === 'NONE' && parsedDates.every((d: Date) => d <= now)) {
      return NextResponse.json(
        { message: 'At least one scheduled date must be in the future' },
        { status: 400 }
      )
    }

    const schedule = await prisma.schedule.create({
      data: {
        userId: session.user.id,
        projectId,
        platforms,
        contentTypes,
        scheduledDates: parsedDates,
        timeOfDay,
        status: 'PENDING',
        recurrence: recurrence || 'NONE',
        executedDates: [],
      },
      include: {
        project: true,
      },
    })

    return NextResponse.json({
      schedule: {
        id: schedule.id,
        userId: schedule.userId,
        projectId: schedule.projectId,
        platforms: schedule.platforms as Platform[],
        contentTypes: schedule.contentTypes as ContentType[],
        scheduledDates: schedule.scheduledDates.map((d) => d.toISOString()),
        timeOfDay: schedule.timeOfDay,
        status: schedule.status as ScheduleStatus,
        recurrence: schedule.recurrence as RecurrenceType,
        createdAt: schedule.createdAt.toISOString(),
        executedDates: schedule.executedDates.map((d) => d.toISOString()),
        lastExecutedAt: schedule.lastExecutedAt?.toISOString() || null,
        error: null,
        project: schedule.project
          ? {
              id: schedule.project.id,
              userId: schedule.project.userId,
              name: schedule.project.name,
              description: schedule.project.description,
              url: schedule.project.url || undefined,
              techStack: schedule.project.techStack,
              status: schedule.project.status,
            }
          : undefined,
      },
    })
  } catch (error) {
    console.error('Error creating schedule:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}