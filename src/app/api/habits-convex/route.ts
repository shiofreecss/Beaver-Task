import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-convex'
import convex from '@/lib/convex'
import { api } from '../../../../convex/_generated/api'
import * as z from 'zod'

const habitSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  frequency: z.string().default('DAILY'),
  target: z.number().default(1),
  color: z.string().optional(),
})

export async function GET() {
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

    const habits = await convex.query(api.habits.getUserHabits, {
      userId: convexUserId
    })

    return NextResponse.json(habits)
  } catch (error) {
    console.error('Error fetching habits:', error)
    return NextResponse.json({ error: 'Failed to fetch habits' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
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
    const validatedData = habitSchema.parse(body)

    const habit = await convex.mutation(api.habits.createHabit, {
      ...validatedData,
      userId: convexUserId
    })

    return NextResponse.json(habit)
  } catch (error) {
    console.error('Error creating habit:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid request data', details: error.errors }, { status: 422 })
    }
    return NextResponse.json({ error: 'Failed to create habit' }, { status: 500 })
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
    const { id, completed, ...updateData } = body

    if (!id) {
      return NextResponse.json({ error: 'Habit ID is required' }, { status: 400 })
    }

    // Handle habit completion toggle
    if (typeof completed === 'boolean') {
      const habit = await convex.mutation(api.habits.toggleHabitCompletion, {
        habitId: id as any,
        userId: convexUserId,
        completed
      })
      return NextResponse.json(habit)
    }

    // Handle habit update
    const validatedData = habitSchema.parse(updateData)
    const habit = await convex.mutation(api.habits.updateHabit, {
      habitId: id as any,
      ...validatedData,
      userId: convexUserId
    })

    return NextResponse.json(habit)
  } catch (error) {
    console.error('Error updating habit:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid request data', details: error.errors }, { status: 422 })
    }
    return NextResponse.json({ error: 'Failed to update habit' }, { status: 500 })
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
      return NextResponse.json({ error: 'Habit ID is required' }, { status: 400 })
    }

    await convex.mutation(api.habits.deleteHabit, {
      habitId: id as any,
      userId: convexUserId
    })

    return new NextResponse(null, { status: 204 })
  } catch (error) {
    console.error('Error deleting habit:', error)
    return NextResponse.json({ error: 'Failed to delete habit' }, { status: 500 })
  }
} 