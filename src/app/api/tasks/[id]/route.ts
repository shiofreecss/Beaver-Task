import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-convex'
// import { prisma } from '@/lib/prisma'
import * as z from 'zod'

const taskSchema = z.object({
  title: z.string().min(1, 'Title is required').optional(),
  description: z.string().optional(),
  status: z.enum(['ACTIVE', 'PLANNING', 'IN_PROGRESS', 'ON_HOLD', 'COMPLETED']).optional(),
  priority: z.enum(['P0', 'P1', 'P2', 'P3']).optional(),
  severity: z.enum(['S0', 'S1', 'S2', 'S3']).optional(),
  dueDate: z.string().optional().nullable(),
  projectId: z.string().optional().nullable(),
  parentId: z.string().optional().nullable(),
})

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = taskSchema.parse(body)

    // Fast path for simple status updates (most common case)
    const isSimpleStatusUpdate = Object.keys(validatedData).length === 1 && 'status' in validatedData
    
    if (isSimpleStatusUpdate) {
      // Skip validation queries for simple status updates to improve performance
      try {
        // This part of the code needs to be refactored to use Convex
        // For now, it will fall back to full validation if fast path fails
        console.warn('Fast path for simple status update is not fully implemented with Convex.')
        // Example of how it would look with Convex (assuming a similar structure)
        // const task = await convexClient.tasks.update({
        //   id: params.id,
        //   userId: session.user.id,
        //   data: {
        //     status: validatedData.status
        //   }
        // })
        // return NextResponse.json(task)
      } catch (error) {
        // If update fails (task not found or unauthorized), fall back to full validation
        console.warn('Fast path failed, falling back to full validation:', error)
      }
    }

    // Full validation path for complex updates or when fast path fails
    // This part of the code needs to be refactored to use Convex
    // For now, it will fall back to full validation if fast path fails
    console.warn('Full validation for complex updates is not fully implemented with Convex.')
    // Example of how it would look with Convex (assuming a similar structure)
    // const existingTask = await convexClient.tasks.findFirst({
    //   where: {
    //     id: params.id,
    //     userId: session.user.id
    //   }
    // })

    // if (!existingTask) {
    //   return NextResponse.json({ error: 'Task not found or unauthorized' }, { status: 404 })
    // }

    // Validate project if projectId is provided
    // This part of the code needs to be refactored to use Convex
    // For now, it will fall back to full validation if fast path fails
    console.warn('Project validation is not fully implemented with Convex.')
    // Example of how it would look with Convex (assuming a similar structure)
    // if (validatedData.projectId) {
    //   const project = await convexClient.projects.findFirst({
    //     where: {
    //       id: validatedData.projectId,
    //       userId: session.user.id
    //     }
    //   })

    //   if (!project) {
    //     return NextResponse.json({ error: 'Project not found or unauthorized' }, { status: 404 })
    //   }
    // }

    // This part of the code needs to be refactored to use Convex
    // For now, it will fall back to full validation if fast path fails
    console.warn('Task update is not fully implemented with Convex.')
    // Example of how it would look with Convex (assuming a similar structure)
    // const task = await convexClient.tasks.update({
    //   where: { id: params.id },
    //   data: {
    //     ...validatedData,
    //     dueDate: validatedData.dueDate ? new Date(validatedData.dueDate) : undefined,
    //   }
    // })

    // return NextResponse.json(task)
    return NextResponse.json({ message: 'Task update is not fully implemented with Convex.' }, { status: 501 })
  } catch (error) {
    console.error('Error updating task:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid request data', details: error.errors }, { status: 422 })
    }
    return NextResponse.json({ error: 'Failed to update task' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify the task exists and belongs to the user
    // This part of the code needs to be refactored to use Convex
    // For now, it will fall back to full validation if fast path fails
    console.warn('Task deletion is not fully implemented with Convex.')
    // Example of how it would look with Convex (assuming a similar structure)
    // const existingTask = await convexClient.tasks.findFirst({
    //   where: {
    //     id: params.id,
    //     userId: session.user.id
    //   }
    // })

    // if (!existingTask) {
    //   return NextResponse.json({ error: 'Task not found or unauthorized' }, { status: 404 })
    // }

    // This part of the code needs to be refactored to use Convex
    // For now, it will fall back to full validation if fast path fails
    console.warn('Task deletion is not fully implemented with Convex.')
    // Example of how it would look with Convex (assuming a similar structure)
    // await convexClient.tasks.delete({
    //   where: { id: params.id }
    // })

    // return NextResponse.json({ message: 'Task deleted successfully' })
    return NextResponse.json({ message: 'Task deletion is not fully implemented with Convex.' }, { status: 501 })
  } catch (error) {
    console.error('Error deleting task:', error)
    return NextResponse.json({ error: 'Failed to delete task' }, { status: 500 })
  }
} 