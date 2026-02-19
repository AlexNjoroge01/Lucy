import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { resend, FROM_EMAIL, NOTIFICATION_EMAIL } from '@/lib/resend'

const CRON_SECRET = process.env.CRON_SECRET

export async function GET(request: Request) {
  try {
    // Validate cron secret
    const authHeader = request.headers.get('authorization')
    if (!authHeader || authHeader !== `Bearer ${CRON_SECRET}`) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    // Get date from 7 days ago
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    // Query last 7 days of ContentItems grouped by status
    const items = await prisma.contentItem.findMany({
      where: {
        generatedAt: {
          gte: sevenDaysAgo,
        },
      },
    })

    const stats = {
      generated: items.length,
      approved: items.filter((i) => i.status === 'APPROVED').length,
      posted: items.filter((i) => i.status === 'POSTED').length,
      rejected: items.filter((i) => i.status === 'REJECTED').length,
      pending: items.filter((i) => i.status === 'PENDING').length,
    }

    // Send weekly summary email
    if (NOTIFICATION_EMAIL) {
      try {
        await resend.emails.send({
          from: FROM_EMAIL,
          to: NOTIFICATION_EMAIL,
          subject: '📊 Your weekly content summary',
          html: `
            <h1>Weekly Content Summary</h1>
            <p>Here's your content activity from the past 7 days:</p>
            <ul>
              <li><strong>${stats.generated}</strong> posts generated</li>
              <li><strong>${stats.approved}</strong> posts approved</li>
              <li><strong>${stats.posted}</strong> posts published</li>
              <li><strong>${stats.pending}</strong> posts pending review</li>
            </ul>
            <p><a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard">View your dashboard</a></p>
          `,
        })
      } catch (error) {
        console.error('Error sending weekly summary email:', error)
        return NextResponse.json({ sent: false, error: 'Email failed' })
      }
    }

    return NextResponse.json({ sent: true, stats })
  } catch (error) {
    console.error('Weekly summary cron error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}
