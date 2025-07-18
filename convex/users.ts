import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { ConvexError } from "convex/values";

export const getUserByEmail = query({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    try {
      const user = await ctx.db
        .query("users")
        .withIndex("by_email", (q) => q.eq("email", args.email))
        .first();
      
      if (!user) {
        console.log(`User not found for email: ${args.email}`);
        return null;
      }

      console.log(`Found user: ${user._id} for email: ${args.email}`);
      return user;
    } catch (error) {
      console.error('Error in getUserByEmail:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      throw new ConvexError(`Failed to get user: ${errorMessage}`);
    }
  },
});

export const getUserById = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.userId);
  },
});

export const findOrCreateUser = mutation({
  args: {
    id: v.string(), // External ID from NextAuth
    name: v.string(),
    email: v.string(),
    password: v.optional(v.string()),
    role: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Try to find user by email first
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();

    if (existingUser) {
      return existingUser._id;
    }

    // Create new user if not found
    const now = Date.now();
    const userId = await ctx.db.insert("users", {
      name: args.name,
      email: args.email,
      password: args.password || "", // Default empty password for OAuth users
      role: args.role || "MEMBER",
      settings: JSON.stringify({
        theme: 'system',
        emailNotifications: true,
        pushNotifications: true
      }),
      createdAt: now,
      updatedAt: now,
    });

    return userId;
  },
});

export const createUser = mutation({
  args: {
    name: v.string(),
    email: v.string(),
    password: v.string(),
    role: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Check if user already exists
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();

    if (existingUser) {
      throw new ConvexError("User with this email already exists");
    }

    const now = Date.now();
    return await ctx.db.insert("users", {
      name: args.name,
      email: args.email,
      password: args.password,
      role: args.role || "MEMBER",
      settings: JSON.stringify({
        theme: 'system',
        emailNotifications: true,
        pushNotifications: true
      }),
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const updateUser = mutation({
  args: {
    userId: v.id("users"),
    name: v.optional(v.string()),
    email: v.optional(v.string()),
    image: v.optional(v.string()),
    settings: v.optional(v.string()),
    role: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { userId, ...updates } = args;
    
    // If email is being updated, check if it's already taken
    if (updates.email && updates.email.length > 0) {
      const existingUser = await ctx.db
        .query("users")
        .withIndex("by_email", (q) => q.eq("email", updates.email!))
        .first();
      
      if (existingUser && existingUser._id !== userId) {
        throw new ConvexError("Email already taken");
      }
    }

    return await ctx.db.patch(userId, {
      ...updates,
      updatedAt: Date.now(),
    });
  },
}); 

export const updatePassword = mutation({
  args: {
    email: v.string(),
    password: v.string(),
  },
  handler: async (ctx, args) => {
    // Find user by email
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();

    if (!user) {
      throw new ConvexError("User not found");
    }

    // Update the password
    return await ctx.db.patch(user._id, {
      password: args.password,
      updatedAt: Date.now(),
    });
  },
}); 

export const migrateUserReferences = mutation({
  args: {
    oldUserId: v.id("users"),
    newUserId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const { oldUserId, newUserId } = args;
    
    // Update organizations
    const organizations = await ctx.db
      .query("organizations")
      .withIndex("by_userId", (q) => q.eq("userId", oldUserId))
      .collect();
    
    for (const org of organizations) {
      await ctx.db.patch(org._id, { userId: newUserId });
    }
    
    // Update projects
    const projects = await ctx.db
      .query("projects")
      .withIndex("by_userId", (q) => q.eq("userId", oldUserId))
      .collect();
    
    for (const project of projects) {
      await ctx.db.patch(project._id, { userId: newUserId });
    }
    
    // Update tasks
    const tasks = await ctx.db
      .query("tasks")
      .withIndex("by_userId", (q) => q.eq("userId", oldUserId))
      .collect();
    
    for (const task of tasks) {
      await ctx.db.patch(task._id, { userId: newUserId });
    }
    
    // Update notes
    const notes = await ctx.db
      .query("notes")
      .withIndex("by_userId", (q) => q.eq("userId", oldUserId))
      .collect();
    
    for (const note of notes) {
      await ctx.db.patch(note._id, { userId: newUserId });
    }
    
    // Update habits
    const habits = await ctx.db
      .query("habits")
      .withIndex("by_userId", (q) => q.eq("userId", oldUserId))
      .collect();
    
    for (const habit of habits) {
      await ctx.db.patch(habit._id, { userId: newUserId });
    }
    
    // Update habit entries
    const habitEntries = await ctx.db
      .query("habitEntries")
      .withIndex("by_userId", (q) => q.eq("userId", oldUserId))
      .collect();
    
    for (const entry of habitEntries) {
      await ctx.db.patch(entry._id, { userId: newUserId });
    }
    
    // Update pomodoro sessions
    const pomodoroSessions = await ctx.db
      .query("pomodoroSessions")
      .withIndex("by_userId", (q) => q.eq("userId", oldUserId))
      .collect();
    
    for (const session of pomodoroSessions) {
      await ctx.db.patch(session._id, { userId: newUserId });
    }
    
    // Update accounts
    const accounts = await ctx.db
      .query("accounts")
      .withIndex("by_userId", (q) => q.eq("userId", oldUserId))
      .collect();
    
    for (const account of accounts) {
      await ctx.db.patch(account._id, { userId: newUserId });
    }
    
    // Update sessions
    const sessions = await ctx.db
      .query("sessions")
      .withIndex("by_userId", (q) => q.eq("userId", oldUserId))
      .collect();
    
    for (const session of sessions) {
      await ctx.db.patch(session._id, { userId: newUserId });
    }
    
    return {
      organizations: organizations.length,
      projects: projects.length,
      tasks: tasks.length,
      notes: notes.length,
      habits: habits.length,
      habitEntries: habitEntries.length,
      pomodoroSessions: pomodoroSessions.length,
      accounts: accounts.length,
      sessions: sessions.length,
    };
  },
}); 