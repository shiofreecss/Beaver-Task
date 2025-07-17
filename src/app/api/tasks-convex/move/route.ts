import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-convex'
import { convexHttp } from '@/lib/convex'
import { api } from '../../../../../convex/_generated/api'

export async function PATCH(request: NextRequest) {
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
    const { taskId, columnId } = body

    if (!taskId || !columnId) {
      return NextResponse.json({ error: 'Task ID and Column ID are required' }, { status: 400 })
    }

    const task = await convexHttp.mutation(api.tasks.moveTask, {
      taskId: taskId as any,
      userId: convexUserId,
      columnId
    })

    return NextResponse.json(task)
  } catch (error) {
    console.error('Error moving task:', error)
    return NextResponse.json({ error: 'Failed to move task' }, { status: 500 })
  }
} 