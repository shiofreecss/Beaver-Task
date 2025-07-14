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
import { Trash2 } from 'lucide-react'

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
  parentId?: string
}

interface TaskItem extends FormData {
  id: string
}

interface CreateTaskModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: FormData | FormData[]) => void
  projects: Project[]
  projectId?: string
  parentId?: string
  initialData?: FormData
}

export function CreateTaskModal({ open, onOpenChange, onSubmit, projects = [], projectId, parentId, initialData }: CreateTaskModalProps) {
  const [taskItems, setTaskItems] = useState<TaskItem[]>([])
  const [currentTask, setCurrentTask] = useState<FormData>({
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
      setCurrentTask({ ...initialData, projectId: initialData.projectId || 'none' })
      setTaskItems([])
    } else {
      setCurrentTask({
        title: '',
        description: '',
        priority: 'P1',
        severity: 'S1',
        status: 'TODO',
        dueDate: '',
        projectId: projectId || 'none',
      })
      setTaskItems([])
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

  const addTaskToList = () => {
    if (!currentTask.title.trim()) {
      setError('Task title is required')
      return
    }

    setTaskItems(prev => [...prev, { ...currentTask, id: Math.random().toString() }])
    setCurrentTask(prev => ({
      ...prev,
      title: '',
      description: ''
    }))
    setError('')
  }

  const removeTaskFromList = (id: string) => {
    setTaskItems(prev => prev.filter(task => task.id !== id))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    
    if (initialData) {
      // For editing, just submit the current task
      if (currentTask.title.trim()) {
        try {
          const submitData = {
            title: currentTask.title,
            description: currentTask.description,
            priority: currentTask.priority,
            severity: currentTask.severity,
            status: currentTask.status,
            dueDate: currentTask.dueDate,
            projectId: currentTask.projectId === 'none' ? undefined : currentTask.projectId,
            parentId: parentId || currentTask.parentId
          }
          await onSubmit(submitData as any)
          onOpenChange(false)
        } catch (error) {
          setError(error instanceof Error ? error.message : 'Failed to update task')
        }
      }
    } else {
      // For creating new tasks
      if (!currentTask.title.trim() && taskItems.length === 0) {
        setError('Task title is required')
        return
      }

      try {
        const tasksToSubmit = currentTask.title.trim() 
          ? [...taskItems, { ...currentTask, id: Math.random().toString() }]
          : taskItems

        const submitData = tasksToSubmit.map(task => ({
          title: task.title,
          description: task.description,
          priority: task.priority,
          severity: task.severity,
          status: task.status,
          dueDate: task.dueDate,
          projectId: task.projectId === 'none' ? undefined : task.projectId,
          parentId: parentId || task.parentId
        }))

        // If only one task, submit as single task
        if (submitData.length === 1) {
          await onSubmit(submitData[0] as any)
        } else {
          await onSubmit(submitData as any)
        }

        setCurrentTask({
          title: '',
          description: '',
          priority: 'P1',
          severity: 'S1',
          status: 'TODO',
          dueDate: '',
          projectId: projectId || 'none',
        })
        setTaskItems([])
        onOpenChange(false)
      } catch (error) {
        setError(error instanceof Error ? error.message : 'Failed to create tasks')
      }
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>
            {initialData 
              ? 'Edit Task' 
              : parentId 
                ? 'Create New Sub-task' 
                : 'Create New Task'
            }
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="text-red-500 text-sm">{error}</div>
          )}
          
          {!initialData && !parentId && taskItems.length > 0 && (
            <div className="space-y-2">
              <Label>Tasks to Create</Label>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {taskItems.map((task) => (
                  <div key={task.id} className="flex items-center justify-between p-2 border rounded-lg">
                    <div>
                      <p className="font-medium">{task.title}</p>
                      {task.description && (
                        <p className="text-sm text-muted-foreground">{task.description}</p>
                      )}
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeTaskFromList(task.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={currentTask.title}
              onChange={(e) => setCurrentTask(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Enter task title"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={currentTask.description}
              onChange={(e) => setCurrentTask(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Enter task description"
              rows={4}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <Select value={currentTask.priority} onValueChange={(value: PriorityLevel) => setCurrentTask(prev => ({ ...prev, priority: value }))}>
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
              <Select value={currentTask.severity} onValueChange={(value: SeverityLevel) => setCurrentTask(prev => ({ ...prev, severity: value }))}>
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
              <Select value={currentTask.status} onValueChange={(value) => setCurrentTask(prev => ({ ...prev, status: value }))}>
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
                value={currentTask.dueDate}
                onChange={(e) => setCurrentTask(prev => ({ ...prev, dueDate: e.target.value }))}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="project">Project</Label>
            <Select value={currentTask.projectId} onValueChange={(value) => setCurrentTask(prev => ({ ...prev, projectId: value }))}>
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

          <div className="flex justify-end space-x-2 mt-4">
            {!initialData && !parentId && (
              <Button
                type="button"
                variant="outline"
                onClick={addTaskToList}
                disabled={!currentTask.title.trim()}
              >
                Add to Todo List
              </Button>
            )}
            <Button type="submit">
              {initialData 
                ? 'Update Task' 
                : parentId 
                  ? 'Create Sub-task'
                  : (taskItems.length > 0 ? 'Create Tasks' : 'Create Task')
              }
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
} 