import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { ConvexError } from "convex/values";

export const getUserOrganizations = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const organizations = await ctx.db
      .query("organizations")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .collect();

    // Get projects for each organization
    const organizationsWithProjects = await Promise.all(
      organizations.map(async (organization) => {
        const projects = await ctx.db
          .query("projects")
          .withIndex("by_organizationId", (q) => q.eq("organizationId", organization._id))
          .collect();

        const projectSummary = projects.map(project => ({
          id: project._id,
          name: project.name,
          status: project.status
        }));

        return {
          ...organization,
          id: organization._id,
          createdAt: new Date(organization.createdAt).toISOString(),
          updatedAt: new Date(organization.updatedAt).toISOString(),
          projects: projectSummary
        };
      })
    );

    return organizationsWithProjects.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  },
});

export const createOrganization = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
    color: v.optional(v.string()),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const id = await ctx.db.insert("organizations", {
      name: args.name,
      description: args.description,
      color: args.color,
      userId: args.userId,
      createdAt: now,
      updatedAt: now,
    });

    // Return the complete organization object
    const organization = await ctx.db.get(id);
    return {
      ...organization,
      id: organization?._id,
      createdAt: new Date(organization?.createdAt || now).toISOString(),
      updatedAt: new Date(organization?.updatedAt || now).toISOString(),
    };
  },
});

export const updateOrganization = mutation({
  args: {
    id: v.id("organizations"),
    name: v.string(),
    description: v.optional(v.string()),
    color: v.optional(v.string()),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const organization = await ctx.db.get(args.id);
    if (!organization) {
      throw new ConvexError("Organization not found");
    }
    
    if (organization.userId !== args.userId) {
      throw new ConvexError("Unauthorized");
    }

    const now = Date.now();
    await ctx.db.patch(args.id, {
      name: args.name,
      description: args.description,
      color: args.color,
      updatedAt: now,
    });

    // Return the complete updated organization object
    const updatedOrganization = await ctx.db.get(args.id);
    return {
      ...updatedOrganization,
      id: updatedOrganization?._id,
      createdAt: new Date(updatedOrganization?.createdAt || now).toISOString(),
      updatedAt: new Date(updatedOrganization?.updatedAt || now).toISOString(),
    };
  },
});

export const deleteOrganization = mutation({
  args: {
    id: v.id("organizations"),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const organization = await ctx.db.get(args.id);
    if (!organization) {
      throw new ConvexError("Organization not found");
    }
    
    if (organization.userId !== args.userId) {
      throw new ConvexError("Unauthorized");
    }

    return await ctx.db.delete(args.id);
  },
}); 