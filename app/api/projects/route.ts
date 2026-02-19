import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const projects = await prisma.project.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(
      projects.map((p) => ({
        id: p.id,
        userId: p.userId,
        name: p.name,
        description: p.description,
        url: p.url,
        techStack: p.techStack,
        status: p.status,
      }))
    )
  } catch (error) {
    console.error('Error fetching projects:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { name, description, url, techStack, status } = body

    if (!name || !description) {
      return NextResponse.json(
        { message: 'Name and description are required' },
        { status: 400 }
      )
    }

    const project = await prisma.project.create({
      data: {
        userId: session.user.id,
        name,
        description,
        url: url || null,
        techStack: techStack || [],
        status: status || 'active',
      },
    })

    return NextResponse.json({
      id: project.id,
      userId: project.userId,
      name: project.name,
      description: project.description,
      url: project.url,
      techStack: project.techStack,
      status: project.status,
    })
  } catch (error) {
    console.error('Error creating project:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}
