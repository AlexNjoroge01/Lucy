import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

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
    const limit = parseInt(searchParams.get('limit') || '20')
    const search = searchParams.get('search') || ''
    const role = searchParams.get('role') || ''

    const skip = (page - 1) * limit

    // Build where clause
    const where: any = {}

    if (search) {
      where.OR = [
        { email: { contains: search, mode: 'insensitive' } },
        { name: { contains: search, mode: 'insensitive' } },
      ]
    }

    if (role) {
      where.roles = {
        some: {
          role: {
            name: role,
          },
        },
      }
    }

    // Get users with their roles and counts
    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          roles: {
            include: {
              role: true,
            },
          },
          _count: {
            select: {
              contentItems: true,
              projects: true,
              schedules: true,
            },
          },
        },
      }),
      prisma.user.count({ where }),
    ])

    // Format users for response
    const formattedUsers = users.map((user) => ({
      id: user.id,
      email: user.email,
      name: user.name,
      image: user.image,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
      roles: user.roles.map((ur) => ({
        id: ur.role.id,
        name: ur.role.name,
        description: ur.role.description,
      })),
      _count: user._count,
    }))

    return NextResponse.json({
      users: formattedUsers,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    })
  } catch (error) {
    console.error('Admin users error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Update user roles
export async function PATCH(request: Request) {
  try {
    const session = await auth()

    if (!session?.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    if (!(await checkAdmin(session))) {
      return NextResponse.json({ message: 'Forbidden - Admin access required' }, { status: 403 })
    }

    const body = await request.json()
    const { userId, roles } = body

    if (!userId || !Array.isArray(roles)) {
      return NextResponse.json(
        { message: 'User ID and roles array are required' },
        { status: 400 }
      )
    }

    // Get current user roles
    const currentRoles = await prisma.userRole.findMany({
      where: { userId },
      include: { role: true },
    })

    const currentRoleNames = currentRoles.map((ur) => ur.role.name)

    // Roles to add
    const rolesToAdd = roles.filter((r) => !currentRoleNames.includes(r))
    // Roles to remove
    const rolesToRemove = currentRoles.filter((ur) => !roles.includes(ur.role.name))

    // Perform updates in a transaction
    await prisma.$transaction([
      // Remove roles
      ...rolesToRemove.map((ur) =>
        prisma.userRole.delete({
          where: { id: ur.id },
        })
      ),
      // Add new roles
      ...rolesToAdd.map((roleName) =>
        prisma.userRole.create({
          data: {
            user: {
              connect: { id: userId },
            },
            role: {
              connect: { name: roleName },
            },
          },
        })
      ),
      // Create audit log
      prisma.auditLog.create({
        data: {
          userId: session.user.id,
          action: 'UPDATE_USER_ROLES',
          entity: 'User',
          entityId: userId,
          details: JSON.stringify({
            previousRoles: currentRoleNames,
            newRoles: roles,
            added: rolesToAdd,
            removed: rolesToRemove.map((ur) => ur.role.name),
          }),
        },
      }),
    ])

    return NextResponse.json({
      message: 'User roles updated successfully',
      userId,
      roles,
    })
  } catch (error) {
    console.error('Admin update user roles error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}
