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
  projectId: string
  taskId: string
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
    projectId?: string
    taskId?: string
  }
}

export function CreateNoteModal({ open, onOpenChange, onSubmit, projects = [], tasks = [], initialData }: CreateNoteModalProps) {
  const [formData, setFormData] = useState<NoteFormData>({
    title: '',
    content: '',
    tags: '',
    projectId: 'none',
    taskId: 'none'
  })

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
        projectId: initialData.projectId || 'none',
        taskId: initialData.taskId || 'none'
      })
    } else {
      setFormData({
        title: '',
        content: '',
        tags: '',
        projectId: 'none',
        taskId: 'none'
      })
    }
  }, [initialData])

  // Reset task selection when project changes
  useEffect(() => {
    if (formData.projectId === 'none') {
      setFormData(prev => ({ ...prev, taskId: 'none' }))
    }
  }, [formData.projectId])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (formData.title.trim()) {
      onSubmit(formData)
      if (!initialData) {
        setFormData({
          title: '',
          content: '',
          tags: '',
          projectId: 'none',
          taskId: 'none'
        })
      }
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[725px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{initialData ? 'Edit Note' : 'Create New Note'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
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
              rows={8}
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
      </DialogContent>
    </Dialog>
  )
} 