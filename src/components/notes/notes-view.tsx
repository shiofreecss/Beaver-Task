'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Plus, Search, Tag, MoreVertical, Pencil, Trash2, FolderKanban, Grid3X3, List, Table, FileText, Calendar, Users, Clock } from 'lucide-react'
import { CreateNoteModal } from '@/components/notes/create-note-modal'
import { NotePreviewModal } from '@/components/notes/note-preview-modal'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { toast } from "@/components/ui/use-toast"
import { Badge } from '@/components/ui/badge'
import { useProjectStore } from '@/store/projects'
import { useNoteStore, Note } from '@/store/notes'
import { useTaskStore } from '@/store/tasks'

type ViewMode = 'grid' | 'list' | 'table'

interface NoteFormData {
  title: string
  content: string
  tags: string
  type: 'simple' | 'meeting' | 'document'
  projectId: string
  taskId: string
  // Meeting-specific fields
  meetingDate: string
  meetingCategory: string
  attendees: string[]
  summaryAI: string
  // Document-specific fields
  documentCategory: string
  lastEditedBy: string
  lastEditedTime: string
}

interface NoteWithProject extends Note {
  projectName?: string
  taskName?: string
}

export function NotesView() {
  const [isLoading, setIsLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingNote, setEditingNote] = useState<NoteWithProject | null>(null)
  const [previewNote, setPreviewNote] = useState<NoteWithProject | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const [activeTab, setActiveTab] = useState<'all' | 'simple' | 'meeting' | 'document'>('all')

  // Get notes and projects from stores
  const notes = useNoteStore((state) => state.notes)
  const fetchNotes = useNoteStore((state) => state.fetchNotes)
  const addNote = useNoteStore((state) => state.addNote)
  const updateNote = useNoteStore((state) => state.updateNote)
  const deleteNote = useNoteStore((state) => state.deleteNote)
  const getNotesByType = useNoteStore((state) => state.getNotesByType)
  const projects = useProjectStore((state) => state.projects)
  const tasks = useTaskStore((state) => state.tasks)

  // Transform notes to include project names
  const notesWithProjects: NoteWithProject[] = notes.map(note => ({
    ...note,
    projectName: note.projectId ? projects.find(p => p.id === note.projectId)?.name : undefined,
    taskName: note.taskId ? tasks.find(t => t.id === note.taskId)?.title : undefined
  }))

  // Filter notes by active tab
  const filteredNotesByType = activeTab === 'all' 
    ? notesWithProjects 
    : getNotesByType(activeTab as 'simple' | 'meeting' | 'document')

  // Fetch notes on component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        await fetchNotes()
      } catch (error) {
        console.error('Failed to fetch notes:', error)
        toast({
          title: "Error",
          description: "Failed to load notes. Please try again.",
          variant: "destructive"
        })
      } finally {
        setIsLoading(false)
      }
    }
    loadData()
  }, [fetchNotes])

  const handleCreateNote = async (noteData: NoteFormData) => {
    try {
      await addNote({
        title: noteData.title,
        content: noteData.content,
        tags: noteData.tags.split(',').map(tag => tag.trim()).filter(Boolean),
        type: noteData.type,
        projectId: noteData.projectId === 'none' ? undefined : noteData.projectId,
        taskId: noteData.taskId === 'none' ? undefined : noteData.taskId,
        // Meeting-specific fields
        meetingDate: noteData.meetingDate,
        meetingCategory: noteData.meetingCategory,
        attendees: noteData.attendees,
        summaryAI: noteData.summaryAI,
        // Document-specific fields
        documentCategory: noteData.documentCategory,
        lastEditedBy: noteData.lastEditedBy,
        lastEditedTime: noteData.lastEditedTime
      })
      setShowCreateModal(false)
      toast({
        title: "Note created",
        description: `${noteData.title} has been created successfully.`,
      })
    } catch (error) {
      console.error('Error creating note:', error)
      toast({
        title: "Error",
        description: "Failed to create note. Please try again.",
        variant: "destructive"
      })
    }
  }

  const handleEditNote = async (noteData: NoteFormData) => {
    if (!editingNote) return

    try {
      await updateNote(editingNote.id, {
        title: noteData.title,
        content: noteData.content,
        tags: noteData.tags.split(',').map(tag => tag.trim()).filter(Boolean),
        type: noteData.type,
        projectId: noteData.projectId === 'none' ? undefined : noteData.projectId,
        taskId: noteData.taskId === 'none' ? undefined : noteData.taskId,
        // Meeting-specific fields
        meetingDate: noteData.meetingDate,
        meetingCategory: noteData.meetingCategory,
        attendees: noteData.attendees,
        summaryAI: noteData.summaryAI,
        // Document-specific fields
        documentCategory: noteData.documentCategory,
        lastEditedBy: noteData.lastEditedBy,
        lastEditedTime: noteData.lastEditedTime
      })
      setEditingNote(null)
      toast({
        title: "Note updated",
        description: `${noteData.title} has been updated successfully.`,
      })
    } catch (error) {
      console.error('Error updating note:', error)
      toast({
        title: "Error",
        description: "Failed to update note. Please try again.",
        variant: "destructive"
      })
    }
  }

  const handleDeleteNote = async (noteId: string) => {
    try {
      await deleteNote(noteId)
      toast({
        title: "Note deleted",
        description: "The note has been deleted successfully.",
      })
    } catch (error) {
      console.error('Error deleting note:', error)
      toast({
        title: "Error",
        description: "Failed to delete note. Please try again.",
        variant: "destructive"
      })
    }
  }

  // Filter notes based on search term
  const filteredNotes = filteredNotesByType.filter(note =>
    note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    note.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
    note.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  const viewModeButtons = [
    { mode: 'grid' as ViewMode, icon: Grid3X3, label: 'Grid' },
    { mode: 'list' as ViewMode, icon: List, label: 'List' },
    { mode: 'table' as ViewMode, icon: Table, label: 'Table' }
  ]

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      'Standup': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
      'Retro': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      'Planning': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      'Review': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
      'Presentation': 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
      'Strategy doc': 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200',
      'Proposal': 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200',
      'Customer research': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      'Technical spec': 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
    }
    return colors[category] || 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'meeting':
        return <Calendar className="h-4 w-4 text-blue-500" />
      case 'document':
        return <FileText className="h-4 w-4 text-red-500" />
      case 'simple':
        return <FileText className="h-4 w-4 text-gray-500" />
      default:
        return <FileText className="h-4 w-4 text-gray-500" />
    }
  }

  const renderGridView = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 min-h-[200px]">
      {filteredNotes.map((note) => (
        <Card 
          key={note.id} 
          className="cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => setPreviewNote(note)}
        >
          <CardHeader className="pb-3 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 md:gap-3 min-w-0">
                {getTypeIcon(note.type)}
                <CardTitle className="text-base md:text-lg truncate">{note.title}</CardTitle>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="flex-shrink-0 h-8 w-8 p-0"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={(e) => {
                    e.stopPropagation()
                    setEditingNote(note)
                    setPreviewNote(null)
                  }}>
                    <Pencil className="mr-2 h-4 w-4" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={(e) => {
                      e.stopPropagation()
                      handleDeleteNote(note.id)
                    }}
                    className="text-destructive"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <CardDescription className="mt-2 text-sm line-clamp-2">
              {note.content}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="space-y-3 md:space-y-4">
              {/* Type-specific information */}
              {note.type === 'meeting' && note.meetingCategory && (
                <div className="flex items-center gap-2 text-xs md:text-sm text-muted-foreground">
                <Badge className={getCategoryColor(note.meetingCategory)}>
                  {note.meetingCategory}
                </Badge>
                </div>
              )}
              {note.type === 'document' && note.documentCategory && (
                <div className="flex items-center gap-2 text-xs md:text-sm text-muted-foreground">
                <Badge className={getCategoryColor(note.documentCategory)}>
                  {note.documentCategory}
                </Badge>
                </div>
              )}
              
              {/* Tags */}
              {note.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {note.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      <Tag className="mr-1 h-3 w-3" />
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}
              
              {/* Project and Task info */}
              <div className="space-y-2">
                  {note.projectName && (
                  <div className="flex items-center gap-2 text-xs md:text-sm text-muted-foreground">
                    <FolderKanban className="h-3 w-3 md:h-4 md:w-4 flex-shrink-0" />
                      <span className="truncate">{note.projectName}</span>
                    </div>
                  )}
                  {note.taskName && (
                  <div className="flex items-center gap-2 text-xs md:text-sm text-muted-foreground">
                    <FileText className="h-3 w-3 md:h-4 md:w-4 flex-shrink-0" />
                      <span className="truncate">{note.taskName}</span>
                    </div>
                  )}
              </div>

              {/* Meeting attendees */}
              {note.type === 'meeting' && note.attendees && note.attendees.length > 0 && (
                <div className="flex items-center gap-2 text-xs md:text-sm text-muted-foreground">
                  <Users className="h-3 w-3 md:h-4 md:w-4 flex-shrink-0" />
                  <span>{note.attendees.length} attendee{note.attendees.length === 1 ? '' : 's'}</span>
                </div>
              )}

              {/* Last edited info for documents */}
              {note.type === 'document' && note.lastEditedBy && (
                <div className="flex items-center gap-2 text-xs md:text-sm text-muted-foreground">
                  <Users className="h-3 w-3 md:h-4 md:w-4 flex-shrink-0" />
                  <span className="truncate">Edited by {note.lastEditedBy}</span>
                </div>
              )}

              {/* Updated date */}
              <div className="flex items-center gap-2 text-xs md:text-sm text-muted-foreground">
                <Clock className="h-3 w-3 md:h-4 md:w-4 flex-shrink-0" />
                <span>{new Date(note.updatedAt).toLocaleDateString()}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )

  const renderListView = () => (
    <div className="space-y-2 md:space-y-3">
      {filteredNotes.map((note) => (
        <Card 
          key={note.id} 
          className="cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => setPreviewNote(note)}
        >
          <CardContent className="p-3 md:p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 md:gap-4 flex-1 min-w-0">
                {getTypeIcon(note.type)}
              <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-sm md:text-base truncate">{note.title}</h3>
                  <p className="text-xs md:text-sm text-muted-foreground line-clamp-2">{note.content}</p>
                  </div>
                <div className="hidden sm:flex items-center gap-2 md:gap-3">
                    {/* Type-specific badges */}
                    {note.type === 'meeting' && note.meetingCategory && (
                      <Badge className={getCategoryColor(note.meetingCategory)}>
                        {note.meetingCategory}
                      </Badge>
                    )}
                    {note.type === 'document' && note.documentCategory && (
                      <Badge className={getCategoryColor(note.documentCategory)}>
                        {note.documentCategory}
                      </Badge>
                    )}
                    
                  {/* Tags */}
                    {note.tags.length > 0 && (
                    <div className="flex gap-1.5">
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
                    )}
                  
                  {/* Project and Task */}
                    {note.projectName && (
                      <Badge variant="outline" className="text-xs">
                        <FolderKanban className="mr-1 h-3 w-3" />
                        {note.projectName}
                      </Badge>
                    )}
                    {note.taskName && (
                      <Badge variant="outline" className="text-xs">
                        <FileText className="mr-1 h-3 w-3" />
                        {note.taskName}
                      </Badge>
                    )}
                  
                  <span className="text-sm text-muted-foreground whitespace-nowrap">
                      {new Date(note.updatedAt).toLocaleDateString()}
                    </span>
                </div>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={(e) => {
                    e.stopPropagation()
                    setEditingNote(note)
                    setPreviewNote(null)
                  }}>
                    <Pencil className="mr-2 h-4 w-4" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={(e) => {
                      e.stopPropagation()
                      handleDeleteNote(note.id)
                    }}
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
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b">
            <th className="text-left p-3 font-medium">Title</th>
            <th className="text-left p-3 font-medium">Type</th>
            <th className="text-left p-3 font-medium">Category</th>
            <th className="text-left p-3 font-medium">Tags</th>
            <th className="text-left p-3 font-medium">Project</th>
            <th className="text-left p-3 font-medium">Updated</th>
            <th className="text-left p-3 font-medium">Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredNotes.map((note) => (
            <tr key={note.id} className="border-b hover:bg-muted/50 cursor-pointer" onClick={() => setPreviewNote(note)}>
              <td className="p-3">
                <div className="flex items-center gap-2">
                  {getTypeIcon(note.type)}
                  <span className="font-medium">{note.title}</span>
                </div>
              </td>
              <td className="p-3">
                <Badge variant="outline" className="capitalize">
                  {note.type}
                </Badge>
              </td>
              <td className="p-3">
                {note.type === 'meeting' && note.meetingCategory && (
                  <Badge className={getCategoryColor(note.meetingCategory)}>
                    {note.meetingCategory}
                  </Badge>
                )}
                {note.type === 'document' && note.documentCategory && (
                  <Badge className={getCategoryColor(note.documentCategory)}>
                    {note.documentCategory}
                  </Badge>
                )}
                {note.type === 'simple' && <span className="text-muted-foreground">-</span>}
              </td>
              <td className="p-3">
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
              <td className="p-3">
                {note.projectName ? (
                  <div className="flex items-center gap-1">
                    <FolderKanban className="h-3 w-3" />
                    <span>{note.projectName}</span>
                  </div>
                ) : (
                  <span className="text-muted-foreground">-</span>
                )}
              </td>
              <td className="p-3 text-sm text-muted-foreground">
                {new Date(note.updatedAt).toLocaleDateString()}
              </td>
              <td className="p-3">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={(e) => {
                      e.stopPropagation()
                      setEditingNote(note)
                      setPreviewNote(null)
                    }}>
                      <Pencil className="mr-2 h-4 w-4" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDeleteNote(note.id)
                      }}
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading notes...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 md:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 md:mb-6 gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Notes</h1>
        </div>
        <div className="flex items-center gap-2">
          {/* View Mode Toggle */}
          <div className="flex rounded-lg border p-0.5 md:p-1">
            {viewModeButtons.map(({ mode, icon: Icon, label }) => (
              <Button
                key={mode}
                variant={viewMode === mode ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode(mode)}
                className="h-7 md:h-8 px-2 md:px-3"
              >
                <Icon className="h-3 w-3 md:h-4 md:w-4" />
                <span className="sr-only">{label}</span>
              </Button>
            ))}
          </div>
          <Button onClick={() => setShowCreateModal(true)} className="text-sm md:text-base">
            <Plus className="mr-1 md:mr-2 h-4 w-4" />
            <span className="hidden sm:inline">New Note</span>
            <span className="sm:hidden">New</span>
          </Button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-4 mb-4 md:mb-6">
        <div className="flex items-center gap-2">
          <Button
            variant={activeTab === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveTab('all')}
            className="flex items-center gap-2"
          >
            <FileText className="h-4 w-4" />
            All Notes
          </Button>
          <Button
            variant={activeTab === 'simple' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveTab('simple')}
            className="flex items-center gap-2"
          >
            <FileText className="h-4 w-4" />
            Simple Notes
          </Button>
          <Button
            variant={activeTab === 'meeting' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveTab('meeting')}
            className="flex items-center gap-2"
          >
            <Calendar className="h-4 w-4" />
            Meeting Minutes
          </Button>
          <Button
            variant={activeTab === 'document' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveTab('document')}
            className="flex items-center gap-2"
          >
            <FileText className="h-4 w-4" />
            Documents
          </Button>
        </div>
      </div>

      {/* Search and View Controls */}
      <div className="flex items-center justify-between mb-4 md:mb-6">
        <div className="relative w-96">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search notes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Notes Display */}
      {filteredNotes.length === 0 ? (
        <Card className="text-center py-8 md:py-12">
          <CardContent>
            <FileText className="h-8 w-8 md:h-12 md:w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-base md:text-lg font-semibold mb-2">No notes found</h3>
            <p className="text-muted-foreground mb-4 text-sm md:text-base">
              {searchTerm ? 'Try adjusting your search terms.' : 'Get started by creating your first note.'}
            </p>
            {!searchTerm && (
              <Button onClick={() => setShowCreateModal(true)} className="text-sm md:text-base">
                <Plus className="mr-2 h-4 w-4" />
                Create Note
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        renderCurrentView()
      )}

      {/* Modals */}
      <CreateNoteModal
        open={showCreateModal}
        onOpenChange={setShowCreateModal}
        onSubmit={handleCreateNote}
        projects={projects}
        tasks={tasks}
      />

      {editingNote && (
        <CreateNoteModal
          open={!!editingNote}
          onOpenChange={() => setEditingNote(null)}
          onSubmit={handleEditNote}
          projects={projects}
          tasks={tasks}
          initialData={{
            title: editingNote.title,
            content: editingNote.content,
            tags: editingNote.tags.join(', '),
            type: editingNote.type,
            projectId: editingNote.projectId,
            taskId: editingNote.taskId,
            meetingDate: editingNote.meetingDate,
            meetingCategory: editingNote.meetingCategory,
            attendees: editingNote.attendees,
            summaryAI: editingNote.summaryAI,
            documentCategory: editingNote.documentCategory,
            lastEditedBy: editingNote.lastEditedBy,
            lastEditedTime: editingNote.lastEditedTime
          }}
        />
      )}

      {previewNote && (
        <NotePreviewModal
          note={previewNote}
          onClose={() => setPreviewNote(null)}
          onEdit={() => {
            setEditingNote(previewNote)
            setPreviewNote(null)
          }}
          onDelete={() => {
            handleDeleteNote(previewNote.id)
            setPreviewNote(null)
          }}
        />
      )}
    </div>
  )
} 