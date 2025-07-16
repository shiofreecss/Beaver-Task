import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const getUserNotes = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const notes = await ctx.db
      .query("notes")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .collect();

    // Get project info for each note
    const notesWithProjects = await Promise.all(
      notes.map(async (note) => {
        let project = null;
        if (note.projectId) {
          const proj = await ctx.db.get(note.projectId);
          project = proj ? { id: proj._id, name: proj.name } : null;
        }

        return {
          ...note,
          id: note._id,
          createdAt: new Date(note.createdAt).toISOString(),
          updatedAt: new Date(note.updatedAt).toISOString(),
          tags: note.tags.split(',').map(tag => tag.trim()).filter(Boolean),
          projectName: project?.name || null,
          project
        };
      })
    );

    return notesWithProjects.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  },
});

export const createNote = mutation({
  args: {
    title: v.string(),
    content: v.string(),
    tags: v.string(),
    projectId: v.optional(v.id("projects")),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const noteId = await ctx.db.insert("notes", {
      title: args.title,
      content: args.content,
      tags: args.tags,
      projectId: args.projectId,
      userId: args.userId,
      createdAt: now,
      updatedAt: now,
    });

    const note = await ctx.db.get(noteId);
    if (!note) return null;

    // Get project info if exists
    let project = null;
    if (note.projectId) {
      const proj = await ctx.db.get(note.projectId);
      project = proj ? { id: proj._id, name: proj.name } : null;
    }

    return {
      ...note,
      id: note._id,
      createdAt: new Date(note.createdAt).toISOString(),
      updatedAt: new Date(note.updatedAt).toISOString(),
      tags: note.tags.split(',').map(tag => tag.trim()).filter(Boolean),
      projectName: project?.name || null,
      project
    };
  },
});

export const updateNote = mutation({
  args: {
    noteId: v.id("notes"),
    userId: v.id("users"),
    title: v.string(),
    content: v.string(),
    tags: v.string(),
    projectId: v.optional(v.id("projects")),
  },
  handler: async (ctx, args) => {
    const { noteId, userId, ...updates } = args;

    await ctx.db.patch(noteId, {
      ...updates,
      updatedAt: Date.now(),
    });

    const updatedNote = await ctx.db.get(noteId);
    if (!updatedNote) return null;

    // Get project info if exists
    let project = null;
    if (updatedNote.projectId) {
      const proj = await ctx.db.get(updatedNote.projectId);
      project = proj ? { id: proj._id, name: proj.name } : null;
    }

    return {
      ...updatedNote,
      id: updatedNote._id,
      createdAt: new Date(updatedNote.createdAt).toISOString(),
      updatedAt: new Date(updatedNote.updatedAt).toISOString(),
      tags: updatedNote.tags.split(',').map(tag => tag.trim()).filter(Boolean),
      projectName: project?.name || null,
      project
    };
  },
});

export const deleteNote = mutation({
  args: {
    noteId: v.id("notes"),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    // Verify note exists and belongs to user
    const note = await ctx.db.get(args.noteId);
    if (!note || note.userId !== args.userId) {
      throw new Error("Note not found or unauthorized");
    }

    await ctx.db.delete(args.noteId);
  },
}); 