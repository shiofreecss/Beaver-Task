'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Plus, Search, Tag, MoreVertical, Pencil, Trash2 } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { toast } from "@/components/ui/use-toast"

export function NotesView() {
  const [notes, setNotes] = useState([
    {
      id: '1',
      title: 'Project Meeting Notes',
      content: 'Discussed the new website redesign project. Key points: mobile-first approach, modern design system, and improved user experience.',
      tags: ['meeting', 'project', 'website'],
      createdAt: '2024-01-15',
      project: 'Website Redesign'
    },
    {
      id: '2',
      title: 'Learning React Hooks',
      content: 'Notes on useState, useEffect, and custom hooks. Important concepts for building better React applications.',
      tags: ['learning', 'react', 'programming'],
      createdAt: '2024-01-14',
      project: null
    },
    {
      id: '3',
      title: 'Marketing Strategy Ideas',
      content: 'Brainstorming session results: social media campaigns, content marketing, and partnership opportunities.',
      tags: ['marketing', 'strategy', 'ideas'],
      createdAt: '2024-01-13',
      project: 'Marketing Campaign'
    }
  ])

  const [searchTerm, setSearchTerm] = useState('')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingNote, setEditingNote] = useState<any>(null)

  const filteredNotes = notes.filter(note =>
    note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    note.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
    note.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  const handleCreateNote = (noteData: any) => {
    const newNote = {
      id: Date.now().toString(),
      title: noteData.title,
      content: noteData.content,
      tags: noteData.tags.split(',').map((tag: string) => tag.trim()).filter(Boolean),
      createdAt: new Date().toISOString().split('T')[0],
      project: noteData.project || null
    }
    setNotes(prev => [...prev, newNote])
    setShowCreateModal(false)
    toast({
      title: "Note created",
      description: `${noteData.title} has been created successfully.`,
    })
  }

  const handleEditNote = (noteData: any) => {
    setNotes(prev => prev.map(note => 
      note.id === editingNote.id 
        ? { 
            ...note, 
            title: noteData.title,
            content: noteData.content,
            tags: noteData.tags.split(',').map((tag: string) => tag.trim()).filter(Boolean),
            project: noteData.project || null
          }
        : note
    ))
    setEditingNote(null)
    toast({
      title: "Note updated",
      description: `${noteData.title} has been updated successfully.`,
    })
  }

  const handleDeleteNote = (noteId: string) => {
    const noteToDelete = notes.find(note => note.id === noteId)
    if (!noteToDelete) return

    setNotes(prev => prev.filter(note => note.id !== noteId))
    toast({
      title: "Note deleted",
      description: "The note has been deleted successfully.",
    })
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Notes</h1>
          <p className="text-muted-foreground">Capture and organize your ideas</p>
        </div>
        <Button onClick={() => setShowCreateModal(true)}>
          <Plus className="mr-2 h-4 w-4" />
          New Note
        </Button>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search notes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Notes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredNotes.map((note) => (
          <Card key={note.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg">{note.title}</CardTitle>
                  <CardDescription className="text-sm text-muted-foreground">
                    {note.createdAt} {note.project && `• ${note.project}`}
                  </CardDescription>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem 
                      onClick={() => setEditingNote(note)}
                      className="flex items-center"
                    >
                      <Pencil className="mr-2 h-4 w-4" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => handleDeleteNote(note.id)}
                      className="flex items-center text-red-600"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                {note.content}
              </p>
              <div className="flex flex-wrap gap-2">
                {note.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-secondary text-secondary-foreground"
                  >
                    <Tag className="mr-1 h-3 w-3" />
                    {tag}
                  </span>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Create/Edit Note Modal would go here */}
      {/* For now, we'll add a simple form - you can enhance this later */}
      {(showCreateModal || editingNote) && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-card p-6 rounded-lg w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold mb-4">
              {editingNote ? 'Edit Note' : 'Create New Note'}
            </h3>
            <form onSubmit={(e) => {
              e.preventDefault()
              const formData = new FormData(e.target as HTMLFormElement)
              const noteData = {
                title: formData.get('title') as string,
                content: formData.get('content') as string,
                tags: formData.get('tags') as string,
                project: formData.get('project') as string
              }
              if (editingNote) {
                handleEditNote(noteData)
              } else {
                handleCreateNote(noteData)
              }
            }}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Title</label>
                  <Input
                    name="title"
                    defaultValue={editingNote?.title || ''}
                    placeholder="Enter note title"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Content</label>
                  <textarea
                    name="content"
                    defaultValue={editingNote?.content || ''}
                    placeholder="Enter note content"
                    className="w-full p-2 border rounded-md bg-background text-foreground"
                    rows={4}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Tags (comma-separated)</label>
                  <Input
                    name="tags"
                    defaultValue={editingNote?.tags?.join(', ') || ''}
                    placeholder="e.g., meeting, project, ideas"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Project (optional)</label>
                  <Input
                    name="project"
                    defaultValue={editingNote?.project || ''}
                    placeholder="Enter project name"
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-2 mt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowCreateModal(false)
                    setEditingNote(null)
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit">
                  {editingNote ? 'Save Changes' : 'Create Note'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
} 