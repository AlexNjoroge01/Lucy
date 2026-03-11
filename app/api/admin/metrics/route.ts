import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import type { Platform } from '@/types'

// Helper to check if user is admin
async function checkAdmin(session: { user?: { roles?: string[] } }) {
  if (!session?.user?.roles?.includes('ADMIN')) {
    return false
  }
  return true
}

export async function GET() {
  try {
    const session = await auth()

    if (!session?.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    if (!(await checkAdmin(session))) {
      return NextResponse.json({ message: 'Forbidden - Admin access required' }, { status: 403 })
    }

    // Calculate date ranges
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
    const monthAgo = new Date(today.getFullYear(), today.getMonth() - 1, today.getDate())

    // User metrics
    const totalUsers = await prisma.user.count()
    const newUsersToday = await prisma.user.count({
      where: { createdAt: { gte: today } },
    })
    const newUsersThisWeek = await prisma.user.count({
      where: { createdAt: { gte: weekAgo } },
    })
    const newUsersThisMonth = await prisma.user.count({
      where: { createdAt: { gte: monthAgo } },
    })

    // Get users who logged in today (using sessions as proxy)
    const activeSessionsToday = await prisma.session.count({
      where: { expires: { gte: now } },
    })

    // Content metrics
    const totalContent = await prisma.contentItem.count()
    const contentByStatus = {
      PENDING: await prisma.contentItem.count({ where: { status: 'PENDING' } }),
      APPROVED: await prisma.contentItem.count({ where: { status: 'APPROVED' } }),
      POSTED: await prisma.contentItem.count({ where: { status: 'POSTED' } }),
      REJECTED: await prisma.contentItem.count({ where: { status: 'REJECTED' } }),
    }

    // Content by platform
    const platforms: Platform[] = [
      'X',
      'LINKEDIN',
      'FACEBOOK',
      'TIKTOK',
      'MEDIUM',
      'INSTAGRAM',
      'YOUTUBE',
      'WHATSAPP',
      'REDDIT',
    ]
    const contentByPlatform: Record<Platform, number> = {} as Record<Platform, number>
    for (const platform of platforms) {
      contentByPlatform[platform] = await prisma.contentItem.count({
        where: { platform },
      })
    }

    const contentCreatedToday = await prisma.contentItem.count({
      where: { generatedAt: { gte: today } },
    })
    const contentCreatedThisWeek = await prisma.contentItem.count({
      where: { generatedAt: { gte: weekAgo } },
    })
    const contentCreatedThisMonth = await prisma.contentItem.count({
      where: { generatedAt: { gte: monthAgo } },
    })

    // Project metrics
    const totalProjects = await prisma.project.count()
    const activeProjects = await prisma.project.count({
      where: { status: 'active' },
    })
    const projectsCreatedThisMonth = await prisma.project.count({
      where: { createdAt: { gte: monthAgo } },
    })

    // Schedule metrics
    const totalSchedules = await prisma.schedule.count()
    const schedulesByStatus = {
      PENDING: await prisma.schedule.count({ where: { status: 'PENDING' } }),
      ACTIVE: await prisma.schedule.count({ where: { status: 'ACTIVE' } }),
      COMPLETED: await prisma.schedule.count({ where: { status: 'COMPLETED' } }),
      FAILED: await prisma.schedule.count({ where: { status: 'FAILED' } }),
      CANCELLED: await prisma.schedule.count({ where: { status: 'CANCELLED' } }),
    }

    // Audit log metrics
    const totalAuditLogs = await prisma.auditLog.count()
    const auditLogsToday = await prisma.auditLog.count({
      where: { createdAt: { gte: today } },
    })

    // Get last cron run from audit logs
    const lastCronLog = await prisma.auditLog.findFirst({
      where: {
        action: 'CRON_RUN',
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({
      metrics: {
        totalUsers,
        newUsersToday,
        newUsersThisWeek,
        newUsersThisMonth,
        activeUsersToday: activeSessionsToday,
        totalContent,
        contentByStatus,
        contentByPlatform,
        contentCreatedToday,
        contentCreatedThisWeek,
        contentCreatedThisMonth,
        totalProjects,
        activeProjects,
        projectsCreatedThisMonth,
        totalSchedules,
        schedulesByStatus,
        totalAuditLogs,
        auditLogsToday,
        lastCronRun: lastCronLog?.createdAt?.toISOString() || null,
      },
    })
  } catch (error) {
    console.error('Admin metrics error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}
