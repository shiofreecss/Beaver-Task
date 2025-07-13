import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Pencil } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Note } from '@/store/notes'

interface NotePreviewModalProps {
  note: Note | null
  isOpen: boolean
  onClose: () => void
  onEdit: (note: { title: string; content: string; tags: string }) => void
}

export function NotePreviewModal({ note, isOpen, onClose, onEdit }: NotePreviewModalProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editedTitle, setEditedTitle] = useState(note?.title || '')
  const [editedContent, setEditedContent] = useState(note?.content || '')
  const [editedTags, setEditedTags] = useState(note?.tags?.join(', ') || '')

  // Reset form when note changes
  if (note?.id !== undefined && (editedTitle !== note.title || editedContent !== note.content || editedTags !== note.tags.join(', '))) {
    setEditedTitle(note.title)
    setEditedContent(note.content)
    setEditedTags(note.tags.join(', '))
  }

  const handleSave = () => {
    onEdit({
      title: editedTitle,
      content: editedContent,
      tags: editedTags
    })
    setIsEditing(false)
  }

  return (
    <Dialog open={isOpen} onOpenChange={() => {
      setIsEditing(false)
      onClose()
    }}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <div className="flex items-center justify-between">
            {isEditing ? (
              <Input
                value={editedTitle}
                onChange={(e) => setEditedTitle(e.target.value)}
                className="text-xl font-semibold"
                placeholder="Note title"
              />
            ) : (
              <DialogTitle className="text-xl">{note?.title}</DialogTitle>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => isEditing ? handleSave() : setIsEditing(true)}
            >
              <Pencil className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          {isEditing ? (
            <>
              <Textarea
                value={editedContent}
                onChange={(e) => setEditedContent(e.target.value)}
                className="min-h-[200px]"
                placeholder="Note content"
              />
              <Input
                value={editedTags}
                onChange={(e) => setEditedTags(e.target.value)}
                placeholder="Tags (comma separated)"
              />
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsEditing(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSave}>
                  Save Changes
                </Button>
              </div>
            </>
          ) : (
            <>
              <div className="whitespace-pre-wrap">{note?.content}</div>
              {note?.tags && note.tags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {note.tags.map((tag) => (
                    <Badge key={tag} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
} 