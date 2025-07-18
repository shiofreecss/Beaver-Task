import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-convex'
import { convexHttp } from '@/lib/convex'
import { api } from '../../../../convex/_generated/api'
import * as z from 'zod'

const pomodoroSessionSchema = z.object({
  duration: z.number().min(1, 'Duration must be at least 1 minute'),
  type: z.enum(['FOCUS', 'SHORT_BREAK', 'LONG_BREAK']).default('FOCUS'),
  taskId: z.string().optional(),
  projectId: z.string().optional(),
})

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Ensure user exists in Convex database
    const convexUserId = await convexHttp.mutation(api.users.findOrCreateUser, {
      id: session.user.id,
      name: session.user.name || 'Unknown User',
      email: session.user.email || '',
    })

    const sessions = await convexHttp.query(api.pomodoro.getUserPomodoroSessions, {
      userId: convexUserId
    })

    return NextResponse.json(sessions)
  } catch (error) {
    console.error('Error fetching pomodoro sessions:', error)
    return NextResponse.json({ error: 'Failed to fetch pomodoro sessions' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Ensure user exists in Convex database
    const convexUserId = await convexHttp.mutation(api.users.findOrCreateUser, {
      id: session.user.id,
      name: session.user.name || 'Unknown User',
      email: session.user.email || '',
    })

    const body = await request.json()
    const validatedData = pomodoroSessionSchema.parse(body)

    // Prepare data for Convex - handle taskId and projectId conversion
    const convexData: any = {
      duration: validatedData.duration,
      type: validatedData.type,
      userId: convexUserId
    }

    // Only add taskId if it's provided and not empty
    if (validatedData.taskId && validatedData.taskId.trim() !== '') {
      convexData.taskId = validatedData.taskId as any // Cast to Convex ID type
    }

    // Only add projectId if it's provided and not empty
    if (validatedData.projectId && validatedData.projectId.trim() !== '') {
      convexData.projectId = validatedData.projectId as any // Cast to Convex ID type
    }

    const pomodoroSession = await convexHttp.mutation(api.pomodoro.createPomodoroSession, convexData)

    return NextResponse.json(pomodoroSession)
  } catch (error) {
    console.error('Error creating pomodoro session:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid request data', details: error.errors }, { status: 422 })
    }
    return NextResponse.json({ error: 'Failed to create pomodoro session' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Ensure user exists in Convex database
    const convexUserId = await convexHttp.mutation(api.users.findOrCreateUser, {
      id: session.user.id,
      name: session.user.name || 'Unknown User',
      email: session.user.email || '',
    })

    const body = await request.json()
    const { id, completed } = body

    if (!id) {
      return NextResponse.json({ error: 'Session ID is required' }, { status: 400 })
    }

    const pomodoroSession = await convexHttp.mutation(api.pomodoro.updatePomodoroSession, {
      sessionId: id as any,
      userId: convexUserId,
      completed,
      endTime: completed ? Date.now() : undefined
    })

    return NextResponse.json(pomodoroSession)
  } catch (error) {
    console.error('Error updating pomodoro session:', error)
    return NextResponse.json({ error: 'Failed to update pomodoro session' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Ensure user exists in Convex database
    const convexUserId = await convexHttp.mutation(api.users.findOrCreateUser, {
      id: session.user.id,
      name: session.user.name || 'Unknown User',
      email: session.user.email || '',
    })

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Session ID is required' }, { status: 400 })
    }

    await convexHttp.mutation(api.pomodoro.deletePomodoroSession, {
      sessionId: id as any,
      userId: convexUserId
    })

    return new NextResponse(null, { status: 204 })
  } catch (error) {
    console.error('Error deleting pomodoro session:', error)
    return NextResponse.json({ error: 'Failed to delete pomodoro session' }, { status: 500 })
  }
} 
