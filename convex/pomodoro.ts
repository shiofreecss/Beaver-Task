import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const getUserPomodoroSessions = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const sessions = await ctx.db
      .query("pomodoroSessions")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .order("desc")
      .collect();

    return sessions.map(session => ({
      ...session,
      id: session._id,
      startTime: session.startTime ? new Date(session.startTime).toISOString() : null,
      endTime: session.endTime ? new Date(session.endTime).toISOString() : null,
      createdAt: new Date(session.createdAt).toISOString(),
      updatedAt: new Date(session.updatedAt).toISOString(),
    }));
  },
});

export const createPomodoroSession = mutation({
  args: {
    duration: v.number(),
    type: v.optional(v.string()),
    taskId: v.optional(v.id("tasks")),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const sessionId = await ctx.db.insert("pomodoroSessions", {
      duration: args.duration,
      type: args.type || "FOCUS",
      completed: false,
      startTime: now,
      taskId: args.taskId,
      userId: args.userId,
      createdAt: now,
      updatedAt: now,
    });

    // Return the complete session object
    const session = await ctx.db.get(sessionId);
    return {
      ...session,
      id: session?._id,
      startTime: session?.startTime ? new Date(session.startTime).toISOString() : null,
      endTime: session?.endTime ? new Date(session.endTime).toISOString() : null,
      createdAt: new Date(session?.createdAt || now).toISOString(),
      updatedAt: new Date(session?.updatedAt || now).toISOString(),
    };
  },
});

export const updatePomodoroSession = mutation({
  args: {
    sessionId: v.id("pomodoroSessions"),
    userId: v.id("users"),
    completed: v.optional(v.boolean()),
    endTime: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { sessionId, userId, ...updates } = args;

    // Verify session exists and belongs to user
    const session = await ctx.db.get(sessionId);
    if (!session || session.userId !== userId) {
      throw new Error("Session not found or unauthorized");
    }

    await ctx.db.patch(sessionId, {
      ...updates,
      updatedAt: Date.now(),
    });

    // Return the complete updated session object
    const updatedSession = await ctx.db.get(sessionId);
    return {
      ...updatedSession,
      id: updatedSession?._id,
      startTime: updatedSession?.startTime ? new Date(updatedSession.startTime).toISOString() : null,
      endTime: updatedSession?.endTime ? new Date(updatedSession.endTime).toISOString() : null,
      createdAt: new Date(updatedSession?.createdAt || Date.now()).toISOString(),
      updatedAt: new Date(updatedSession?.updatedAt || Date.now()).toISOString(),
    };
  },
});

export const deletePomodoroSession = mutation({
  args: {
    sessionId: v.id("pomodoroSessions"),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const { sessionId, userId } = args;

    // Verify session exists and belongs to user
    const session = await ctx.db.get(sessionId);
    if (!session || session.userId !== userId) {
      throw new Error("Session not found or unauthorized");
    }

    await ctx.db.delete(sessionId);
  },
}); 