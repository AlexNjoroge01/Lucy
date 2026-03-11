import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// Helper to check if user is admin
async function checkAdmin(session: { user?: { roles?: string[] } }) {
  return session?.user?.roles?.includes('ADMIN') || false
}

// Get all roles
export async function GET() {
  try {
    const session = await auth()

    if (!session?.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    if (!(await checkAdmin(session))) {
      return NextResponse.json({ message: 'Forbidden - Admin access required' }, { status: 403 })
    }

    const roles = await prisma.role.findMany({
      orderBy: { name: 'asc' },
      include: {
        _count: {
          select: { users: true },
        },
      },
    })

    return NextResponse.json({
      roles: roles.map((role) => ({
        id: role.id,
        name: role.name,
        description: role.description,
        permissions: role.permissions,
        userCount: role._count.users,
        createdAt: role.createdAt.toISOString(),
        updatedAt: role.updatedAt.toISOString(),
      })),
    })
  } catch (error) {
    console.error('Admin roles error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Create or update a role
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
    const { name, description, permissions } = body

    if (!name || !Array.isArray(permissions)) {
      return NextResponse.json(
        { message: 'Role name and permissions array are required' },
        { status: 400 }
      )
    }

    // Upsert the role
    const role = await prisma.role.upsert({
      where: { name },
      update: {
        description,
        permissions,
      },
      create: {
        name,
        description,
        permissions,
      },
    })

    // Create audit log
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: 'CREATE_ROLE',
        entity: 'Role',
        entityId: role.id,
        details: JSON.stringify({ name, description, permissions }),
      },
    })

    return NextResponse.json({
      role: {
        id: role.id,
        name: role.name,
        description: role.description,
        permissions: role.permissions,
      },
    })
  } catch (error) {
    console.error('Admin create role error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}
