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
import { Switch } from '@/components/ui/switch'
import { PRIORITY_LABELS, type PriorityLevel } from '@/store/tasks'

interface Project {
  id: string
  name: string
}

interface SubtaskFormData {
  title: string
  description: string
  priority: PriorityLevel
  status: 'COMPLETED' | 'ACTIVE'
  dueDate: string
  projectId: string
}

interface CreateSubtaskModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: SubtaskFormData) => void
  projects: Project[]
  projectId?: string
  parentId?: string
  initialData?: SubtaskFormData
}

export function CreateSubtaskModal({ 
  open, 
  onOpenChange, 
  onSubmit, 
  projects = [], 
  projectId, 
  parentId, 
  initialData 
}: CreateSubtaskModalProps) {
  const [formData, setFormData] = useState<SubtaskFormData>({
    title: '',
    description: '',
    priority: 'P3',
    status: 'ACTIVE',
    dueDate: '',
    projectId: projectId || 'none',
  })
  const [error, setError] = useState<string>('')

  useEffect(() => {
    if (initialData) {
      setFormData({ ...initialData, projectId: initialData.projectId || 'none' })
    } else {
      setFormData({
        title: '',
        description: '',
        priority: 'P3',
        status: 'ACTIVE',
        dueDate: '',
        projectId: projectId || 'none',
      })
    }
    setError('')
  }, [initialData, projectId, open])

  const priorityOptions = Object.entries(PRIORITY_LABELS).map(([value, label]) => ({
    value,
    label: `${value} - ${label}`
  }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    
    if (!formData.title.trim()) {
      setError('Subtask title is required')
      return
    }

    try {
      const submitData = {
        ...formData,
        projectId: formData.projectId === 'none' ? undefined : formData.projectId,
      }
      await onSubmit(submitData as any)
      
      if (!initialData) {
        setFormData({
          title: '',
          description: '',
          priority: 'P3',
          status: 'ACTIVE',
          dueDate: '',
          projectId: projectId || 'none',
        })
      }
      onOpenChange(false)
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to save subtask')
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>
            {initialData ? 'Edit Subtask' : 'Create New Subtask'}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Enter subtask title"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Enter subtask description (optional)"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <Select 
                value={formData.priority} 
                onValueChange={(value: PriorityLevel) => setFormData(prev => ({ ...prev, priority: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  {priorityOptions.map((priority) => (
                    <SelectItem key={priority.value} value={priority.value}>
                      {priority.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="dueDate">Due Date</Label>
              <Input
                id="dueDate"
                type="date"
                value={formData.dueDate}
                onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
              />
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="completed"
              checked={formData.status === 'COMPLETED'}
              onCheckedChange={(checked) => 
                setFormData(prev => ({ ...prev, status: checked ? 'COMPLETED' : 'ACTIVE' }))
              }
            />
            <Label htmlFor="completed">Mark as completed</Label>
          </div>

          {projects.length > 0 && (
            <div className="space-y-2">
              <Label htmlFor="project">Project</Label>
              <Select 
                value={formData.projectId} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, projectId: value }))}
              >
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

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">
              {initialData ? 'Save Changes' : 'Create Subtask'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
} 