import { mutation } from "./_generated/server";

// Migration to add type field to existing notes
export const migrateExistingNotes = mutation({
  args: {},
  handler: async (ctx) => {
    const notes = await ctx.db.query("notes").collect();
    
    let updatedCount = 0;
    for (const note of notes) {
      if (!note.type) {
        await ctx.db.patch(note._id, {
          type: 'simple'
        });
        updatedCount++;
      }
    }
    
    return { updatedCount, totalNotes: notes.length };
  },
}); 