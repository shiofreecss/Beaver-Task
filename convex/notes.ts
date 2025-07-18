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
          type: note.type || 'simple', // Default to 'simple' for existing notes
          createdAt: new Date(note.createdAt).toISOString(),
          updatedAt: new Date(note.updatedAt).toISOString(),
          tags: note.tags.split(',').map(tag => tag.trim()).filter(Boolean),
          meetingDate: note.meetingDate ? new Date(note.meetingDate).toISOString() : null,
          lastEditedTime: note.lastEditedTime ? new Date(note.lastEditedTime).toISOString() : null,
          attendees: note.attendees || [],
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
    type: v.optional(v.string()), // Make type optional for backward compatibility
    projectId: v.optional(v.id("projects")),
    taskId: v.optional(v.id("tasks")),
    userId: v.id("users"),
    // Meeting-specific fields
    meetingDate: v.optional(v.number()),
    meetingCategory: v.optional(v.string()),
    attendees: v.optional(v.array(v.string())),
    summaryAI: v.optional(v.string()),
    // Document-specific fields
    documentCategory: v.optional(v.string()),
    lastEditedBy: v.optional(v.string()),
    lastEditedTime: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const noteId = await ctx.db.insert("notes", {
      title: args.title,
      content: args.content,
      tags: args.tags,
      type: args.type || 'simple', // Default to 'simple' if not provided
      projectId: args.projectId,
      taskId: args.taskId,
      userId: args.userId,
      // Meeting-specific fields
      meetingDate: args.meetingDate,
      meetingCategory: args.meetingCategory,
      attendees: args.attendees,
      summaryAI: args.summaryAI,
      // Document-specific fields
      documentCategory: args.documentCategory,
      lastEditedBy: args.lastEditedBy,
      lastEditedTime: args.lastEditedTime || now,
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
      type: note.type || 'simple',
      createdAt: new Date(note.createdAt).toISOString(),
      updatedAt: new Date(note.updatedAt).toISOString(),
      tags: note.tags.split(',').map(tag => tag.trim()).filter(Boolean),
      meetingDate: note.meetingDate ? new Date(note.meetingDate).toISOString() : null,
      lastEditedTime: note.lastEditedTime ? new Date(note.lastEditedTime).toISOString() : null,
      attendees: note.attendees || [],
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
    type: v.optional(v.string()), // Make type optional for backward compatibility
    projectId: v.optional(v.id("projects")),
    taskId: v.optional(v.id("tasks")),
    // Meeting-specific fields
    meetingDate: v.optional(v.number()),
    meetingCategory: v.optional(v.string()),
    attendees: v.optional(v.array(v.string())),
    summaryAI: v.optional(v.string()),
    // Document-specific fields
    documentCategory: v.optional(v.string()),
    lastEditedBy: v.optional(v.string()),
    lastEditedTime: v.optional(v.number()),
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
      type: updates.type || existingNote.type || 'simple', // Preserve existing type or default to 'simple'
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

    return {
      ...updatedNote,
      id: updatedNote._id,
      type: updatedNote.type || 'simple',
      createdAt: new Date(updatedNote.createdAt).toISOString(),
      updatedAt: new Date(updatedNote.updatedAt).toISOString(),
      tags: updatedNote.tags.split(',').map(tag => tag.trim()).filter(Boolean),
      meetingDate: updatedNote.meetingDate ? new Date(updatedNote.meetingDate).toISOString() : null,
      lastEditedTime: updatedNote.lastEditedTime ? new Date(updatedNote.lastEditedTime).toISOString() : null,
      attendees: updatedNote.attendees || [],
      projectName: project?.name || null,
      project,
      taskName: task?.title || null,
      task
    };
  },
});

export const deleteNote = mutation({
  args: { noteId: v.id("notes"), userId: v.id("users") },
  handler: async (ctx, args) => {
    const note = await ctx.db.get(args.noteId);
    if (!note) {
      throw new Error("Note not found");
    }
    
    if (note.userId !== args.userId) {
      throw new Error("Note does not belong to user");
    }

    await ctx.db.delete(args.noteId);
    return { success: true };
  },
}); 