import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { generateContent } from '@/lib/content-generator'
import { resend, FROM_EMAIL, NOTIFICATION_EMAIL } from '@/lib/resend'
import type { ContentType, Platform } from '@/types'

const CRON_SECRET = process.env.CRON_SECRET

// Content types and platforms to rotate through
const contentTypes: ContentType[] = [
  'SHORT_POST',
  'LONG_POST',
  'ARTICLE',
  'THREAD',
  'IMAGE_CAPTION',
]
const platforms: Platform[] = ['X', 'LINKEDIN']

export async function GET(request: Request) {
  try {
    // Validate cron secret
    const authHeader = request.headers.get('authorization')
    if (!authHeader || authHeader !== `Bearer ${CRON_SECRET}`) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    // Get the single user (this is a single-user app)
    const user = await prisma.user.findFirst()

    if (!user) {
      return NextResponse.json({ message: 'No user found' }, { status: 400 })
    }

    // Get user's profile
    const profile = await prisma.profile.findUnique({
      where: { userId: user.id },
    })

    if (!profile) {
      return NextResponse.json(
        { message: 'User profile not found' },
        { status: 400 }
      )
    }

    // Count pending items
    const pendingCount = await prisma.contentItem.count({
      where: { userId: user.id, status: 'PENDING' },
    })

    // Calculate how many to generate
    const threshold = 3
    if (pendingCount >= threshold) {
      return NextResponse.json({
        generated: 0,
        message: 'Pending items already at threshold',
      })
    }

    const toGenerate = Math.min(threshold - pendingCount, profile.postsPerDay)
    const generatedItems = []

    for (let i = 0; i < toGenerate; i++) {
      // Rotate through content types and platforms
      const contentType = contentTypes[i % contentTypes.length]
      const platform = platforms[i % platforms.length]

      try {
        const item = await generateContent(user.id, {
          contentType,
          platform,
        })
        generatedItems.push(item)
      } catch (error) {
        console.error(`Error generating content ${i + 1}:`, error)
      }
    }

    // Log the generation
    await prisma.generationLog.create({
      data: {
        triggeredBy: 'cron',
        itemsCount: generatedItems.length,
        success: generatedItems.length > 0,
        error: generatedItems.length === 0 ? 'No items generated' : null,
      },
    })

    // Send email notification if items were generated
    if (generatedItems.length > 0 && NOTIFICATION_EMAIL) {
      try {
        await resend.emails.send({
          from: FROM_EMAIL,
          to: NOTIFICATION_EMAIL,
          subject: `🎯 ${generatedItems.length} new posts ready for review`,
          html: `
            <h1>New Content Ready!</h1>
            <p>You have ${generatedItems.length} new post(s) ready for review in your Lucy dashboard.</p>
            <p><a href="${process.env.NEXT_PUBLIC_APP_URL}/queue">View your content queue</a></p>
          `,
        })
      } catch (error) {
        console.error('Error sending email notification:', error)
      }
    }

    return NextResponse.json({
      generated: generatedItems.length,
      items: generatedItems,
    })
  } catch (error) {
    console.error('Cron generate error:', error)

    // Log the error
    await prisma.generationLog.create({
      data: {
        triggeredBy: 'cron',
        itemsCount: 0,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
    })

    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}
