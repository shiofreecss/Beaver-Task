import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { ConvexError } from "convex/values";

export const getUserProjects = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const projects = await ctx.db
      .query("projects")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .collect();

    // Get organization info and tasks for each project
    const projectsWithDetails = await Promise.all(
      projects.map(async (project) => {
        let organization = null;
        if (project.organizationId) {
          const org = await ctx.db.get(project.organizationId);
          organization = org ? { id: org._id, name: org.name } : null;
        }

        const tasks = await ctx.db
          .query("tasks")
          .withIndex("by_projectId", (q) => q.eq("projectId", project._id))
          .collect();

        const taskSummary = tasks.map(task => ({
          id: task._id,
          title: task.title,
          status: task.status
        }));

        return {
          ...project,
          id: project._id,
          dueDate: project.dueDate ? new Date(project.dueDate).toISOString() : null,
          createdAt: new Date(project.createdAt).toISOString(),
          updatedAt: new Date(project.updatedAt).toISOString(),
          organization,
          tasks: taskSummary
        };
      })
    );

    return projectsWithDetails.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  },
});

export const createProject = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
    status: v.string(),
    color: v.optional(v.string()),
    dueDate: v.optional(v.number()),
    organizationId: v.optional(v.id("organizations")),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const projectId = await ctx.db.insert("projects", {
      name: args.name,
      description: args.description,
      status: args.status,
      color: args.color,
      dueDate: args.dueDate,
      organizationId: args.organizationId,
      userId: args.userId,
      createdAt: now,
      updatedAt: now,
    });

    const project = await ctx.db.get(projectId);
    if (!project) return null;

    // Get organization info if exists
    let organization = null;
    if (project.organizationId) {
      const org = await ctx.db.get(project.organizationId);
      organization = org ? { id: org._id, name: org.name } : null;
    }

    return { 
      ...project, 
      id: project._id,
      dueDate: project.dueDate ? new Date(project.dueDate).toISOString() : null,
      createdAt: new Date(project.createdAt).toISOString(),
      updatedAt: new Date(project.updatedAt).toISOString(),
      organization 
    };
  },
});

export const updateProject = mutation({
  args: {
    projectId: v.id("projects"),
    userId: v.id("users"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    status: v.optional(v.string()),
    color: v.optional(v.string()),
    dueDate: v.optional(v.number()),
    organizationId: v.optional(v.id("organizations")),
  },
  handler: async (ctx, args) => {
    const { projectId, userId, ...updates } = args;

    // Verify project exists and belongs to user
    const existingProject = await ctx.db.get(projectId);
    if (!existingProject || existingProject.userId !== userId) {
      throw new ConvexError("Project not found or unauthorized");
    }

    await ctx.db.patch(projectId, {
      ...updates,
      updatedAt: Date.now(),
    });

    const updatedProject = await ctx.db.get(projectId);
    if (!updatedProject) return null;

    // Get organization info if exists
    let organization = null;
    if (updatedProject.organizationId) {
      const org = await ctx.db.get(updatedProject.organizationId);
      organization = org ? { id: org._id, name: org.name } : null;
    }

    return { 
      ...updatedProject, 
      id: updatedProject._id,
      dueDate: updatedProject.dueDate ? new Date(updatedProject.dueDate).toISOString() : null,
      createdAt: new Date(updatedProject.createdAt).toISOString(),
      updatedAt: new Date(updatedProject.updatedAt).toISOString(),
      organization 
    };
  },
});

export const deleteProject = mutation({
  args: {
    projectId: v.id("projects"),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    // Verify project exists and belongs to user
    const existingProject = await ctx.db.get(args.projectId);
    if (!existingProject || existingProject.userId !== args.userId) {
      throw new ConvexError("Project not found or unauthorized");
    }

    await ctx.db.delete(args.projectId);
  },
}); 