import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-convex'
import { convexHttp } from '@/lib/convex'
import { api } from '../../../../../convex/_generated/api'

export async function GET() {
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

    // Get columns from Convex
    const columns = await convexHttp.query(api.kanban.getKanbanColumns, {
      userId: convexUserId
    })

    // Transform Convex data to match expected format
    const transformedColumns = columns.map(column => ({
      id: column._id,
      name: column.name,
      color: column.color,
      order: column.order,
      projectId: column.projectId || null,
      createdAt: new Date(column.createdAt).toISOString(),
      updatedAt: new Date(column.updatedAt).toISOString(),
    }))

    return NextResponse.json(transformedColumns)
  } catch (error) {
    console.error('Error fetching columns:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}

export async function POST(request: Request) {
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
    const { name, color, order, projectId } = body

    if (!name || !color || typeof order !== 'number') {
      return new NextResponse('Missing required fields', { status: 400 })
    }

    // Create column using Convex
    const columnId = await convexHttp.mutation(api.kanban.createKanbanColumn, {
      name,
      color,
      order,
      projectId: projectId || undefined,
      userId: convexUserId,
    })

    // Get the created column
    const column = await convexHttp.query(api.kanban.getKanbanColumns, {
      userId: convexUserId
    }).then(columns => columns.find(col => col._id === columnId))

    if (!column) {
      return new NextResponse('Failed to create column', { status: 500 })
    }

    const transformedColumn = {
      id: column._id,
      name: column.name,
      color: column.color,
      order: column.order,
      projectId: column.projectId || null,
      createdAt: new Date(column.createdAt).toISOString(),
      updatedAt: new Date(column.updatedAt).toISOString(),
    }

    return NextResponse.json(transformedColumn)
  } catch (error) {
    console.error('Error creating column:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
} 