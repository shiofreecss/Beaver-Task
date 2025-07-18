import { create } from 'zustand'

export interface Note {
  id: string
  title: string
  content: string
  tags: string[]
  projectId?: string
  taskId?: string
  createdAt: string
  updatedAt: string
  projectName?: string
  taskName?: string
}

interface NoteState {
  notes: Note[]
  setNotes: (notes: Note[]) => void
  addNote: (note: { title: string; content: string; tags: string[] | string; projectId?: string; taskId?: string }) => Promise<void>
  updateNote: (id: string, note: Partial<{ title: string; content: string; tags: string[] | string; projectId?: string; taskId?: string }>) => Promise<void>
  deleteNote: (id: string) => Promise<void>
  getNotesByProject: (projectId: string) => Note[]
  getNotesByTask: (taskId: string) => Note[]
  fetchNotes: () => Promise<void>
  resetStore: () => void
}

export const useNoteStore = create<NoteState>((set, get) => ({
  notes: [],

  setNotes: (notes) => set({ notes }),

  addNote: async (note) => {
    try {
      const response = await fetch('/api/notes-convex', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(note),
      })
      
      if (!response.ok) throw new Error('Failed to create note')
      
      const newNote = await response.json()
      set((state) => ({
        notes: [...state.notes, newNote]
      }))
    } catch (error) {
      console.error('Error adding note:', error)
      throw error
    }
  },

  updateNote: async (id, note) => {
    try {
      console.log('Updating note:', { id, note })
      const response = await fetch('/api/notes-convex', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...note }),
      })
      
      if (!response.ok) {
        const errorText = await response.text()
        console.error('Failed to update note:', response.status, errorText)
        throw new Error(`Failed to update note: ${response.status} ${errorText}`)
      }
      
      const updatedNote = await response.json()
      console.log('Note updated successfully:', updatedNote)
      set((state) => ({
        notes: state.notes.map((n) => 
          n.id === id ? updatedNote : n
        )
      }))
    } catch (error) {
      console.error('Error updating note:', error)
      throw error
    }
  },

  deleteNote: async (id) => {
    try {
      const response = await fetch(`/api/notes-convex?id=${id}`, {
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

  getNotesByTask: (taskId) => {
    return get().notes.filter((note) => note.taskId === taskId)
  },

  fetchNotes: async () => {
    try {
      const response = await fetch('/api/notes-convex')
      if (!response.ok) throw new Error('Failed to fetch notes')
      const notes = await response.json()
      set({ notes })
    } catch (error) {
      console.error('Error fetching notes:', error)
      throw error
    }
  },

  resetStore: () => {
    set({
      notes: []
    })
  }
})) 