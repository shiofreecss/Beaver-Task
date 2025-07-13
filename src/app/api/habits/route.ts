import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const habits = await prisma.habit.findMany({
      where: {
        userId: session.user.id
      },
      include: {
        entries: {
          where: {
            date: {
              gte: new Date(new Date().setHours(0, 0, 0, 0))
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Transform habits to include computed fields
    const transformedHabits = await Promise.all(habits.map(async (habit) => {
      const completedToday = habit.entries.length > 0
      
      // Calculate weekly progress
      const weekStart = new Date()
      weekStart.setDate(weekStart.getDate() - weekStart.getDay()) // Start of week (Sunday)
      weekStart.setHours(0, 0, 0, 0)
      
      const weeklyEntries = await prisma.habitEntry.findMany({
        where: {
          habitId: habit.id,
          date: {
            gte: weekStart
          }
        },
        orderBy: {
          date: 'asc'
        }
      })

      const weeklyProgress = Array(7).fill(false)
      weeklyEntries.forEach(entry => {
        const dayOfWeek = new Date(entry.date).getDay()
        weeklyProgress[dayOfWeek] = entry.completed
      })

      // Calculate streak
      const streakEntries = await prisma.habitEntry.findMany({
        where: {
          habitId: habit.id,
          completed: true
        },
        orderBy: {
          date: 'desc'
        }
      })

      let streak = 0
      if (streakEntries.length > 0) {
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        let currentDate = new Date(streakEntries[0].date)
        currentDate.setHours(0, 0, 0, 0)

        while (streakEntries.some(entry => {
          const entryDate = new Date(entry.date)
          entryDate.setHours(0, 0, 0, 0)
          return entryDate.getTime() === currentDate.getTime()
        })) {
          streak++
          currentDate.setDate(currentDate.getDate() - 1)
        }
      }

      // Calculate completion rate
      const totalDays = Math.ceil((new Date().getTime() - new Date(habit.createdAt).getTime()) / (1000 * 60 * 60 * 24))
      const completedDays = streakEntries.length
      const completionRate = totalDays > 0 ? Math.round((completedDays / totalDays) * 100) : 0

      return {
        ...habit,
        completedToday,
        weeklyProgress,
        streak,
        completionRate
      }
    }))

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
    const { name, description, frequency = 'DAILY', target = 1, color } = body

    if (!name) {
      return new NextResponse('Name is required', { status: 400 })
    }

    const habit = await prisma.habit.create({
      data: {
        name,
        description,
        frequency,
        target,
        color,
        userId: session.user.id
      }
    })

    return NextResponse.json(habit)
  } catch (error) {
    console.error('Error creating habit:', error)
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
    const { id, name, description, frequency, target, color, completed } = body

    if (!id) {
      return new NextResponse('Habit ID is required', { status: 400 })
    }

    // Start a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Update habit
      const habit = await tx.habit.update({
        where: {
          id,
          userId: session.user.id
        },
        data: {
          name,
          description,
          frequency,
          target,
          color
        }
      })

      // If completed status is provided, create/update today's entry
      if (typeof completed === 'boolean') {
        const today = new Date()
        today.setHours(0, 0, 0, 0)

        const existingEntry = await tx.habitEntry.findFirst({
          where: {
            habitId: id,
            userId: session.user.id,
            date: {
              gte: today,
              lt: new Date(today.getTime() + 24 * 60 * 60 * 1000)
            }
          }
        })

        if (existingEntry) {
          await tx.habitEntry.update({
            where: { id: existingEntry.id },
            data: { completed }
          })
        } else if (completed) {
          await tx.habitEntry.create({
            data: {
              habitId: id,
              userId: session.user.id,
              completed,
              date: today
            }
          })
        }
      }

      return habit
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error updating habit:', error)
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
        userId: session.user.id
      }
    })

    return new NextResponse(null, { status: 204 })
  } catch (error) {
    console.error('Error deleting habit:', error)
    return new NextResponse('Internal Error', { status: 500 })
  }
} 