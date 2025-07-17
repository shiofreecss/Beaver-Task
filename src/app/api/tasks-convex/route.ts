import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-convex'
import { convexHttp } from '@/lib/convex'
import { api } from '../../../../convex/_generated/api'
import * as z from 'zod'

const taskSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  status: z.enum(['ACTIVE', 'PLANNING', 'IN_PROGRESS', 'ON_HOLD', 'COMPLETED']).default('ACTIVE'),
  priority: z.enum(['P0', 'P1', 'P2', 'P3']).default('P1'),
  severity: z.enum(['S0', 'S1', 'S2', 'S3']).default('S1'),
  dueDate: z.string().optional().nullable(),
  projectId: z.string().optional().nullable(),
  parentId: z.string().optional().nullable(),
})

const taskUpdateSchema = z.object({
  title: z.string().min(1, 'Title is required').optional(),
  description: z.string().optional(),
  status: z.enum(['ACTIVE', 'PLANNING', 'IN_PROGRESS', 'ON_HOLD', 'COMPLETED']).optional(),
  priority: z.enum(['P0', 'P1', 'P2', 'P3']).optional(),
  severity: z.enum(['S0', 'S1', 'S2', 'S3']).optional(),
  dueDate: z.string().optional().nullable(),
  projectId: z.string().optional().nullable(),
  parentId: z.string().optional().nullable(),
})

// Cache for user IDs to avoid repeated lookups
const userCache = new Map<string, string>()

async function getConvexUserId(sessionUserId: string, userName: string, userEmail: string): Promise<string> {
  // Check cache first
  if (userCache.has(sessionUserId)) {
    return userCache.get(sessionUserId)!
  }

  // Create or find user in Convex
  const convexUserId = await convexHttp.mutation(api.users.findOrCreateUser, {
    id: sessionUserId,
    name: userName || 'Unknown User',
    email: userEmail || '',
  })

  // Cache the result
  userCache.set(sessionUserId, convexUserId)
  return convexUserId
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const tasks = await convexHttp.query(api.tasks.getUserTasks, {
      userId: session.user.id as any
    })

    return NextResponse.json(tasks)
  } catch (error) {
    console.error('Error fetching tasks:', error)
    return NextResponse.json({ error: 'Failed to fetch tasks' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const convexUserId = await getConvexUserId(
      session.user.id,
      session.user.name || 'Unknown User',
      session.user.email || ''
    )

    const body = await request.json()
    const validatedData = taskSchema.parse(body)

    // Prepare clean data for Convex - omit null/empty values instead of sending them
    const convexData: any = {
      title: validatedData.title,
      userId: convexUserId as any
    }

    // Only add fields that have actual values
    if (validatedData.description !== undefined) convexData.description = validatedData.description
    if (validatedData.status !== undefined) convexData.status = validatedData.status
    if (validatedData.priority !== undefined) convexData.priority = validatedData.priority
    if (validatedData.severity !== undefined) convexData.severity = validatedData.severity
    if (validatedData.dueDate !== undefined && validatedData.dueDate !== null) {
      convexData.dueDate = new Date(validatedData.dueDate).getTime()
    }
    if (validatedData.projectId !== undefined && validatedData.projectId !== null && validatedData.projectId !== '') {
      convexData.projectId = validatedData.projectId as any
    }
    if (validatedData.parentId !== undefined && validatedData.parentId !== null && validatedData.parentId !== '') {
      convexData.parentId = validatedData.parentId as any
    }

    const task = await convexHttp.mutation(api.tasks.createTask, convexData)

    return NextResponse.json(task)
  } catch (error) {
    console.error('Error creating task:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid request data', details: error.errors }, { status: 422 })
    }
    return NextResponse.json({ error: 'Failed to create task' }, { status: 500 })
  }
} 

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const convexUserId = await getConvexUserId(
      session.user.id,
      session.user.name || 'Unknown User',
      session.user.email || ''
    )

    const body = await request.json()
    const { id, ...updateData } = body

    if (!id) {
      return NextResponse.json({ error: 'Task ID is required' }, { status: 400 })
    }

    const validatedData = taskUpdateSchema.parse(updateData)

    // Prepare clean data for Convex - omit null/empty values instead of sending them
    const convexData: any = {
      taskId: id as any,
      userId: convexUserId as any
    }

    // Only add fields that have actual values
    if (validatedData.title !== undefined) convexData.title = validatedData.title
    if (validatedData.description !== undefined) convexData.description = validatedData.description
    if (validatedData.status !== undefined) convexData.status = validatedData.status
    if (validatedData.priority !== undefined) convexData.priority = validatedData.priority
    if (validatedData.severity !== undefined) convexData.severity = validatedData.severity
    if (validatedData.dueDate !== undefined && validatedData.dueDate !== null) {
      convexData.dueDate = new Date(validatedData.dueDate).getTime()
    }
    if (validatedData.projectId !== undefined && validatedData.projectId !== null && validatedData.projectId !== '') {
      convexData.projectId = validatedData.projectId as any
    }
    if (validatedData.parentId !== undefined && validatedData.parentId !== null && validatedData.parentId !== '') {
      convexData.parentId = validatedData.parentId as any
    }

    const task = await convexHttp.mutation(api.tasks.updateTask, convexData)

    return NextResponse.json(task)
  } catch (error) {
    console.error('Error updating task:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid request data', details: error.errors }, { status: 422 })
    }
    return NextResponse.json({ error: 'Failed to update task' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const convexUserId = await getConvexUserId(
      session.user.id,
      session.user.name || 'Unknown User',
      session.user.email || ''
    )

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Task ID is required' }, { status: 400 })
    }

    // Validate that the ID looks like a valid Convex ID
    if (!id.match(/^[a-zA-Z0-9_-]+$/)) {
      return NextResponse.json({ error: 'Invalid task ID format' }, { status: 400 })
    }

    try {
      await convexHttp.mutation(api.tasks.deleteTask, {
        taskId: id as any,
        userId: convexUserId as any
      })

      return new NextResponse(null, { status: 204 })
    } catch (convexError: any) {
      console.error('Convex error during task deletion:', convexError)
      
      // Handle specific Convex errors
      if (convexError.data === 'Task not found or unauthorized') {
        return NextResponse.json({ 
          error: 'Task not found or you do not have permission to delete it' 
        }, { status: 404 })
      }
      
      // Re-throw other Convex errors
      throw convexError
    }
  } catch (error) {
    console.error('Error deleting task:', error)
    
    // Return more specific error messages
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    
    return NextResponse.json({ error: 'Failed to delete task' }, { status: 500 })
  }
} 