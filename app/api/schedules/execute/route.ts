import { NextResponse } from 'next/server'
import { ScheduleStatus, type Prisma } from '@prisma/client'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { generateContent } from '@/lib/content-generator'
import type { Platform, ContentType } from '@/types'

const CRON_SECRET = process.env.CRON_SECRET

// POST /api/schedules/execute - Execute pending schedules (called by user or cron)
export async function POST(request: Request) {
  try {
    // Check authorization - either cron secret or authenticated user
    const authHeader = request.headers.get('authorization')
    const isCronAuthorized = authHeader === `Bearer ${CRON_SECRET}`
    
    // If not cron, check for authenticated user
    let userId: string | null = null
    if (!isCronAuthorized) {
      const session = await auth()
      if (!session?.user?.id) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
      }
      userId = session.user.id
    }

    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())

    // Find all active/pending schedules (optionally filtered by user)
    const where: Prisma.ScheduleWhereInput = {
      status: { in: [ScheduleStatus.PENDING, ScheduleStatus.ACTIVE] },
    }
    if (userId) {
      where.userId = userId
    }

    const schedules = await prisma.schedule.findMany({
      where,
      include: {
        project: true,
      },
    })

    const results = []

    for (const schedule of schedules) {
      try {
        // Check if any dates need to be executed today
        const datesToExecute = schedule.scheduledDates.filter((date) => {
          const scheduleDate = new Date(date)
          const scheduleDay = new Date(scheduleDate.getFullYear(), scheduleDate.getMonth(), scheduleDate.getDate())
          
          // Check if this date is today and hasn't been executed
          const isToday = scheduleDay.getTime() === today.getTime()
          const alreadyExecuted = schedule.executedDates.some(
            (executed) => new Date(executed).toDateString() === scheduleDate.toDateString()
          )
          
          return isToday && !alreadyExecuted
        })

        // For recurring schedules, check if today matches the recurrence pattern
        if (schedule.recurrence !== 'NONE' && datesToExecute.length === 0) {
          const shouldRunToday = checkRecurrence(schedule.recurrence, today, schedule.scheduledDates)
          if (shouldRunToday) {
            const alreadyExecuted = schedule.executedDates.some(
              (executed) => new Date(executed).toDateString() === today.toDateString()
            )
            if (!alreadyExecuted) {
              datesToExecute.push(today)
            }
          }
        }

        if (datesToExecute.length === 0) continue

        // Generate content for each platform and content type combination
        const generatedItems = []
        for (const platform of schedule.platforms as Platform[]) {
          for (const contentType of schedule.contentTypes as ContentType[]) {
            try {
              const item = await generateContent(schedule.userId, {
                contentType,
                platform,
                projectId: schedule.projectId,
              })
              generatedItems.push({ platform, contentType, itemId: item.id })
            } catch (error) {
              console.error(`Error generating content for ${platform} ${contentType}:`, error)
            }
          }
        }

        // Update schedule
        const allExecutedDates = [...schedule.executedDates, ...datesToExecute]
        const isCompleted = schedule.recurrence === 'NONE' && 
          allExecutedDates.length >= schedule.scheduledDates.length

        await prisma.schedule.update({
          where: { id: schedule.id },
          data: {
            status: isCompleted ? 'COMPLETED' : 'ACTIVE',
            executedDates: allExecutedDates,
            lastExecutedAt: new Date(),
          },
        })

        results.push({
          scheduleId: schedule.id,
          success: true,
          generatedCount: generatedItems.length,
          items: generatedItems,
        })
      } catch (error) {
        console.error(`Error executing schedule ${schedule.id}:`, error)

        await prisma.schedule.update({
          where: { id: schedule.id },
          data: {
            status: 'FAILED',
            lastExecutedAt: new Date(),
            error: error instanceof Error ? error.message : 'Unknown error',
          },
        })

        results.push({
          scheduleId: schedule.id,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        })
      }
    }

    // Log the execution
    const successful = results.filter((r) => r.success).length
    const totalGenerated = results.reduce((sum, r) => sum + (r.generatedCount || 0), 0)
    
    await prisma.generationLog.create({
      data: {
        triggeredBy: userId ? 'manual' : 'cron',
        itemsCount: totalGenerated,
        success: successful > 0,
        error: successful === 0 && results.length > 0 ? 'All schedules failed' : null,
      },
    })

    return NextResponse.json({
      executed: results.length,
      successful,
      failed: results.length - successful,
      totalGenerated,
      results,
    })
  } catch (error) {
    console.error('Error executing schedules:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}

function checkRecurrence(
  recurrence: string,
  today: Date,
  scheduledDates: Date[]
): boolean {
  if (scheduledDates.length === 0) return false

  const firstDate = new Date(scheduledDates[0])

  switch (recurrence) {
    case 'DAILY':
      return today >= firstDate
    case 'WEEKLY':
      // Check if today is the same day of the week as the first scheduled date
      return today.getDay() === firstDate.getDay() && today >= firstDate
    case 'MONTHLY':
      // Check if today is the same day of the month
      return today.getDate() === firstDate.getDate() && today >= firstDate
    default:
      return false
  }
}