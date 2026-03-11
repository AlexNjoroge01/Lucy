import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import type { Prisma } from '@prisma/client'

// Helper to check if user is admin
async function checkAdmin(session: { user?: { roles?: string[] } }) {
  return session?.user?.roles?.includes('ADMIN') || false
}

export async function GET(request: Request) {
  try {
    const session = await auth()

    if (!session?.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    if (!(await checkAdmin(session))) {
      return NextResponse.json({ message: 'Forbidden - Admin access required' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const action = searchParams.get('action') || ''
    const entity = searchParams.get('entity') || ''
    const userId = searchParams.get('userId') || ''
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    const skip = (page - 1) * limit

    // Build where clause
    const where: Prisma.AuditLogWhereInput = {}

    if (action) {
      where.action = action
    }

    if (entity) {
      where.entity = entity
    }

    if (userId) {
      where.userId = userId
    }

    if (startDate || endDate) {
      where.createdAt = {}
      if (startDate) {
        where.createdAt.gte = new Date(startDate)
      }
      if (endDate) {
        where.createdAt.lte = new Date(endDate)
      }
    }

    // Get audit logs with user info
    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              name: true,
            },
          },
        },
      }),
      prisma.auditLog.count({ where }),
    ])

    // Format logs for response
    const formattedLogs = logs.map((log) => ({
      id: log.id,
      userId: log.userId,
      action: log.action,
      entity: log.entity,
      entityId: log.entityId,
      details: log.details,
      ipAddress: log.ipAddress,
      userAgent: log.userAgent,
      createdAt: log.createdAt.toISOString(),
      user: log.user,
    }))

    return NextResponse.json({
      logs: formattedLogs,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    })
  } catch (error) {
    console.error('Admin audit logs error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Create audit log entry (used internally by other services)
export async function POST(request: Request) {
  try {
    const session = await auth()

    if (!session?.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    if (!(await checkAdmin(session))) {
      return NextResponse.json({ message: 'Forbidden - Admin access required' }, { status: 403 })
    }

    const body = await request.json()
    const { action, entity, entityId, details, ipAddress, userAgent } = body

    if (!action || !entity) {
      return NextResponse.json(
        { message: 'Action and entity are required' },
        { status: 400 }
      )
    }

    const log = await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action,
        entity,
        entityId,
        details: details ? JSON.stringify(details) : null,
        ipAddress,
        userAgent,
      },
    })

    return NextResponse.json({
      log: {
        id: log.id,
        action: log.action,
        entity: log.entity,
        createdAt: log.createdAt.toISOString(),
      },
    })
  } catch (error) {
    console.error('Admin create audit log error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}
