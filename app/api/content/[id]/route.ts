import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { deleteImage } from '@/lib/cloudinary'
import type { ContentStatus } from '@/types'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    const item = await prisma.contentItem.findFirst({
      where: { id, userId: session.user.id },
      include: { project: true },
    })

    if (!item) {
      return NextResponse.json({ message: 'Content not found' }, { status: 404 })
    }

    return NextResponse.json({
      id: item.id,
      userId: item.userId,
      projectId: item.projectId,
      type: item.type,
      platform: item.platform,
      body: item.body,
      imageConcept: item.imageConcept,
      status: item.status,
      imageUrl: item.imageUrl,
      imagePublicId: item.imagePublicId,
      generatedAt: item.generatedAt.toISOString(),
      approvedAt: item.approvedAt?.toISOString(),
      postedAt: item.postedAt?.toISOString(),
      project: item.project
        ? {
            id: item.project.id,
            userId: item.project.userId,
            name: item.project.name,
            description: item.project.description,
            url: item.project.url,
            techStack: item.project.techStack,
            status: item.project.status,
          }
        : null,
    })
  } catch (error) {
    console.error('Error fetching content item:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}

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

    // Verify content belongs to user
    const existingItem = await prisma.contentItem.findFirst({
      where: { id, userId: session.user.id },
    })

    if (!existingItem) {
      return NextResponse.json({ message: 'Content not found' }, { status: 404 })
    }

    const updateData: {
      body?: string
      status?: ContentStatus
      imageUrl?: string | null
      imagePublicId?: string | null
      approvedAt?: Date
      postedAt?: Date
    } = {}

    if (body.body !== undefined) {
      updateData.body = body.body
    }
    if (body.status !== undefined) {
      updateData.status = body.status

      // Set timestamps based on status
      if (body.status === 'APPROVED') {
        updateData.approvedAt = new Date()
      } else if (body.status === 'POSTED') {
        updateData.postedAt = new Date()
      }
    }
    if (body.imageUrl !== undefined) {
      updateData.imageUrl = body.imageUrl
    }
    if (body.imagePublicId !== undefined) {
      updateData.imagePublicId = body.imagePublicId
    }

    const item = await prisma.contentItem.update({
      where: { id },
      data: updateData,
      include: { project: true },
    })

    return NextResponse.json({
      id: item.id,
      userId: item.userId,
      projectId: item.projectId,
      type: item.type,
      platform: item.platform,
      body: item.body,
      imageConcept: item.imageConcept,
      status: item.status,
      imageUrl: item.imageUrl,
      imagePublicId: item.imagePublicId,
      generatedAt: item.generatedAt.toISOString(),
      approvedAt: item.approvedAt?.toISOString(),
      postedAt: item.postedAt?.toISOString(),
      project: item.project
        ? {
            id: item.project.id,
            userId: item.project.userId,
            name: item.project.name,
            description: item.project.description,
            url: item.project.url,
            techStack: item.project.techStack,
            status: item.project.status,
          }
        : null,
    })
  } catch (error) {
    console.error('Error updating content item:', error)
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

    // Verify content belongs to user
    const existingItem = await prisma.contentItem.findFirst({
      where: { id, userId: session.user.id },
    })

    if (!existingItem) {
      return NextResponse.json({ message: 'Content not found' }, { status: 404 })
    }

    // Delete image from Cloudinary if exists
    if (existingItem.imagePublicId) {
      try {
        await deleteImage(existingItem.imagePublicId)
      } catch (error) {
        console.error('Error deleting image from Cloudinary:', error)
        // Continue with deletion even if image deletion fails
      }
    }

    await prisma.contentItem.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting content item:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}
