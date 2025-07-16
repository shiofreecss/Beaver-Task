import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { ConvexError } from "convex/values";

export const getUserByEmail = query({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();
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