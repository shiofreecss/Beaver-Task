import { v } from "convex/values";
import { query } from "./_generated/server";

export const getCalendarEvents = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    // Fetch tasks with due dates
    const tasks = await ctx.db
      .query("tasks")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .filter((q) => q.neq(q.field("dueDate"), undefined))
      .collect();

    // Fetch projects with due dates
    const projects = await ctx.db
      .query("projects")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .filter((q) => q.neq(q.field("dueDate"), undefined))
      .collect();

    // Fetch habits
    const habits = await ctx.db
      .query("habits")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .collect();

    // Get habit entries for the last 30 days
    const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
    const habitEntries = await ctx.db
      .query("habitEntries")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .filter((q) => q.gte(q.field("date"), thirtyDaysAgo))
      .collect();

    // Fetch pomodoro sessions with start and end times
    const pomodoroSessions = await ctx.db
      .query("pomodoroSessions")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .filter((q) => 
        q.and(
          q.neq(q.field("startTime"), undefined),
          q.neq(q.field("endTime"), undefined)
        )
      )
      .collect();

    // Transform data for calendar
    const taskEvents = tasks
      .filter(task => task.dueDate)
      .map(task => ({
        id: task._id,
        title: task.title,
        start: task.dueDate!, // Use timestamp directly
        allDay: true,
        backgroundColor: getStatusColor(task.status),
        borderColor: getStatusColor(task.status),
        textColor: '#fff',
        extendedProps: {
          type: 'task',
          status: task.status,
        },
      }));

    const projectEvents = projects
      .filter(project => project.dueDate)
      .map(project => ({
        id: project._id,
        title: `📁 ${project.name}`,
        start: project.dueDate!, // Use timestamp directly
        allDay: true,
        backgroundColor: project.color || '#3b82f6',
        borderColor: project.color || '#3b82f6',
        textColor: '#fff',
        extendedProps: {
          type: 'project',
        },
      }));

    const habitEventsMap = new Map();
    habitEntries.forEach(entry => {
      if (entry.completed) {
        const dateStr = new Date(entry.date).toDateString();
        const habit = habits.find(h => h._id === entry.habitId);
        if (habit) {
          if (!habitEventsMap.has(dateStr)) {
            habitEventsMap.set(dateStr, []);
          }
          habitEventsMap.get(dateStr).push(habit.name);
        }
      }
    });

    const habitEvents = Array.from(habitEventsMap.entries()).map(([dateStr, habitNames]) => ({
      id: `habits-${dateStr}`,
      title: `✅ ${habitNames.join(', ')}`,
      start: new Date(dateStr).getTime(), // Convert to timestamp
      allDay: true,
      backgroundColor: '#10b981',
      borderColor: '#10b981',
      textColor: '#fff',
      extendedProps: {
        type: 'habit',
      },
    }));

    const pomodoroEvents = pomodoroSessions
      .filter(session => session.startTime && session.endTime)
      .map(session => ({
        id: session._id,
        title: `🍅 ${session.type} (${session.duration}min)`,
        start: session.startTime!, // Use timestamp directly
        end: session.endTime!, // Use timestamp directly
        backgroundColor: getTypeColor(session.type),
        borderColor: getTypeColor(session.type),
        textColor: '#fff',
        extendedProps: {
          type: 'pomodoro',
          pomodoroType: session.type,
          duration: session.duration,
        },
      }));

    return [
      ...taskEvents,
      ...projectEvents,
      ...habitEvents,
      ...pomodoroEvents,
    ];
  },
});

function getStatusColor(status: string): string {
  const colors = {
    ACTIVE: '#3b82f6',
    PLANNING: '#8b5cf6',
    IN_PROGRESS: '#f59e0b',
    ON_HOLD: '#6b7280',
    COMPLETED: '#10b981',
  };
  return colors[status as keyof typeof colors] || '#3b82f6';
}

function getTypeColor(type: string): string {
  const colors = {
    FOCUS: '#ef4444',
    SHORT_BREAK: '#10b981',
    LONG_BREAK: '#3b82f6',
  };
  return colors[type as keyof typeof colors] || '#ef4444';
} 