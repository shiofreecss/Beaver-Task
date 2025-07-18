'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { X, Plus, Calendar, Users, FileText, Tag } from 'lucide-react'

interface Project {
  id: string
  name: string
}

interface Task {
  id: string
  title: string
  projectId?: string
}

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

interface CreateNoteModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: NoteFormData) => void
  projects: Project[]
  tasks: Task[]
  initialData?: {
    title: string
    content: string
    tags: string
    type?: 'simple' | 'meeting' | 'document'
    projectId?: string
    taskId?: string
    meetingDate?: string
    meetingCategory?: string
    attendees?: string[]
    summaryAI?: string
    documentCategory?: string
    lastEditedBy?: string
    lastEditedTime?: string
  }
}

const MEETING_CATEGORIES = [
  'Standup', 'Retro', 'Planning', 'Review', 'Presentation', 
  'Brainstorming', 'Client Meeting', 'Team Sync', 'One-on-One'
]

const DOCUMENT_CATEGORIES = [
  'Strategy doc', 'Proposal', 'Customer research', 'Technical spec',
  'User guide', 'API docs', 'Meeting notes', 'Project plan'
]

export function CreateNoteModal({ open, onOpenChange, onSubmit, projects = [], tasks = [], initialData }: CreateNoteModalProps) {
  const [formData, setFormData] = useState<NoteFormData>({
    title: '',
    content: '',
    tags: '',
    type: 'simple',
    projectId: 'none',
    taskId: 'none',
    // Meeting-specific fields
    meetingDate: new Date().toISOString().split('T')[0],
    meetingCategory: '',
    attendees: [],
    summaryAI: '',
    // Document-specific fields
    documentCategory: '',
    lastEditedBy: '',
    lastEditedTime: new Date().toISOString()
  })

  const [newAttendee, setNewAttendee] = useState('')
  const [activeTab, setActiveTab] = useState<'simple' | 'meeting' | 'document'>('simple')

  // Filter tasks by selected project
  const filteredTasks = formData.projectId !== 'none' 
    ? tasks.filter(task => task.projectId === formData.projectId)
    : tasks

  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title,
        content: initialData.content,
        tags: initialData.tags,
        type: initialData.type || 'simple',
        projectId: initialData.projectId || 'none',
        taskId: initialData.taskId || 'none',
        meetingDate: initialData.meetingDate || new Date().toISOString().split('T')[0],
        meetingCategory: initialData.meetingCategory || '',
        attendees: initialData.attendees || [],
        summaryAI: initialData.summaryAI || '',
        documentCategory: initialData.documentCategory || '',
        lastEditedBy: initialData.lastEditedBy || '',
        lastEditedTime: initialData.lastEditedTime || new Date().toISOString()
      })
      setActiveTab(initialData.type || 'simple')
    } else {
      setFormData({
        title: '',
        content: '',
        tags: '',
        type: 'simple',
        projectId: 'none',
        taskId: 'none',
        meetingDate: new Date().toISOString().split('T')[0],
        meetingCategory: '',
        attendees: [],
        summaryAI: '',
        documentCategory: '',
        lastEditedBy: '',
        lastEditedTime: new Date().toISOString()
      })
      setActiveTab('simple')
    }
  }, [initialData])

  // Reset task selection when project changes
  useEffect(() => {
    if (formData.projectId === 'none') {
      setFormData(prev => ({ ...prev, taskId: 'none' }))
    }
  }, [formData.projectId])

  // Update type when tab changes
  useEffect(() => {
    setFormData(prev => ({ ...prev, type: activeTab }))
  }, [activeTab])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (formData.title.trim()) {
      onSubmit(formData)
      if (!initialData) {
        setFormData({
          title: '',
          content: '',
          tags: '',
          type: 'simple',
          projectId: 'none',
          taskId: 'none',
          meetingDate: new Date().toISOString().split('T')[0],
          meetingCategory: '',
          attendees: [],
          summaryAI: '',
          documentCategory: '',
          lastEditedBy: '',
          lastEditedTime: new Date().toISOString()
        })
        setActiveTab('simple')
      }
    }
  }

  const addAttendee = () => {
    if (newAttendee.trim() && !formData.attendees.includes(newAttendee.trim())) {
      setFormData(prev => ({
        ...prev,
        attendees: [...prev.attendees, newAttendee.trim()]
      }))
      setNewAttendee('')
    }
  }

  const removeAttendee = (attendee: string) => {
    setFormData(prev => ({
      ...prev,
      attendees: prev.attendees.filter(a => a !== attendee)
    }))
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      addAttendee()
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{initialData ? 'Edit Note' : 'Create New Note'}</DialogTitle>
        </DialogHeader>
        
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="simple" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Simple Note
            </TabsTrigger>
            <TabsTrigger value="meeting" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Meeting Minutes
            </TabsTrigger>
            <TabsTrigger value="document" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Document
            </TabsTrigger>
          </TabsList>

          <form onSubmit={handleSubmit} className="space-y-4 mt-4">
            {/* Common Fields */}
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Enter note title"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="content">Content</Label>
              <Textarea
                id="content"
                value={formData.content}
                onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                placeholder="Enter note content"
                rows={6}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tags">Tags (comma-separated)</Label>
              <Input
                id="tags"
                value={formData.tags}
                onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
                placeholder="e.g., meeting, project, ideas"
              />
            </div>

            {/* Project and Task Selection */}
            {projects.length > 0 && (
              <div className="space-y-2">
                <Label htmlFor="project">Project</Label>
                <Select value={formData.projectId} onValueChange={(value) => setFormData(prev => ({ ...prev, projectId: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select project" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No Project</SelectItem>
                    {projects.map((project) => (
                      <SelectItem key={project.id} value={project.id}>
                        {project.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {tasks.length > 0 && (
              <div className="space-y-2">
                <Label htmlFor="task">Task</Label>
                <Select value={formData.taskId} onValueChange={(value) => setFormData(prev => ({ ...prev, taskId: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select task" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No Task</SelectItem>
                    {filteredTasks.map((task) => (
                      <SelectItem key={task.id} value={task.id}>
                        {task.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Meeting-specific fields */}
            {activeTab === 'meeting' && (
              <div className="space-y-4 border-t pt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="meetingDate">Meeting Date</Label>
                    <Input
                      id="meetingDate"
                      type="date"
                      value={formData.meetingDate}
                      onChange={(e) => setFormData(prev => ({ ...prev, meetingDate: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="meetingCategory">Category</Label>
                    <Select value={formData.meetingCategory} onValueChange={(value) => setFormData(prev => ({ ...prev, meetingCategory: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {MEETING_CATEGORIES.map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="attendees">Attendees</Label>
                  <div className="flex gap-2">
                    <Input
                      id="attendees"
                      value={newAttendee}
                      onChange={(e) => setNewAttendee(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Add attendee name"
                    />
                    <Button type="button" onClick={addAttendee} size="sm">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  {formData.attendees.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {formData.attendees.map((attendee) => (
                        <Badge key={attendee} variant="secondary" className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {attendee}
                          <button
                            type="button"
                            onClick={() => removeAttendee(attendee)}
                            className="ml-1 hover:text-destructive"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="summaryAI">AI Summary</Label>
                  <Textarea
                    id="summaryAI"
                    value={formData.summaryAI}
                    onChange={(e) => setFormData(prev => ({ ...prev, summaryAI: e.target.value }))}
                    placeholder="AI-generated summary of the meeting"
                    rows={3}
                  />
                </div>
              </div>
            )}

            {/* Document-specific fields */}
            {activeTab === 'document' && (
              <div className="space-y-4 border-t pt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="documentCategory">Category</Label>
                    <Select value={formData.documentCategory} onValueChange={(value) => setFormData(prev => ({ ...prev, documentCategory: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {DOCUMENT_CATEGORIES.map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastEditedBy">Last Edited By</Label>
                    <Input
                      id="lastEditedBy"
                      value={formData.lastEditedBy}
                      onChange={(e) => setFormData(prev => ({ ...prev, lastEditedBy: e.target.value }))}
                      placeholder="Enter editor name"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="lastEditedTime">Last Edited Time</Label>
                  <Input
                    id="lastEditedTime"
                    type="datetime-local"
                    value={formData.lastEditedTime.slice(0, 16)}
                    onChange={(e) => setFormData(prev => ({ ...prev, lastEditedTime: new Date(e.target.value).toISOString() }))}
                  />
                </div>
              </div>
            )}

            <div className="flex justify-end space-x-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit">
                {initialData ? 'Save Changes' : 'Create Note'}
              </Button>
            </div>
          </form>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
} 