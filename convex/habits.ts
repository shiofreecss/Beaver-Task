import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const getUserHabits = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const habits = await ctx.db
      .query("habits")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .collect();

    // Get entries for each habit
    const habitsWithEntries = await Promise.all(
      habits.map(async (habit) => {
        const entries = await ctx.db
          .query("habitEntries")
          .withIndex("by_habitId", (q) => q.eq("habitId", habit._id))
          .collect();

        return transformHabit(habit, entries);
      })
    );

    return habitsWithEntries.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },
});

export const createHabit = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
    frequency: v.string(),
    target: v.number(),
    color: v.optional(v.string()),
    customDays: v.optional(v.array(v.number())),
    customPeriod: v.optional(v.string()),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const habitId = await ctx.db.insert("habits", {
      name: args.name,
      description: args.description,
      frequency: args.frequency,
      target: args.target,
      color: args.color,
      customDays: args.customDays,
      customPeriod: args.customPeriod,
      userId: args.userId,
      createdAt: now,
      updatedAt: now,
    });

    const habit = await ctx.db.get(habitId);
    if (!habit) return null;

    return transformHabit(habit, []);
  },
});

export const toggleHabitCompletion = mutation({
  args: {
    habitId: v.id("habits"),
    userId: v.id("users"),
    completed: v.boolean(),
  },
  handler: async (ctx, args) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayTimestamp = today.getTime();

    // Check if entry already exists for today
    const existingEntry = await ctx.db
      .query("habitEntries")
      .withIndex("by_habit_date_user", (q) => 
        q.eq("habitId", args.habitId)
         .eq("date", todayTimestamp)
         .eq("userId", args.userId)
      )
      .first();

    if (existingEntry) {
      await ctx.db.patch(existingEntry._id, { completed: args.completed });
    } else if (args.completed) {
      await ctx.db.insert("habitEntries", {
        habitId: args.habitId,
        userId: args.userId,
        completed: args.completed,
        date: todayTimestamp,
        value: 1,
        createdAt: Date.now(),
      });
    }

    // Return updated habit with entries
    const habit = await ctx.db.get(args.habitId);
    if (!habit) return null;

    const entries = await ctx.db
      .query("habitEntries")
      .withIndex("by_habitId", (q) => q.eq("habitId", args.habitId))
      .collect();

    return transformHabit(habit, entries);
  },
});

export const updateHabit = mutation({
  args: {
    habitId: v.id("habits"),
    userId: v.id("users"),
    name: v.string(),
    description: v.optional(v.string()),
    frequency: v.string(),
    target: v.number(),
    color: v.optional(v.string()),
    customDays: v.optional(v.array(v.number())),
    customPeriod: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { habitId, userId, ...updates } = args;

    await ctx.db.patch(habitId, {
      ...updates,
      updatedAt: Date.now(),
    });

    const habit = await ctx.db.get(habitId);
    if (!habit) return null;

    const entries = await ctx.db
      .query("habitEntries")
      .withIndex("by_habitId", (q) => q.eq("habitId", habitId))
      .collect();

    return transformHabit(habit, entries);
  },
});

export const deleteHabit = mutation({
  args: {
    habitId: v.id("habits"),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    // Verify habit exists and belongs to user
    const habit = await ctx.db.get(args.habitId);
    if (!habit || habit.userId !== args.userId) {
      throw new Error("Habit not found or unauthorized");
    }

    await ctx.db.delete(args.habitId);
  },
});

function transformHabit(habit: any, entries: any[] = []) {
  // Get today's entries
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayTimestamp = today.getTime();
  
  const todayEntries = entries.filter(entry => entry.date === todayTimestamp);

  // Calculate weekly progress
  const weekStart = new Date();
  weekStart.setDate(weekStart.getDate() - weekStart.getDay()); // Start of week (Sunday)
  weekStart.setHours(0, 0, 0, 0);
  
  const weeklyProgress = Array(7).fill(false);
  entries.forEach(entry => {
    const dayDiff = Math.floor((entry.date - weekStart.getTime()) / (1000 * 60 * 60 * 24));
    if (dayDiff >= 0 && dayDiff < 7) {
      weeklyProgress[dayDiff] = entry.completed;
    }
  });

  // Calculate streak
  let streak = 0;
  let currentDate = new Date();
  currentDate.setHours(0, 0, 0, 0);

  while (true) {
    const currentTimestamp = currentDate.getTime();
    const dayEntries = entries.filter(entry => 
      entry.date === currentTimestamp && entry.completed
    );

    if (dayEntries.length === 0) break;
    streak++;
    currentDate.setDate(currentDate.getDate() - 1);
  }

  // Calculate completion rate
  const totalDays = Math.ceil((todayTimestamp - habit.createdAt) / (1000 * 60 * 60 * 24));
  const completedDays = entries.filter(entry => entry.completed).length;
  const completionRate = totalDays > 0 ? (completedDays / totalDays) * 100 : 0;

  return {
    ...habit,
    id: habit._id,
    createdAt: new Date(habit.createdAt).toISOString(),
    updatedAt: new Date(habit.updatedAt).toISOString(),
    completedToday: todayEntries.some(entry => entry.completed),
    streak,
    weeklyProgress,
    completionRate: Math.round(completionRate * 100) / 100,
    totalCompletedDays: completedDays
  };
} 