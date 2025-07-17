import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-convex';
// import { prisma } from '@/lib/prisma';
import { Task, Project, Habit, HabitEntry, PomodoroSession } from '@prisma/client';

// TODO: Refactor this endpoint to use Convex instead of Prisma.
// All code using 'prisma' is commented out below

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // const user = await prisma.user.findUnique({
    //   where: { email: session.user.email },
    // });

    // if (!user) {
    //   return new NextResponse('User not found', { status: 404 });
    // }

    // Fetch tasks
    // const tasks = await prisma.task.findMany({
    //   where: {
    //     userId: user.id,
    //     dueDate: { not: null },
    //   },
    //   select: {
    //     id: true,
    //     title: true,
    //     dueDate: true,
    //     status: true,
    //   },
    // });

    // Fetch projects
    // const projects = await prisma.project.findMany({
    //   where: {
    //     userId: user.id,
    //     dueDate: { not: null },
    //   },
    //   select: {
    //     id: true,
    //     name: true,
    //     dueDate: true,
    //     color: true,
    //   },
    // });

    // Fetch habits
    // const habits = await prisma.habit.findMany({
    //   where: {
    //     userId: user.id,
    //   },
    //   include: {
    //     entries: {
    //       where: {
    //         date: {
    //           gte: new Date(new Date().setDate(new Date().getDate() - 30)), // Last 30 days
    //         },
    //       },
    //     },
    //   },
    // });

    // Fetch pomodoro sessions
    // const pomodoroSessions = await prisma.pomodoroSession.findMany({
    //   where: {
    //     userId: user.id,
    //     startTime: { not: null },
    //     endTime: { not: null },
    //   },
    //   select: {
    //     id: true,
    //     duration: true,
    //     type: true,
    //     startTime: true,
    //     endTime: true,
    //   },
    // });

    // Transform data into calendar events
    // const events = [
    //   // Tasks as events
    //   ...tasks.map((task: Pick<Task, 'id' | 'title' | 'dueDate' | 'status'>) => ({
    //     id: task.id,
    //     title: task.title,
    //     start: task.dueDate,
    //     allDay: true,
    //     color: task.status === 'COMPLETED' ? '#22c55e' : 
    //            task.status === 'IN_PROGRESS' ? '#a855f7' :
    //            task.status === 'PLANNING' ? '#eab308' :
    //            task.status === 'ON_HOLD' ? '#6b7280' : '#3b82f6',
    //     type: 'task' as const,
    //   })),

    //   // Projects as events
    //   ...projects.map((project: Pick<Project, 'id' | 'name' | 'dueDate' | 'color'>) => ({
    //     id: project.id,
    //     title: project.name,
    //     start: project.dueDate,
    //     allDay: true,
    //     color: project.color || '#3b82f6',
    //     type: 'project' as const,
    //   })),

    //   // Habit entries as events
    //   ...habits.flatMap((habit: Habit & { entries: HabitEntry[] }) => 
    //     habit.entries.map((entry: HabitEntry) => ({
    //       id: entry.id,
    //       title: habit.name,
    //       start: entry.date,
    //       allDay: true,
    //       color: habit.color || '#a855f7',
    //       type: 'habit' as const,
    //     }))
    //   ),

    //   // Pomodoro sessions as events
    //   ...pomodoroSessions.map((session: Pick<PomodoroSession, 'id' | 'duration' | 'type' | 'startTime' | 'endTime'>) => ({
    //     id: session.id,
    //     title: `${session.type} Session (${session.duration}min)`,
    //     start: session.startTime,
    //     end: session.endTime,
    //     color: session.type === 'FOCUS' ? '#ef4444' : '#10b981',
    //     type: 'pomodoro' as const,
    //   })),
    // ];

    // return NextResponse.json(events);
    return new NextResponse('Calendar events endpoint is currently disabled.', { status: 501 });
  } catch (error) {
    console.error('Error fetching calendar events:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 