import { create } from 'zustand'

export interface Note {
  id: string
  title: string
  content: string
  tags: string[]
  projectId?: string
  createdAt: string
  updatedAt: string
}

interface NoteState {
  notes: Note[]
  setNotes: (notes: Note[]) => void
  addNote: (note: { title: string; content: string; tags: string[] | string; projectId?: string }) => Promise<void>
  updateNote: (id: string, note: Partial<{ title: string; content: string; tags: string[] | string; projectId?: string }>) => Promise<void>
  deleteNote: (id: string) => Promise<void>
  getNotesByProject: (projectId: string) => Note[]
  fetchNotes: () => Promise<void>
}

export const useNoteStore = create<NoteState>((set, get) => ({
  notes: [],

  setNotes: (notes) => set({ notes }),

  addNote: async (note) => {
    try {
      const response = await fetch('/api/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: note.title,
          content: note.content,
          tags: Array.isArray(note.tags) ? note.tags : (note.tags as string).split(',').map((tag: string) => tag.trim()).filter(Boolean),
          projectId: note.projectId
        }),
      })
      
      if (!response.ok) throw new Error('Failed to create note')
      
      const newNote = await response.json()
      set((state) => ({
        notes: [newNote, ...state.notes]
      }))
    } catch (error) {
      console.error('Error adding note:', error)
      throw error
    }
  },

  updateNote: async (id, updatedNote) => {
    try {
      const response = await fetch('/api/notes', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id,
          ...updatedNote,
          tags: Array.isArray(updatedNote.tags) 
            ? updatedNote.tags 
            : updatedNote.tags ? (updatedNote.tags as string).split(',').map((tag: string) => tag.trim()).filter(Boolean) : []
        }),
      })
      
      if (!response.ok) throw new Error('Failed to update note')
      
      const updated = await response.json()
      set((state) => ({
        notes: state.notes.map((note) =>
          note.id === id ? updated : note
        )
      }))
    } catch (error) {
      console.error('Error updating note:', error)
      throw error
    }
  },

  deleteNote: async (id) => {
    try {
      const response = await fetch(`/api/notes?id=${id}`, {
        method: 'DELETE',
      })
      
      if (!response.ok) throw new Error('Failed to delete note')
      
      set((state) => ({
        notes: state.notes.filter((note) => note.id !== id)
      }))
    } catch (error) {
      console.error('Error deleting note:', error)
      throw error
    }
  },

  getNotesByProject: (projectId) => {
    return get().notes.filter((note) => note.projectId === projectId)
  },

  fetchNotes: async () => {
    try {
      const response = await fetch('/api/notes')
      if (!response.ok) throw new Error('Failed to fetch notes')
      const notes = await response.json()
      set({ notes })
    } catch (error) {
      console.error('Error fetching notes:', error)
      throw error
    }
  }
})) 