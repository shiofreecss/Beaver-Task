import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const body = await request.json()
    const { columnId } = body

    if (!columnId) {
      return new NextResponse('Column ID is required', { status: 400 })
    }

    // Verify the task exists
    const task = await prisma.task.findUnique({
      where: { id: params.id },
      include: {
        project: {
          include: {
            organization: true
          }
        }
      }
    })

    if (!task) {
      return new NextResponse('Task not found', { status: 404 })
    }

    // Verify task ownership
    if (task.project?.organization?.userId !== session.user.id as string) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    // Verify the column exists and belongs to the same project
    const column = await prisma.kanbanColumn.findUnique({
      where: { id: columnId },
      include: {
        project: true
      }
    })

    if (!column) {
      return new NextResponse('Column not found', { status: 404 })
    }

    if (task.projectId !== column.projectId) {
      return new NextResponse('Column does not belong to the task\'s project', { status: 400 })
    }

    // Update the task's column and status
    const updatedTask = await prisma.task.update({
      where: { id: params.id },
      data: {
        columnId,
        status: column.name.toUpperCase().replace(/\s+/g, '_')
      }
    })

    return NextResponse.json(updatedTask)
  } catch (error) {
    console.error('Error moving task:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
} 