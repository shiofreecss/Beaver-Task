import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const getKanbanColumns = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    // Get global columns (projectId is null) and user's project columns
    const userProjects = await ctx.db
      .query("projects")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .collect();

    const projectIds = userProjects.map(p => p._id);

    const allColumns = await ctx.db
      .query("kanbanColumns")
      .collect();

    // Filter columns that are either global or belong to user's projects
    const userColumns = allColumns.filter(column => 
      !column.projectId || projectIds.includes(column.projectId)
    );

    return userColumns.sort((a, b) => a.order - b.order);
  },
});

export const createKanbanColumn = mutation({
  args: {
    name: v.string(),
    color: v.string(),
    order: v.number(),
    projectId: v.optional(v.id("projects")),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const { userId, ...columnData } = args;

    // If projectId is provided, verify the project belongs to the user
    if (columnData.projectId) {
      const project = await ctx.db.get(columnData.projectId);
      if (!project || project.userId !== userId) {
        throw new Error("Project not found or unauthorized");
      }
    }

    const now = Date.now();
    return await ctx.db.insert("kanbanColumns", {
      ...columnData,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const updateKanbanColumn = mutation({
  args: {
    columnId: v.id("kanbanColumns"),
    userId: v.id("users"),
    name: v.optional(v.string()),
    color: v.optional(v.string()),
    order: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { columnId, userId, ...updates } = args;

    // Verify column ownership through project
    const column = await ctx.db.get(columnId);
    if (!column) throw new Error("Column not found");

    if (column.projectId) {
      const project = await ctx.db.get(column.projectId);
      if (!project || project.userId !== userId) {
        throw new Error("Unauthorized");
      }
    }

    await ctx.db.patch(columnId, {
      ...updates,
      updatedAt: Date.now(),
    });

    return await ctx.db.get(columnId);
  },
});

export const deleteKanbanColumn = mutation({
  args: {
    columnId: v.id("kanbanColumns"),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const { columnId, userId } = args;

    // Verify column exists and ownership through project
    const column = await ctx.db.get(columnId);
    if (!column) throw new Error("Column not found");

    if (column.projectId) {
      const project = await ctx.db.get(column.projectId);
      if (!project || project.userId !== userId) {
        throw new Error("Unauthorized");
      }
    }

    // Delete the column
    await ctx.db.delete(columnId);
  },
}); 