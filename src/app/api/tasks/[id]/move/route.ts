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

    // Verify the task exists and belongs to the user
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

    // Verify task ownership - check if task belongs to the user directly
    if (task.userId !== session.user.id) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    // Map column IDs to status values for default columns
    const columnIdToStatus: Record<string, string> = {
      'active': 'ACTIVE',
      'planning': 'PLANNING', 
      'in_progress': 'IN_PROGRESS',
      'on_hold': 'ON_HOLD',
      'completed': 'COMPLETED'
    }

    // Update the task - if it's a default column, map to status, otherwise try to set columnId
    let updateData: { status: string; columnId?: string | null } = {
      status: columnIdToStatus[columnId] || 'ACTIVE'
    }

    // If this is not a default column mapping, it might be a real column ID
    if (!columnIdToStatus[columnId]) {
      updateData.columnId = columnId
    } else {
      updateData.columnId = null
    }

    const updatedTask = await prisma.task.update({
      where: { id: params.id },
      data: updateData,
      include: {
        project: {
          select: {
            id: true,
            name: true
          }
        }
      }
    })

    return NextResponse.json(updatedTask)
  } catch (error) {
    console.error('Error moving task:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
} 