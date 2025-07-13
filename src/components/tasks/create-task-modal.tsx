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
import { PRIORITY_LABELS, SEVERITY_LABELS, type PriorityLevel, type SeverityLevel } from '@/store/tasks'

interface Project {
  id: string
  name: string
}

interface FormData {
  title: string
  description: string
  priority: PriorityLevel
  severity: SeverityLevel
  status: string
  dueDate: string
  projectId: string
}

interface CreateTaskModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: FormData) => void
  projects: Project[]
  projectId?: string
  initialData?: FormData
}

export function CreateTaskModal({ open, onOpenChange, onSubmit, projects = [], projectId, initialData }: CreateTaskModalProps) {
  const [formData, setFormData] = useState<FormData>({
    title: '',
    description: '',
    priority: 'P1',
    severity: 'S1',
    status: 'TODO',
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
        priority: 'P1',
        severity: 'S1',
        status: 'TODO',
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

  const severityOptions = Object.entries(SEVERITY_LABELS).map(([value, label]) => ({
    value,
    label: `${value} - ${label}`
  }))

  const statusOptions = [
    { value: 'TODO', label: 'To Do' },
    { value: 'IN_PROGRESS', label: 'In Progress' },
    { value: 'COMPLETED', label: 'Completed' }
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    
    if (formData.title.trim()) {
      try {
        // Construct submitData with correct types
        const submitData = {
          title: formData.title,
          description: formData.description,
          priority: formData.priority,
          severity: formData.severity,
          status: formData.status,
          dueDate: formData.dueDate,
          projectId: formData.projectId === 'none' ? undefined : formData.projectId
        }
        await onSubmit(submitData as any)
        if (!initialData) {
          setFormData({
            title: '',
            description: '',
            priority: 'P1',
            severity: 'S1',
            status: 'TODO',
            dueDate: '',
            projectId: 'none',
          })
        }
        onOpenChange(false)
      } catch (error) {
        setError(error instanceof Error ? error.message : 'Failed to create task')
      }
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>{initialData ? 'Edit Task' : 'Create New Task'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="text-red-500 text-sm">{error}</div>
          )}
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Enter task title"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Enter task description"
              rows={4}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <Select value={formData.priority} onValueChange={(value: PriorityLevel) => setFormData(prev => ({ ...prev, priority: value }))}>
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
              <Label htmlFor="severity">Severity</Label>
              <Select value={formData.severity} onValueChange={(value: SeverityLevel) => setFormData(prev => ({ ...prev, severity: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select severity" />
                </SelectTrigger>
                <SelectContent>
                  {severityOptions.map((severity) => (
                    <SelectItem key={severity.value} value={severity.value}>
                      {severity.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={formData.status} onValueChange={(value) => setFormData(prev => ({ ...prev, status: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map((status) => (
                    <SelectItem key={status.value} value={status.value}>
                      {status.label}
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

          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit">
              {initialData ? 'Save Changes' : 'Create Task'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
} 