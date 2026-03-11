import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// DELETE /api/schedules/[id] - Cancel/delete a schedule
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const { id } = params

    // Verify the schedule belongs to the user
    const schedule = await prisma.schedule.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
    })

    if (!schedule) {
      return NextResponse.json(
        { message: 'Schedule not found' },
        { status: 404 }
      )
    }

    // Only allow cancelling pending schedules
    if (schedule.status !== 'PENDING') {
      return NextResponse.json(
        { message: 'Can only cancel pending schedules' },
        { status: 400 }
      )
    }

    await prisma.schedule.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting schedule:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}