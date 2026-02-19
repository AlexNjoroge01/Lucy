import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const profile = await prisma.profile.findUnique({
      where: { userId: session.user.id },
    })

    if (!profile) {
      return NextResponse.json(null)
    }

    return NextResponse.json({
      id: profile.id,
      userId: profile.userId,
      bio: profile.bio,
      tagline: profile.tagline,
      skills: profile.skills,
      tone: profile.tone,
      platforms: profile.platforms,
      focusTopics: profile.focusTopics,
      avoidTopics: profile.avoidTopics,
      postsPerDay: profile.postsPerDay,
      generationTime: profile.generationTime,
      timezone: profile.timezone,
    })
  } catch (error) {
    console.error('Error fetching profile:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(request: Request) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      bio,
      tagline,
      skills,
      tone,
      platforms,
      focusTopics,
      avoidTopics,
      postsPerDay,
      generationTime,
      timezone,
    } = body

    const profile = await prisma.profile.upsert({
      where: { userId: session.user.id },
      update: {
        bio: bio ?? '',
        tagline: tagline ?? '',
        skills: skills ?? [],
        tone: tone ?? 'PROFESSIONAL',
        platforms: platforms ?? [],
        focusTopics: focusTopics ?? [],
        avoidTopics: avoidTopics ?? [],
        postsPerDay: postsPerDay ?? 1,
        generationTime: generationTime ?? '07:00',
        timezone: timezone ?? 'Africa/Nairobi',
      },
      create: {
        userId: session.user.id,
        bio: bio ?? '',
        tagline: tagline ?? '',
        skills: skills ?? [],
        tone: tone ?? 'PROFESSIONAL',
        platforms: platforms ?? [],
        focusTopics: focusTopics ?? [],
        avoidTopics: avoidTopics ?? [],
        postsPerDay: postsPerDay ?? 1,
        generationTime: generationTime ?? '07:00',
        timezone: timezone ?? 'Africa/Nairobi',
      },
    })

    return NextResponse.json({
      id: profile.id,
      userId: profile.userId,
      bio: profile.bio,
      tagline: profile.tagline,
      skills: profile.skills,
      tone: profile.tone,
      platforms: profile.platforms,
      focusTopics: profile.focusTopics,
      avoidTopics: profile.avoidTopics,
      postsPerDay: profile.postsPerDay,
      generationTime: profile.generationTime,
      timezone: profile.timezone,
    })
  } catch (error) {
    console.error('Error updating profile:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}
