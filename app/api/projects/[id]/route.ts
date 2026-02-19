import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()

    // Verify project belongs to user
    const existingProject = await prisma.project.findFirst({
      where: { id, userId: session.user.id },
    })

    if (!existingProject) {
      return NextResponse.json({ message: 'Project not found' }, { status: 404 })
    }

    const project = await prisma.project.update({
      where: { id },
      data: {
        name: body.name,
        description: body.description,
        url: body.url,
        techStack: body.techStack,
        status: body.status,
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
    console.error('Error updating project:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    // Verify project belongs to user
    const existingProject = await prisma.project.findFirst({
      where: { id, userId: session.user.id },
    })

    if (!existingProject) {
      return NextResponse.json({ message: 'Project not found' }, { status: 404 })
    }

    await prisma.project.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting project:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}
