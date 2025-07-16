import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-convex'
import { prisma } from '@/lib/prisma'
import * as z from 'zod'

const habitSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  description: z.string().optional(),
  frequency: z.enum(['DAILY', 'WEEKLY', 'MONTHLY']).default('DAILY'),
  target: z.number().min(1).default(1),
  color: z.string().optional(),
})

const toggleSchema = z.object({
  id: z.string(),
  completed: z.boolean(),
})

function transformHabit(habit: any, entries: any[] = []) {
  // Get today's entries
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const todayEntries = entries.filter(entry => {
    const entryDate = new Date(entry.date)
    entryDate.setHours(0, 0, 0, 0)
    return entryDate.getTime() === today.getTime()
  })

  // Calculate weekly progress
  const weekStart = new Date()
  weekStart.setDate(weekStart.getDate() - weekStart.getDay()) // Start of week (Sunday)
  weekStart.setHours(0, 0, 0, 0)
  
  const weeklyProgress = Array(7).fill(false)
  entries.forEach(entry => {
    const entryDate = new Date(entry.date)
    const dayDiff = Math.floor((entryDate.getTime() - weekStart.getTime()) / (1000 * 60 * 60 * 24))
    if (dayDiff >= 0 && dayDiff < 7) {
      weeklyProgress[dayDiff] = entry.completed
    }
  })

  // Calculate streak
  let streak = 0
  let currentDate = new Date()
  currentDate.setHours(0, 0, 0, 0)

  while (true) {
    const dayEntries = entries.filter(entry => {
      const entryDate = new Date(entry.date)
      entryDate.setHours(0, 0, 0, 0)
      return entryDate.getTime() === currentDate.getTime() && entry.completed
    })

    if (dayEntries.length === 0) break
    streak++
    currentDate.setDate(currentDate.getDate() - 1)
  }

  // Calculate completion rate
  const totalDays = Math.ceil((today.getTime() - new Date(habit.createdAt).getTime()) / (1000 * 60 * 60 * 24))
  const completedDays = entries.filter(entry => entry.completed).length
  const completionRate = totalDays > 0 ? Math.round((completedDays / totalDays) * 100) : 0

  return {
    ...habit,
    completedToday: todayEntries.some(entry => entry.completed),
    weeklyProgress,
    streak,
    completionRate,
    entries,
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const habits = await prisma.habit.findMany({
      where: {
        userId: session.user.id as string
      },
      include: {
        entries: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    const transformedHabits = habits.map(habit => transformHabit(habit, habit.entries))
    return NextResponse.json(transformedHabits)
  } catch (error) {
    console.error('Error fetching habits:', error)
    return new NextResponse('Internal Error', { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const body = await req.json()
    const validatedData = habitSchema.parse(body)

    const habit = await prisma.habit.create({
      data: {
        ...validatedData,
        userId: session.user.id as string
      },
      include: {
        entries: true
      }
    })

    return NextResponse.json(transformHabit(habit))
  } catch (error) {
    console.error('Error creating habit:', error)
    if (error instanceof z.ZodError) {
      return new NextResponse('Invalid request data', { status: 422 })
    }
    return new NextResponse('Internal Error', { status: 500 })
  }
}

export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const body = await req.json()

    // Handle habit completion toggle
    if ('completed' in body) {
      const { id, completed } = toggleSchema.parse(body)
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      const habit = await prisma.habit.findUnique({
        where: {
          id,
          userId: session.user.id as string
        },
        include: {
          entries: true
        }
      })

      if (!habit) {
        return new NextResponse('Habit not found', { status: 404 })
      }

      const existingEntry = await prisma.habitEntry.findFirst({
        where: {
          habitId: id,
                      userId: session.user.id as string,
          date: {
            gte: today,
            lt: new Date(today.getTime() + 24 * 60 * 60 * 1000)
          }
        }
      })

      if (existingEntry) {
        await prisma.habitEntry.update({
          where: { id: existingEntry.id },
          data: { completed }
        })
      } else if (completed) {
        await prisma.habitEntry.create({
          data: {
            habitId: id,
            userId: session.user.id as string,
            completed,
            date: today
          }
        })
      }

      const updatedHabit = await prisma.habit.findUnique({
        where: { id },
        include: {
          entries: true
        }
      })

      return NextResponse.json(transformHabit(updatedHabit, updatedHabit?.entries))
    }

    // Handle habit update
    const { id, ...updateData } = body
    const validatedData = habitSchema.parse(updateData)

    const habit = await prisma.habit.update({
              where: {
          id,
          userId: session.user.id as string
        },
      data: validatedData,
      include: {
        entries: true
      }
    })

    return NextResponse.json(transformHabit(habit, habit.entries))
  } catch (error) {
    console.error('Error updating habit:', error)
    if (error instanceof z.ZodError) {
      return new NextResponse('Invalid request data', { status: 422 })
    }
    return new NextResponse('Internal Error', { status: 500 })
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')

    if (!id) {
      return new NextResponse('Habit ID is required', { status: 400 })
    }

    await prisma.habit.delete({
      where: {
        id,
        userId: session.user.id as string
      }
    })

    return new NextResponse(null, { status: 204 })
  } catch (error) {
    console.error('Error deleting habit:', error)
    return new NextResponse('Internal Error', { status: 500 })
  }
} 