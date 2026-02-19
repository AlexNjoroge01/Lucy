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

// Helper function to check if current time matches the scheduled generation time
function shouldGenerateNow(generationTime: string, timezone: string): boolean {
  try {
    const now = new Date()
    
    // Get current time in user's timezone
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    })
    
    const parts = formatter.formatToParts(now)
    const hourPart = parts.find(p => p.type === 'hour')
    const minutePart = parts.find(p => p.type === 'minute')
    
    if (!hourPart || !minutePart) {
      console.error('Could not parse time parts')
      return true // Default to generating if we can't parse
    }
    
    const currentHour = parseInt(hourPart.value, 10)
    const currentMinute = parseInt(minutePart.value, 10)
    
    // Parse the scheduled time (e.g., "13:00" -> 13, 0)
    const [scheduledHour, scheduledMinute] = generationTime.split(':').map(Number)
    
    console.log(`Time check: current=${currentHour}:${currentMinute}, scheduled=${scheduledHour}:${scheduledMinute}, timezone=${timezone}`)
    
    // Check if we're in the same hour and within a reasonable window
    // The cron runs at minute 0 of every hour, so we check if:
    // 1. The scheduled hour matches the current hour
    // 2. We're within the first 10 minutes of the hour (to allow for some delay)
    if (currentHour === scheduledHour && currentMinute <= 10) {
      return true
    }
    
    // Also check if the scheduled minute is within range
    const scheduledTotalMinutes = scheduledHour * 60 + scheduledMinute
    const currentTotalMinutes = currentHour * 60 + currentMinute
    
    // Allow a 10-minute window around the scheduled time
    return Math.abs(currentTotalMinutes - scheduledTotalMinutes) <= 10
  } catch (error) {
    console.error('Error checking time:', error)
    // If timezone is invalid, default to true (generate anyway)
    return true
  }
}

export async function GET(request: Request) {
  try {
    // Check for manual trigger or cron secret
    const { searchParams } = new URL(request.url)
    const manualTrigger = searchParams.get('manual')
    const authHeader = request.headers.get('authorization')
    
    // Allow manual trigger with secret, or regular cron authorization
    const isManualTrigger = manualTrigger === 'true' && authHeader === `Bearer ${CRON_SECRET}`
    const isCronAuthorized = authHeader === `Bearer ${CRON_SECRET}`
    
    if (!isManualTrigger && !isCronAuthorized) {
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

    // Skip time check for manual triggers
    if (!isManualTrigger) {
      // Check if we should generate at this time
      if (!shouldGenerateNow(profile.generationTime, profile.timezone)) {
        return NextResponse.json({
          generated: 0,
          message: `Not scheduled to generate at this time. Scheduled for ${profile.generationTime} ${profile.timezone}`,
        })
      }
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
        triggeredBy: isManualTrigger ? 'manual' : 'cron',
        itemsCount: generatedItems.length,
        success: generatedItems.length > 0,
        error: generatedItems.length === 0 ? 'No items generated' : null,
      },
    })

    // Send email notification if items were generated
    if (generatedItems.length > 0 && NOTIFICATION_EMAIL) {
      try {
        // Build content preview for email
        const contentPreviews = generatedItems.map((item, index) => {
          const preview = item.body.length > 150 
            ? item.body.substring(0, 150) + '...' 
            : item.body
          return `
            <div style="margin-bottom: 20px; padding: 15px; background-color: #f9fafb; border-radius: 8px; border-left: 4px solid #3b82f6;">
              <p style="margin: 0 0 8px 0; font-weight: 600; color: #374151;">
                ${index + 1}. ${item.type.replace('_', ' ')} for ${item.platform}
              </p>
              <p style="margin: 0; color: #6b7280; font-size: 14px;">
                ${preview}
              </p>
              ${item.imageConcept ? `
                <p style="margin: 8px 0 0 0; color: #9ca3af; font-size: 12px; font-style: italic;">
                  📷 Image concept: ${item.imageConcept}
                </p>
              ` : ''}
            </div>
          `
        }).join('')

        await resend.emails.send({
          from: FROM_EMAIL,
          to: NOTIFICATION_EMAIL,
          subject: `🎯 ${generatedItems.length} new post${generatedItems.length > 1 ? 's' : ''} ready for review`,
          html: `
            <!DOCTYPE html>
            <html>
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
            </head>
            <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #374151; max-width: 600px; margin: 0 auto; padding: 20px;">
              <div style="text-align: center; margin-bottom: 30px;">
                <h1 style="color: #111827; margin-bottom: 8px;">✨ New Content Ready!</h1>
                <p style="color: #6b7280; font-size: 16px;">
                  You have <strong>${generatedItems.length}</strong> new post${generatedItems.length > 1 ? 's' : ''} ready for review in your Lucy dashboard.
                </p>
              </div>
              
              <div style="margin-bottom: 30px;">
                ${contentPreviews}
              </div>
              
              <div style="text-align: center;">
                <a href="${process.env.NEXT_PUBLIC_APP_URL}/queue" 
                   style="display: inline-block; background-color: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: 600;">
                  Review in Dashboard →
                </a>
              </div>
              
              <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center;">
                <p style="color: #9ca3af; font-size: 12px;">
                  This email was sent by Lucy - Your AI Marketing Agent
                </p>
              </div>
            </body>
            </html>
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
