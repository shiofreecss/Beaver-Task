'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Plus, Search, Tag, MoreVertical, Pencil, Trash2, FolderKanban } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { toast } from "@/components/ui/use-toast"
import { useNoteStore } from '@/store/notes'
import { useProjectStore } from '@/store/projects'
import { CreateNoteModal } from '@/components/notes/create-note-modal'

export function NotesView() {
  const [searchTerm, setSearchTerm] = useState('')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingNote, setEditingNote] = useState<any>(null)

  // Get notes and projects from stores
  const notes = useNoteStore((state) => state.notes)
  const addNote = useNoteStore((state) => state.addNote)
  const updateNote = useNoteStore((state) => state.updateNote)
  const deleteNote = useNoteStore((state) => state.deleteNote)
  const projects = useProjectStore((state) => state.projects)

  const filteredNotes = notes.filter(note =>
    note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    note.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
    note.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  const handleCreateNote = (noteData: any) => {
    addNote({
      title: noteData.title,
      content: noteData.content,
      tags: noteData.tags.split(',').map((tag: string) => tag.trim()).filter(Boolean),
      projectId: noteData.projectId || undefined
    })
    setShowCreateModal(false)
    toast({
      title: "Note created",
      description: `${noteData.title} has been created successfully.`,
    })
  }

  const handleEditNote = (noteData: any) => {
    if (!editingNote) return

    updateNote(editingNote.id, {
      title: noteData.title,
      content: noteData.content,
      tags: noteData.tags.split(',').map((tag: string) => tag.trim()).filter(Boolean),
      projectId: noteData.projectId || undefined
    })
    setEditingNote(null)
    toast({
      title: "Note updated",
      description: `${noteData.title} has been updated successfully.`,
    })
  }

  const handleDeleteNote = (noteId: string) => {
    const noteToDelete = notes.find(note => note.id === noteId)
    if (!noteToDelete) return

    deleteNote(noteId)
    toast({
      title: "Note deleted",
      description: "The note has been deleted successfully.",
    })
  }

  const getProjectName = (projectId: string | undefined) => {
    if (!projectId) return null
    const project = projects.find(p => p.id === projectId)
    return project?.name
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Notes</h1>
        <Button onClick={() => setShowCreateModal(true)}>
          <Plus className="h-4 w-4 mr-2" />
          New Note
        </Button>
      </div>

      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search notes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredNotes.map((note) => (
          <Card key={note.id}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xl font-bold">{note.title}</CardTitle>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-8 w-8 p-0">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setEditingNote(note)}>
                    <Pencil className="h-4 w-4 mr-2" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleDeleteNote(note.id)}>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">{note.content}</p>
              
              <div className="flex items-center gap-2 mb-4">
                {note.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary"
                  >
                    <Tag className="h-3 w-3 mr-1" />
                    {tag}
                  </span>
                ))}
              </div>

              {note.projectId && (
                <div className="flex items-center text-sm text-muted-foreground">
                  <FolderKanban className="h-3 w-3 mr-1" />
                  {getProjectName(note.projectId)}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <CreateNoteModal
        open={showCreateModal}
        onOpenChange={setShowCreateModal}
        onSubmit={handleCreateNote}
        projects={projects}
      />

      <CreateNoteModal
        open={!!editingNote}
        onOpenChange={(open) => !open && setEditingNote(null)}
        onSubmit={handleEditNote}
        projects={projects}
        initialData={editingNote}
      />
    </div>
  )
} 