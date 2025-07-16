import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-convex'
import convex from '@/lib/convex'
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

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const tasks = await convex.query(api.tasks.getUserTasks, {
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

    const body = await request.json()
    const validatedData = taskSchema.parse(body)

    const task = await convex.mutation(api.tasks.createTask, {
      ...validatedData,
      dueDate: validatedData.dueDate ? new Date(validatedData.dueDate).getTime() : undefined,
      projectId: validatedData.projectId as any,
      parentId: validatedData.parentId as any,
      userId: session.user.id as any
    })

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

    // Ensure user exists in Convex database
    const convexUserId = await convex.mutation(api.users.findOrCreateUser, {
      id: session.user.id,
      name: session.user.name || 'Unknown User',
      email: session.user.email || '',
    })

    const body = await request.json()
    const { id, ...updateData } = body

    if (!id) {
      return NextResponse.json({ error: 'Task ID is required' }, { status: 400 })
    }

    const validatedData = taskSchema.parse(updateData)

    const task = await convex.mutation(api.tasks.updateTask, {
      taskId: id as any,
      ...validatedData,
      dueDate: validatedData.dueDate ? new Date(validatedData.dueDate).getTime() : undefined,
      projectId: validatedData.projectId as any,
      parentId: validatedData.parentId as any,
      userId: convexUserId
    })

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

    // Ensure user exists in Convex database
    const convexUserId = await convex.mutation(api.users.findOrCreateUser, {
      id: session.user.id,
      name: session.user.name || 'Unknown User',
      email: session.user.email || '',
    })

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Task ID is required' }, { status: 400 })
    }

    await convex.mutation(api.tasks.deleteTask, {
      taskId: id as any,
      userId: convexUserId
    })

    return new NextResponse(null, { status: 204 })
  } catch (error) {
    console.error('Error deleting task:', error)
    return NextResponse.json({ error: 'Failed to delete task' }, { status: 500 })
  }
} 