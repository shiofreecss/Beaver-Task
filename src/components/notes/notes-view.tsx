'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Plus, Search, Tag, MoreVertical, Pencil, Trash2, FolderKanban, Grid3X3, List, Table, FileText } from 'lucide-react'
import { CreateNoteModal } from '@/components/notes/create-note-modal'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { toast } from "@/components/ui/use-toast"
import { Badge } from '@/components/ui/badge'

type ViewMode = 'grid' | 'list' | 'table'

export function NotesView() {
  const [notes, setNotes] = useState([
    {
      id: '1',
      title: 'Project Planning Meeting Notes',
      content: 'Discussed Q4 roadmap, key deliverables, and team assignments. Need to follow up on resource allocation and timeline adjustments.',
      tags: ['meeting', 'planning', 'q4'],
      projectId: 'proj-1',
      projectName: 'Website Redesign',
      createdAt: '2024-01-15T10:30:00Z',
      updatedAt: '2024-01-15T10:30:00Z'
    },
    {
      id: '2',
      title: 'Research Findings',
      content: 'User research indicates need for better navigation and improved mobile experience. Key insights from 15 user interviews.',
      tags: ['research', 'ux', 'mobile'],
      projectId: 'proj-1',
      projectName: 'Website Redesign',
      createdAt: '2024-01-14T14:20:00Z',
      updatedAt: '2024-01-14T14:20:00Z'
    },
    {
      id: '3',
      title: 'Technical Architecture',
      content: 'Outlined system architecture for new features. Considering microservices approach for better scalability.',
      tags: ['technical', 'architecture', 'microservices'],
      projectId: 'proj-2',
      projectName: 'API Development',
      createdAt: '2024-01-13T09:15:00Z',
      updatedAt: '2024-01-13T09:15:00Z'
    },
    {
      id: '4',
      title: 'Marketing Strategy Ideas',
      content: 'Brainstormed ideas for Q1 marketing campaign. Focus on social media engagement and content marketing.',
      tags: ['marketing', 'strategy', 'social-media'],
      projectId: null,
      projectName: null,
      createdAt: '2024-01-12T16:45:00Z',
      updatedAt: '2024-01-12T16:45:00Z'
    }
  ])

  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingNote, setEditingNote] = useState<any>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [viewMode, setViewMode] = useState<ViewMode>('grid')

  const handleCreateNote = (noteData: any) => {
    const newNote = {
      id: Date.now().toString(),
      title: noteData.title,
      content: noteData.content,
      tags: noteData.tags || [],
      projectId: noteData.projectId || null,
      projectName: noteData.projectName || null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    setNotes([newNote, ...notes])
    setShowCreateModal(false)
    toast({
      title: "Note created",
      description: `${noteData.title} has been created successfully.`,
    })
  }

  const handleEditNote = (noteData: any) => {
    if (!editingNote) return
    
    setNotes(notes.map(note => 
      note.id === editingNote.id 
        ? {
            ...note,
            title: noteData.title,
            content: noteData.content,
            tags: noteData.tags || [],
            projectId: noteData.projectId || null,
            projectName: noteData.projectName || null,
            updatedAt: new Date().toISOString()
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
    setNotes(notes.filter(note => note.id !== noteId))
    toast({
      title: "Note deleted",
      description: "The note has been deleted successfully.",
    })
  }

  // Filter notes based on search term
  const filteredNotes = notes.filter(note =>
    note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    note.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
    note.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  const viewModeButtons = [
    { mode: 'grid' as ViewMode, icon: Grid3X3, label: 'Grid' },
    { mode: 'list' as ViewMode, icon: List, label: 'List' },
    { mode: 'table' as ViewMode, icon: Table, label: 'Table' }
  ]

  const renderGridView = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {filteredNotes.map((note) => (
        <Card key={note.id} className="cursor-pointer hover:shadow-lg transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg truncate">{note.title}</CardTitle>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => setEditingNote(note)}>
                    <Pencil className="mr-2 h-4 w-4" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => handleDeleteNote(note.id)}
                    className="text-destructive"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <CardDescription className="line-clamp-3">
              {note.content}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {note.tags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {note.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      <Tag className="mr-1 h-3 w-3" />
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                {note.projectName && (
                  <div className="flex items-center gap-1">
                    <FolderKanban className="h-3 w-3" />
                    <span className="truncate">{note.projectName}</span>
                  </div>
                )}
                <span>{new Date(note.updatedAt).toLocaleDateString()}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )

  const renderListView = () => (
    <div className="space-y-3">
      {filteredNotes.map((note) => (
        <Card key={note.id} className="cursor-pointer hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-4 mb-2">
                  <h3 className="font-semibold text-lg truncate">{note.title}</h3>
                  <div className="flex items-center gap-2">
                    {note.tags.length > 0 && (
                      <div className="flex gap-1">
                        {note.tags.slice(0, 3).map((tag) => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                        {note.tags.length > 3 && (
                          <Badge variant="secondary" className="text-xs">
                            +{note.tags.length - 3}
                          </Badge>
                        )}
                      </div>
                    )}
                    {note.projectName && (
                      <Badge variant="outline" className="text-xs">
                        <FolderKanban className="mr-1 h-3 w-3" />
                        {note.projectName}
                      </Badge>
                    )}
                    <span className="text-sm text-muted-foreground">
                      {new Date(note.updatedAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {note.content}
                </p>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => setEditingNote(note)}>
                    <Pencil className="mr-2 h-4 w-4" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => handleDeleteNote(note.id)}
                    className="text-destructive"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )

  const renderTableView = () => (
    <Card>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b">
              <tr>
                <th className="text-left p-4 font-semibold">Title</th>
                <th className="text-left p-4 font-semibold">Content</th>
                <th className="text-left p-4 font-semibold">Tags</th>
                <th className="text-left p-4 font-semibold">Project</th>
                <th className="text-left p-4 font-semibold">Updated</th>
                <th className="text-left p-4 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredNotes.map((note) => (
                <tr key={note.id} className="border-b hover:bg-muted/50">
                  <td className="p-4">
                    <span className="font-medium">{note.title}</span>
                  </td>
                  <td className="p-4 max-w-xs">
                    <span className="text-sm text-muted-foreground truncate block">
                      {note.content}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex flex-wrap gap-1">
                      {note.tags.slice(0, 2).map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                      {note.tags.length > 2 && (
                        <Badge variant="secondary" className="text-xs">
                          +{note.tags.length - 2}
                        </Badge>
                      )}
                    </div>
                  </td>
                  <td className="p-4">
                    {note.projectName ? (
                      <Badge variant="outline" className="text-xs">
                        <FolderKanban className="mr-1 h-3 w-3" />
                        {note.projectName}
                      </Badge>
                    ) : (
                      <span className="text-sm text-muted-foreground">No project</span>
                    )}
                  </td>
                  <td className="p-4">
                    <span className="text-sm">
                      {new Date(note.updatedAt).toLocaleDateString()}
                    </span>
                  </td>
                  <td className="p-4">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem onClick={() => setEditingNote(note)}>
                          <Pencil className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => handleDeleteNote(note.id)}
                          className="text-destructive"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )

  const renderCurrentView = () => {
    switch (viewMode) {
      case 'grid':
        return renderGridView()
      case 'list':
        return renderListView()
      case 'table':
        return renderTableView()
      default:
        return renderGridView()
    }
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Notes</h1>
          <p className="text-muted-foreground">
            Capture and organize your thoughts and ideas
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* View Mode Toggle */}
          <div className="flex rounded-lg border p-1">
            {viewModeButtons.map(({ mode, icon: Icon, label }) => (
              <Button
                key={mode}
                variant={viewMode === mode ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode(mode)}
                className="h-8 px-3"
              >
                <Icon className="h-4 w-4" />
                <span className="sr-only">{label}</span>
              </Button>
            ))}
          </div>
          <Button onClick={() => setShowCreateModal(true)}>
            <Plus className="mr-2 h-4 w-4" />
            New Note
          </Button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          placeholder="Search notes by title, content, or tags..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {filteredNotes.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              {searchTerm ? 'No notes found' : 'No notes yet'}
            </h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm 
                ? 'Try adjusting your search terms' 
                : 'Create your first note to get started'
              }
            </p>
            {!searchTerm && (
              <Button onClick={() => setShowCreateModal(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Create Note
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        renderCurrentView()
      )}

      <CreateNoteModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreateNote}
      />

      {editingNote && (
        <CreateNoteModal
          isOpen={true}
          onClose={() => setEditingNote(null)}
          onSubmit={handleEditNote}
          initialData={editingNote}
        />
      )}
    </div>
  )
} 