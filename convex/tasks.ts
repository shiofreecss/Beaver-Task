import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { ConvexError } from "convex/values";

export const getUserTasks = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const tasks = await ctx.db
      .query("tasks")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .collect();

    // Get associated projects for each task
    const tasksWithProjects = await Promise.all(
      tasks.map(async (task) => {
        if (task.projectId) {
          const project = await ctx.db.get(task.projectId);
          return {
            ...task,
            id: task._id,
            dueDate: task.dueDate ? new Date(task.dueDate).toISOString() : null,
            createdAt: new Date(task.createdAt).toISOString(),
            updatedAt: new Date(task.updatedAt).toISOString(),
            project: project ? { id: project._id, name: project.name } : null,
          };
        }
        return { 
          ...task, 
          id: task._id,
          dueDate: task.dueDate ? new Date(task.dueDate).toISOString() : null,
          createdAt: new Date(task.createdAt).toISOString(),
          updatedAt: new Date(task.updatedAt).toISOString(),
          project: null 
        };
      })
    );

    return tasksWithProjects.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  },
});

export const createTask = mutation({
  args: {
    title: v.string(),
    description: v.optional(v.string()),
    status: v.optional(v.string()),
    priority: v.optional(v.string()),
    severity: v.optional(v.string()),
    dueDate: v.optional(v.number()),
    projectId: v.optional(v.id("projects")),
    parentId: v.optional(v.id("tasks")),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    // Validate project if projectId is provided
    if (args.projectId) {
      const project = await ctx.db.get(args.projectId);
      if (!project || project.userId !== args.userId) {
        throw new ConvexError("Project not found or unauthorized");
      }
    }

    const now = Date.now();
    const taskId = await ctx.db.insert("tasks", {
      title: args.title,
      description: args.description,
      status: args.status || "ACTIVE",
      priority: args.priority || "P1",
      severity: args.severity || "S1",
      dueDate: args.dueDate,
      projectId: args.projectId,
      parentId: args.parentId,
      userId: args.userId,
      createdAt: now,
      updatedAt: now,
    });

    const task = await ctx.db.get(taskId);
    if (!task) return null;

    // Get project info if exists
    let project = null;
    if (task.projectId) {
      const proj = await ctx.db.get(task.projectId);
      project = proj ? { id: proj._id, name: proj.name } : null;
    }

    return { 
      ...task, 
      id: task._id,
      dueDate: task.dueDate ? new Date(task.dueDate).toISOString() : null,
      createdAt: new Date(task.createdAt).toISOString(),
      updatedAt: new Date(task.updatedAt).toISOString(),
      project 
    };
  },
});

export const updateTask = mutation({
  args: {
    taskId: v.id("tasks"),
    userId: v.id("users"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    status: v.optional(v.string()),
    priority: v.optional(v.string()),
    severity: v.optional(v.string()),
    dueDate: v.optional(v.number()),
    projectId: v.optional(v.id("projects")),
    parentId: v.optional(v.id("tasks")),
  },
  handler: async (ctx, args) => {
    const { taskId, userId, ...updates } = args;

    // Verify task exists and belongs to user
    const existingTask = await ctx.db.get(taskId);
    if (!existingTask || existingTask.userId !== userId) {
      throw new ConvexError("Task not found or unauthorized");
    }

    // Validate project if projectId is provided
    if (updates.projectId) {
      const project = await ctx.db.get(updates.projectId);
      if (!project || project.userId !== userId) {
        throw new ConvexError("Project not found or unauthorized");
      }
    }

    // Filter out undefined values
    const filteredUpdates: any = {};
    Object.entries(updates).forEach(([key, value]) => {
      if (value !== undefined) {
        filteredUpdates[key] = value;
      }
    });

    await ctx.db.patch(taskId, {
      ...filteredUpdates,
      updatedAt: Date.now(),
    });

    const updatedTask = await ctx.db.get(taskId);
    if (!updatedTask) return null;

    // Get project info if exists
    let project = null;
    if (updatedTask.projectId) {
      const proj = await ctx.db.get(updatedTask.projectId);
      project = proj ? { id: proj._id, name: proj.name } : null;
    }

    return { 
      ...updatedTask, 
      id: updatedTask._id,
      dueDate: updatedTask.dueDate ? new Date(updatedTask.dueDate).toISOString() : null,
      createdAt: new Date(updatedTask.createdAt).toISOString(),
      updatedAt: new Date(updatedTask.updatedAt).toISOString(),
      project 
    };
  },
});

export const deleteTask = mutation({
  args: {
    taskId: v.id("tasks"),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    // Verify task exists and belongs to user
    const existingTask = await ctx.db.get(args.taskId);
    if (!existingTask || existingTask.userId !== args.userId) {
      throw new ConvexError("Task not found or unauthorized");
    }

    await ctx.db.delete(args.taskId);
  },
});

export const moveTask = mutation({
  args: {
    taskId: v.id("tasks"),
    userId: v.id("users"),
    columnId: v.string(),
  },
  handler: async (ctx, args) => {
    // Verify task exists and belongs to user
    const existingTask = await ctx.db.get(args.taskId);
    if (!existingTask || existingTask.userId !== args.userId) {
      throw new ConvexError("Task not found or unauthorized");
    }

    // Map column IDs to status values for default columns
    const columnIdToStatus: Record<string, string> = {
      'active': 'ACTIVE',
      'planning': 'PLANNING', 
      'in_progress': 'IN_PROGRESS',
      'on_hold': 'ON_HOLD',
      'completed': 'COMPLETED'
    };

    const status = columnIdToStatus[args.columnId] || 'ACTIVE';

    await ctx.db.patch(args.taskId, {
      status,
      updatedAt: Date.now(),
    });

    const updatedTask = await ctx.db.get(args.taskId);
    if (!updatedTask) return null;

    // Get project info if exists
    let project = null;
    if (updatedTask.projectId) {
      const proj = await ctx.db.get(updatedTask.projectId);
      project = proj ? { id: proj._id, name: proj.name } : null;
    }

    return { 
      ...updatedTask, 
      id: updatedTask._id,
      dueDate: updatedTask.dueDate ? new Date(updatedTask.dueDate).toISOString() : null,
      createdAt: new Date(updatedTask.createdAt).toISOString(),
      updatedAt: new Date(updatedTask.updatedAt).toISOString(),
      project 
    };
  },
}); 