import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    name: v.optional(v.string()),
    email: v.string(),
    password: v.string(),
    emailVerified: v.optional(v.number()),
    image: v.optional(v.string()),
    settings: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_email", ["email"]),

  accounts: defineTable({
    userId: v.id("users"),
    type: v.string(),
    provider: v.string(),
    providerAccountId: v.string(),
    refresh_token: v.optional(v.string()),
    access_token: v.optional(v.string()),
    expires_at: v.optional(v.number()),
    token_type: v.optional(v.string()),
    scope: v.optional(v.string()),
    id_token: v.optional(v.string()),
    session_state: v.optional(v.string()),
  })
    .index("by_userId", ["userId"])
    .index("by_provider_account", ["provider", "providerAccountId"]),

  sessions: defineTable({
    sessionToken: v.string(),
    userId: v.id("users"),
    expires: v.number(),
  })
    .index("by_sessionToken", ["sessionToken"])
    .index("by_userId", ["userId"]),

  verificationTokens: defineTable({
    identifier: v.string(),
    token: v.string(),
    expires: v.number(),
  })
    .index("by_identifier_token", ["identifier", "token"])
    .index("by_token", ["token"]),

  organizations: defineTable({
    name: v.string(),
    description: v.optional(v.string()),
    color: v.optional(v.string()),
    userId: v.id("users"),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_userId", ["userId"]),

  projects: defineTable({
    name: v.string(),
    description: v.optional(v.string()),
    status: v.string(),
    color: v.optional(v.string()),
    dueDate: v.optional(v.number()),
    userId: v.id("users"),
    organizationId: v.optional(v.id("organizations")),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_userId", ["userId"])
    .index("by_organizationId", ["organizationId"]),

  kanbanColumns: defineTable({
    name: v.string(),
    color: v.string(),
    order: v.number(),
    projectId: v.optional(v.id("projects")),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_projectId", ["projectId"])
    .index("by_order", ["order"]),

  tasks: defineTable({
    title: v.string(),
    description: v.optional(v.string()),
    status: v.string(),
    priority: v.string(),
    severity: v.string(),
    dueDate: v.optional(v.number()),
    projectId: v.optional(v.id("projects")),
    userId: v.id("users"),
    parentId: v.optional(v.id("tasks")),
    columnId: v.optional(v.id("kanbanColumns")),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_userId", ["userId"])
    .index("by_projectId", ["projectId"])
    .index("by_parentId", ["parentId"])
    .index("by_columnId", ["columnId"]),

  notes: defineTable({
    title: v.string(),
    content: v.string(),
    tags: v.string(),
    projectId: v.optional(v.id("projects")),
    userId: v.id("users"),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_userId", ["userId"])
    .index("by_projectId", ["projectId"]),

  habits: defineTable({
    name: v.string(),
    description: v.optional(v.string()),
    frequency: v.string(),
    target: v.number(),
    color: v.optional(v.string()),
    userId: v.id("users"),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_userId", ["userId"]),

  habitEntries: defineTable({
    habitId: v.id("habits"),
    date: v.number(),
    completed: v.boolean(),
    value: v.number(),
    userId: v.id("users"),
    createdAt: v.number(),
  })
    .index("by_habitId", ["habitId"])
    .index("by_userId", ["userId"])
    .index("by_habit_date_user", ["habitId", "date", "userId"]),

  pomodoroSessions: defineTable({
    duration: v.number(),
    type: v.string(),
    completed: v.boolean(),
    startTime: v.optional(v.number()),
    endTime: v.optional(v.number()),
    taskId: v.optional(v.id("tasks")),
    userId: v.id("users"),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_userId", ["userId"])
    .index("by_taskId", ["taskId"]),
}); 