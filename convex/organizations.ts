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

    // Sort by order first, then by creation date
    return organizationsWithProjects.sort((a, b) => {
      if (a.order !== undefined && b.order !== undefined) {
        return a.order - b.order;
      }
      if (a.order !== undefined) return -1;
      if (b.order !== undefined) return 1;
      return b.createdAt.localeCompare(a.createdAt);
    });
  },
});

export const createOrganization = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
    color: v.optional(v.string()),
    userId: v.id("users"),
    department: v.optional(v.string()),
    categories: v.optional(v.array(v.string())),
    website: v.optional(v.string()),
    documents: v.optional(v.array(v.string())),
    order: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    
    // If order is not provided, get the highest order and add 1
    let order = args.order;
    if (order === undefined) {
      const organizations = await ctx.db
        .query("organizations")
        .withIndex("by_userId", (q) => q.eq("userId", args.userId))
        .collect();
      
      const maxOrder = Math.max(...organizations.map(org => org.order ?? -1));
      order = maxOrder + 1;
    }

    const id = await ctx.db.insert("organizations", {
      name: args.name,
      description: args.description,
      color: args.color,
      userId: args.userId,
      department: args.department,
      categories: args.categories,
      website: args.website,
      documents: args.documents,
      order,
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
    department: v.optional(v.string()),
    categories: v.optional(v.array(v.string())),
    website: v.optional(v.string()),
    documents: v.optional(v.array(v.string())),
    order: v.optional(v.number()),
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
      department: args.department,
      categories: args.categories,
      website: args.website,
      documents: args.documents,
      order: args.order,
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

    // Get all organizations to reorder after deletion
    const organizations = await ctx.db
      .query("organizations")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .collect();

    // Delete the organization
    await ctx.db.delete(args.id);

    // Update order for remaining organizations
    const deletedOrder = organization.order;
    if (deletedOrder !== undefined) {
      for (const org of organizations) {
        if (org._id !== args.id && org.order !== undefined && org.order > deletedOrder) {
          await ctx.db.patch(org._id, { order: org.order - 1 });
        }
      }
    }

    return { success: true };
  },
}); 