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
  addNote: (note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) => void
  updateNote: (id: string, note: Partial<Note>) => void
  deleteNote: (id: string) => void
  getNotesByProject: (projectId: string) => Note[]
}

export const useNoteStore = create<NoteState>((set, get) => ({
  notes: [],
  
  addNote: (note) => set((state) => ({
    notes: [...state.notes, {
      ...note,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }]
  })),

  updateNote: (id, updatedNote) => set((state) => ({
    notes: state.notes.map((note) =>
      note.id === id
        ? { ...note, ...updatedNote, updatedAt: new Date().toISOString() }
        : note
    )
  })),

  deleteNote: (id) => set((state) => ({
    notes: state.notes.filter((note) => note.id !== id)
  })),

  getNotesByProject: (projectId) => {
    return get().notes.filter((note) => note.projectId === projectId)
  }
})) 