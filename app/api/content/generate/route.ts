import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { generateContent } from '@/lib/content-generator'
import type { ContentType, Platform } from '@/types'

export async function POST(request: Request) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { contentType, platform, projectId } = body

    if (!contentType || !platform) {
      return NextResponse.json(
        { message: 'Content type and platform are required' },
        { status: 400 }
      )
    }

    const contentItem = await generateContent(session.user.id, {
      contentType: contentType as ContentType,
      platform: platform as Platform,
      projectId,
    })

    return NextResponse.json(contentItem)
  } catch (error) {
    console.error('Error generating content:', error)
    if (error instanceof Error) {
      return NextResponse.json({ message: error.message }, { status: 400 })
    }
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}
