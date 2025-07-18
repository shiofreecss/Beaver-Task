import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-convex'
// import { prisma } from '@/lib/prisma'

// TODO: Refactor this endpoint to use Convex instead of Prisma.
// All code using 'prisma' is commented out below

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    // const sessions = await prisma.pomodoroSession.findMany({
    //   where: {
    //     userId: session.user.id as string
    //   },
    //   orderBy: {
    //     createdAt: 'desc'
    //   }
    // })

    // return NextResponse.json(sessions)
    return new NextResponse('Prisma functionality is disabled', { status: 501 })
  } catch (error) {
    console.error('Error fetching pomodoro sessions:', error)
    return new NextResponse('Internal Error', { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const body = await req.json()
    const { duration, type = 'FOCUS', taskId = null } = body

    if (!duration) {
      return new NextResponse('Duration is required', { status: 400 })
    }

    // const pomodoroSession = await prisma.pomodoroSession.create({
    //   data: {
    //     duration,
    //     type,
    //     taskId,
    //     userId: session.user.id as string,
    //     startTime: new Date()
    //   }
    // })

    // return NextResponse.json(pomodoroSession)
    return new NextResponse('Prisma functionality is disabled', { status: 501 })
  } catch (error) {
    console.error('Error creating pomodoro session:', error)
    return new NextResponse('Internal Error', { status: 500 })
  }
}

export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const body = await req.json()
    const { id, completed = true } = body

    if (!id) {
      return new NextResponse('Session ID is required', { status: 400 })
    }

    // First check if the session exists and belongs to the user
    // const existingSession = await prisma.pomodoroSession.findUnique({
    //   where: {
    //     id,
    //     userId: session.user.id as string
    //   }
    // })

    // if (!existingSession) {
    //   return new NextResponse('Session not found', { status: 404 })
    // }

    // const pomodoroSession = await prisma.pomodoroSession.update({
    //   where: {
    //     id,
    //     userId: session.user.id as string
    //   },
    //   data: {
    //     completed,
    //     endTime: completed ? new Date() : null
    //   }
    // })

    // return NextResponse.json(pomodoroSession)
    return new NextResponse('Prisma functionality is disabled', { status: 501 })
  } catch (error) {
    console.error('Error updating pomodoro session:', error)
    return new NextResponse('Internal Error', { status: 500 })
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')

    if (!id) {
      return new NextResponse('Session ID is required', { status: 400 })
    }

    // await prisma.pomodoroSession.delete({
    //   where: {
    //     id,
    //     userId: session.user.id as string
    //   }
    // })

    // return new NextResponse(null, { status: 204 })
    return new NextResponse('Prisma functionality is disabled', { status: 501 })
  } catch (error) {
    console.error('Error deleting pomodoro session:', error)
    return new NextResponse('Internal Error', { status: 500 })
  }
} 