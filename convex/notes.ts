import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const getUserNotes = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const notes = await ctx.db
      .query("notes")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .collect();

    // Get project and task info for each note
    const notesWithDetails = await Promise.all(
      notes.map(async (note) => {
        let project = null;
        if (note.projectId) {
          const proj = await ctx.db.get(note.projectId);
          project = proj ? { id: proj._id, name: proj.name } : null;
        }

        let task = null;
        if (note.taskId) {
          const taskData = await ctx.db.get(note.taskId);
          task = taskData ? { id: taskData._id, title: taskData.title } : null;
        }

        return {
          ...note,
          id: note._id,
          createdAt: new Date(note.createdAt).toISOString(),
          updatedAt: new Date(note.updatedAt).toISOString(),
          tags: note.tags.split(',').map(tag => tag.trim()).filter(Boolean),
          projectName: project?.name || null,
          project,
          taskName: task?.title || null,
          task
        };
      })
    );

    return notesWithDetails.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  },
});

export const createNote = mutation({
  args: {
    title: v.string(),
    content: v.string(),
    tags: v.string(),
    projectId: v.optional(v.id("projects")),
    taskId: v.optional(v.id("tasks")),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const noteId = await ctx.db.insert("notes", {
      title: args.title,
      content: args.content,
      tags: args.tags,
      projectId: args.projectId,
      taskId: args.taskId,
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

    // Get task info if exists
    let task = null;
    if (note.taskId) {
      const taskData = await ctx.db.get(note.taskId);
      task = taskData ? { id: taskData._id, title: taskData.title } : null;
    }

    return {
      ...note,
      id: note._id,
      createdAt: new Date(note.createdAt).toISOString(),
      updatedAt: new Date(note.updatedAt).toISOString(),
      tags: note.tags.split(',').map(tag => tag.trim()).filter(Boolean),
      projectName: project?.name || null,
      project,
      taskName: task?.title || null,
      task
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
    taskId: v.optional(v.id("tasks")),
  },
  handler: async (ctx, args) => {
    console.log('Convex updateNote called with args:', args);
    
    const { noteId, userId, ...updates } = args;

    // Verify note exists and belongs to user
    const existingNote = await ctx.db.get(noteId);
    if (!existingNote) {
      console.log('Note not found:', noteId);
      throw new Error("Note not found");
    }
    
    if (existingNote.userId !== userId) {
      console.log('Note does not belong to user:', { noteUserId: existingNote.userId, userId });
      throw new Error("Note does not belong to user");
    }

    console.log('Updating note with:', updates);
    await ctx.db.patch(noteId, {
      ...updates,
      updatedAt: Date.now(),
    });

    const updatedNote = await ctx.db.get(noteId);
    if (!updatedNote) {
      console.log('Failed to get updated note');
      return null;
    }

    // Get project info if exists
    let project = null;
    if (updatedNote.projectId) {
      const proj = await ctx.db.get(updatedNote.projectId);
      project = proj ? { id: proj._id, name: proj.name } : null;
    }

    // Get task info if exists
    let task = null;
    if (updatedNote.taskId) {
      const taskData = await ctx.db.get(updatedNote.taskId);
      task = taskData ? { id: taskData._id, title: taskData.title } : null;
    }

    const result = {
      ...updatedNote,
      id: updatedNote._id,
      createdAt: new Date(updatedNote.createdAt).toISOString(),
      updatedAt: new Date(updatedNote.updatedAt).toISOString(),
      tags: updatedNote.tags.split(',').map(tag => tag.trim()).filter(Boolean),
      projectName: project?.name || null,
      project,
      taskName: task?.title || null,
      task
    };
    
    console.log('Note updated successfully:', result);
    return result;
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