import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import type { ContentStatus, Platform, ContentType } from '@/types'

export async function GET(request: Request) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') as ContentStatus | 'ALL' | null
    const platform = searchParams.get('platform') as Platform | 'ALL' | null
    const type = searchParams.get('type') as ContentType | 'ALL' | null
    const page = parseInt(searchParams.get('page') || '1', 10)
    const limit = parseInt(searchParams.get('limit') || '10', 10)

    const where: {
      userId: string
      status?: ContentStatus
      platform?: Platform
      type?: ContentType
    } = {
      userId: session.user.id,
    }

    if (status && status !== 'ALL') {
      where.status = status
    }
    if (platform && platform !== 'ALL') {
      where.platform = platform
    }
    if (type && type !== 'ALL') {
      where.type = type
    }

    const [items, total] = await Promise.all([
      prisma.contentItem.findMany({
        where,
        include: {
          project: true,
        },
        orderBy: { generatedAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.contentItem.count({ where }),
    ])

    return NextResponse.json({
      items: items.map((item) => ({
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
      })),
      total,
      page,
    })
  } catch (error) {
    console.error('Error fetching content:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}
