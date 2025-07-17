import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-convex'
import { convexHttp } from '@/lib/convex'
import { api } from '../../../../../../convex/_generated/api'

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    // Ensure user exists in Convex database
    const convexUserId = await convexHttp.mutation(api.users.findOrCreateUser, {
      id: session.user.id,
      name: session.user.name || 'Unknown User',
      email: session.user.email || '',
    })

    const body = await request.json()
    const { name, color, order } = body

    // Update column using Convex
    const updatedColumn = await convexHttp.mutation(api.kanban.updateKanbanColumn, {
      columnId: params.id as any,
      userId: convexUserId,
      name,
      color,
      order,
    })

    if (!updatedColumn) {
      return new NextResponse('Column not found', { status: 404 })
    }

    const transformedColumn = {
      id: updatedColumn._id,
      name: updatedColumn.name,
      color: updatedColumn.color,
      order: updatedColumn.order,
      projectId: updatedColumn.projectId || null,
      createdAt: new Date(updatedColumn.createdAt).toISOString(),
      updatedAt: new Date(updatedColumn.updatedAt).toISOString(),
    }

    return NextResponse.json(transformedColumn)
  } catch (error) {
    console.error('Error updating column:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    // Ensure user exists in Convex database
    const convexUserId = await convexHttp.mutation(api.users.findOrCreateUser, {
      id: session.user.id,
      name: session.user.name || 'Unknown User',
      email: session.user.email || '',
    })

    // Delete column using Convex
    await convexHttp.mutation(api.kanban.deleteKanbanColumn, {
      columnId: params.id as any,
      userId: convexUserId,
    })

    return new NextResponse(null, { status: 204 })
  } catch (error) {
    console.error('Error deleting column:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
} 