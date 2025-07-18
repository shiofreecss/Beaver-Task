import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Pencil, Trash2, Calendar, Users, FileText, Tag, FolderKanban, User, Clock } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Note } from '@/store/notes'

interface NotePreviewModalProps {
  note: Note
  onClose: () => void
  onEdit: () => void
  onDelete: () => void
}

export function NotePreviewModal({ note, onClose, onEdit, onDelete }: NotePreviewModalProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editedTitle, setEditedTitle] = useState('')
  const [editedContent, setEditedContent] = useState('')
  const [editedTags, setEditedTags] = useState('')

  // Reset form when note changes using useEffect
  useEffect(() => {
    if (note && !isEditing) {
      setEditedTitle(note.title)
      setEditedContent(note.content)
      setEditedTags(note.tags.join(', '))
    }
  }, [note?.id, isEditing])

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      'Standup': 'bg-red-100 text-red-800',
      'Retro': 'bg-green-100 text-green-800',
      'Planning': 'bg-blue-100 text-blue-800',
      'Review': 'bg-purple-100 text-purple-800',
      'Presentation': 'bg-orange-100 text-orange-800',
      'Strategy doc': 'bg-amber-100 text-amber-800',
      'Proposal': 'bg-amber-100 text-amber-800',
      'Customer research': 'bg-blue-100 text-blue-800',
      'Technical spec': 'bg-gray-100 text-gray-800',
    }
    return colors[category] || 'bg-gray-100 text-gray-800'
  }

  const getTypeIcon = () => {
    switch (note.type) {
      case 'meeting':
        return <Calendar className="h-5 w-5 text-blue-500" />
      case 'document':
        return <FileText className="h-5 w-5 text-red-500" />
      default:
        return <FileText className="h-5 w-5 text-gray-500" />
    }
  }

  const getTypeLabel = () => {
    switch (note.type) {
      case 'meeting':
        return 'Meeting Minutes'
      case 'document':
        return 'Document'
      default:
        return 'Simple Note'
    }
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {getTypeIcon()}
              <div>
                <DialogTitle className="text-xl">{note.title}</DialogTitle>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="outline" className="capitalize">
                    {getTypeLabel()}
                  </Badge>
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
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={onEdit}
              >
                <Pencil className="h-4 w-4 mr-2" />
                Edit
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={onDelete}
                className="text-destructive hover:text-destructive"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Type-specific information */}
          {note.type === 'meeting' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
              {note.meetingDate && (
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Meeting Date:</span>
                  <span className="text-sm">{new Date(note.meetingDate).toLocaleDateString()}</span>
                </div>
              )}
              {note.attendees && note.attendees.length > 0 && (
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Attendees:</span>
                  <div className="flex flex-wrap gap-1">
                    {note.attendees.map((attendee) => (
                      <Badge key={attendee} variant="secondary" className="text-xs">
                        {attendee}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              {note.summaryAI && (
                <div className="md:col-span-2">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm font-medium">AI Summary:</span>
                  </div>
                  <p className="text-sm text-muted-foreground bg-background p-3 rounded border">
                    {note.summaryAI}
                  </p>
                </div>
              )}
            </div>
          )}

          {note.type === 'document' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
                             {note.lastEditedBy && (
                 <div className="flex items-center gap-2">
                   <User className="h-4 w-4 text-muted-foreground" />
                   <span className="text-sm font-medium">Last Edited By:</span>
                   <span className="text-sm">{note.lastEditedBy}</span>
                 </div>
               )}
              {note.lastEditedTime && (
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Last Edited:</span>
                  <span className="text-sm">{new Date(note.lastEditedTime).toLocaleString()}</span>
                </div>
              )}
            </div>
          )}

          {/* Common information */}
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            {note.projectName && (
              <div className="flex items-center gap-1">
                <FolderKanban className="h-4 w-4" />
                <span>Project: {note.projectName}</span>
              </div>
            )}
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>Updated: {new Date(note.updatedAt).toLocaleString()}</span>
            </div>
          </div>

          {/* Content */}
          <div className="space-y-4">
            <div className="prose prose-sm max-w-none">
              <div className="whitespace-pre-wrap bg-background p-4 rounded border">
                {note.content}
              </div>
            </div>

            {/* Tags */}
            {note.tags && note.tags.length > 0 && (
              <div className="flex items-center gap-2">
                <Tag className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Tags:</span>
                <div className="flex flex-wrap gap-1">
                  {note.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
} 