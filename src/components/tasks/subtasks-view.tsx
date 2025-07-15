'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Circle, CheckCircle2, Plus, MoreVertical, Pencil, Trash2, ChevronDown, ChevronRight } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { CreateSubtaskModal } from './create-subtask-modal'
import { toast } from "@/components/ui/use-toast"
import { useTaskStore, PRIORITY_LABELS, type Task } from '@/store/tasks'
import { useProjectStore } from '@/store/projects'

interface SubTasksViewProps {
  task: Task
  onTaskUpdate?: (taskId: string, updates: Partial<Task>) => void
  onTaskDelete?: (taskId: string) => void
}

export function SubTasksView({ task, onTaskUpdate, onTaskDelete }: SubTasksViewProps) {
  const [isExpanded, setIsExpanded] = useState(true)
  const [showCreateSubTaskModal, setShowCreateSubTaskModal] = useState(false)
  const [editingSubTask, setEditingSubTask] = useState<Task | null>(null)

  const addTask = useTaskStore((state) => state.addTask)
  const updateTask = useTaskStore((state) => state.updateTask)
  const deleteTask = useTaskStore((state) => state.deleteTask)
  const projects = useProjectStore((state) => state.projects)

  const subtasks = task.subtasks || []

  const handleCreateSubTask = async (taskData: any) => {
    try {
      await addTask({
        title: taskData.title,
        description: taskData.description,
        status: taskData.status,
        priority: taskData.priority,
        severity: 'S3', // Default severity for subtasks
        dueDate: taskData.dueDate,
        projectId: task.projectId || taskData.projectId,
        parentId: task.id
      })
      setShowCreateSubTaskModal(false)
      toast({
        title: "Sub-task created",
        description: `${taskData.title} has been added as a sub-task.`,
      })
    } catch (error) {
      console.error('Error creating sub-task:', error)
      toast({
        title: "Error",
        description: "Failed to create sub-task. Please try again.",
        variant: "destructive"
      })
    }
  }

  const handleEditSubTask = async (taskData: any) => {
    if (!editingSubTask) return
    
    try {
      await updateTask(editingSubTask.id, {
        title: taskData.title,
        description: taskData.description,
        status: taskData.status,
        priority: taskData.priority,
        severity: editingSubTask.severity, // Keep existing severity
        dueDate: taskData.dueDate,
        projectId: taskData.projectId
      })
      setEditingSubTask(null)
      toast({
        title: "Sub-task updated",
        description: `${taskData.title} has been updated successfully.`,
      })
    } catch (error) {
      console.error('Error updating sub-task:', error)
      toast({
        title: "Error",
        description: "Failed to update sub-task. Please try again.",
        variant: "destructive"
      })
    }
  }

  const handleDeleteSubTask = async (subTaskId: string) => {
    try {
      await deleteTask(subTaskId)
      toast({
        title: "Sub-task deleted",
        description: "The sub-task has been deleted successfully.",
      })
    } catch (error) {
      console.error('Error deleting sub-task:', error)
      toast({
        title: "Error",
        description: "Failed to delete sub-task. Please try again.",
        variant: "destructive"
      })
    }
  }

  const toggleSubTask = async (subTaskId: string) => {
    const subTask = subtasks.find(t => t.id === subTaskId)
    if (!subTask) return
    
    const newStatus = subTask.status === 'COMPLETED' ? 'ACTIVE' : 'COMPLETED'
    
    // Optimistic update - update UI immediately
    const optimisticTask = { ...subTask, status: newStatus }
    const optimisticSubtasks = subtasks.map(t => 
      t.id === subTaskId ? optimisticTask : t
    )
    
    // Update parent task's subtasks immediately for instant UI feedback
    if (onTaskUpdate) {
      onTaskUpdate(task.id, { 
        subtasks: optimisticSubtasks 
      })
    }
    
    try {
      // Background API call
      await updateTask(subTaskId, { status: newStatus })
      // No toast for status toggles to reduce UI noise
    } catch (error) {
      console.error('Error updating sub-task status:', error)
      
      // Revert optimistic update on error
      if (onTaskUpdate) {
        onTaskUpdate(task.id, { subtasks })
      }
      
      toast({
        title: "Error",
        description: "Failed to update sub-task status. Please try again.",
        variant: "destructive"
      })
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'P3': return 'text-blue-500 dark:text-blue-400 bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800'
      case 'P2': return 'text-orange-500 dark:text-orange-400 bg-orange-50 dark:bg-orange-950 border-orange-200 dark:border-orange-800'
      case 'P1': return 'text-yellow-500 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-950 border-yellow-200 dark:border-yellow-800'
      default: return 'text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-800'
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'S3': return 'text-red-500 dark:text-red-400 bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800'
      case 'S2': return 'text-orange-500 dark:text-orange-400 bg-orange-50 dark:bg-orange-950 border-orange-200 dark:border-orange-800'
      case 'S1': return 'text-yellow-500 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-950 border-yellow-200 dark:border-yellow-800'
      default: return 'text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-800'
    }
  }

  const getFormDataFromTask = (task: Task) => {
    return {
      title: task.title,
      description: task.description || '',
      status: task.status === 'COMPLETED' ? 'COMPLETED' : 'ACTIVE' as 'COMPLETED' | 'ACTIVE',
      priority: task.priority,
      dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '',
      projectId: task.projectId || ''
    }
  }

  if (subtasks.length === 0) {
    return (
      <div className="mt-4">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-medium text-muted-foreground">Sub-tasks</h4>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowCreateSubTaskModal(true)}
            className="h-6 text-xs"
          >
            <Plus className="h-3 w-3 mr-1" />
            Add Sub-task
          </Button>
        </div>
        <p className="text-xs text-muted-foreground mt-2">No sub-tasks yet</p>

        <CreateSubtaskModal
          open={showCreateSubTaskModal}
          onOpenChange={setShowCreateSubTaskModal}
          onSubmit={handleCreateSubTask}
          projects={projects}
          projectId={task.projectId}
          parentId={task.id}
        />
      </div>
    )
  }

  return (
    <div className="mt-4 space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="h-6 w-6 p-0"
          >
            {isExpanded ? (
              <ChevronDown className="h-3 w-3" />
            ) : (
              <ChevronRight className="h-3 w-3" />
            )}
          </Button>
          <h4 className="text-sm font-medium text-muted-foreground">
            Sub-tasks ({subtasks.length})
          </h4>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowCreateSubTaskModal(true)}
          className="h-6 text-xs"
        >
          <Plus className="h-3 w-3 mr-1" />
          Add Sub-task
        </Button>
      </div>

      {isExpanded && (
        <div className="space-y-2 ml-4 border-l-2 border-gray-200 pl-4">
          {subtasks.map((subTask) => (
            <div
              key={subTask.id}
              className="flex items-center justify-between p-2 bg-muted rounded-md hover:bg-muted/80 transition-colors"
            >
              <div className="flex items-center gap-3 flex-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleSubTask(subTask.id)}
                  className="p-0 h-5 w-5"
                >
                  {subTask.status === 'COMPLETED' ? (
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                  ) : (
                    <Circle className="h-4 w-4 text-gray-400" />
                  )}
                </Button>
                <div className="flex-1">
                  <p className={`text-sm ${subTask.status === 'COMPLETED' ? 'line-through text-muted-foreground' : ''}`}>
                    {subTask.title}
                  </p>
                  {subTask.description && (
                    <p className="text-xs text-muted-foreground">{subTask.description}</p>
                  )}
                </div>
                <div className="flex gap-1">
                  <Badge variant="outline" className={`${getPriorityColor(subTask.priority)} text-xs`}>
                    {PRIORITY_LABELS[subTask.priority]}
                  </Badge>
                </div>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                    <MoreVertical className="h-3 w-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => setEditingSubTask(subTask)}>
                    <Pencil className="mr-2 h-3 w-3" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => handleDeleteSubTask(subTask.id)}
                    className="text-destructive"
                  >
                    <Trash2 className="mr-2 h-3 w-3" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ))}
        </div>
      )}

      <CreateSubtaskModal
        open={showCreateSubTaskModal}
        onOpenChange={setShowCreateSubTaskModal}
        onSubmit={handleCreateSubTask}
        projects={projects}
        projectId={task.projectId}
        parentId={task.id}
      />

      {editingSubTask && (
        <CreateSubtaskModal
          open={true}
          onOpenChange={(open) => !open && setEditingSubTask(null)}
          onSubmit={handleEditSubTask}
          initialData={getFormDataFromTask(editingSubTask)}
          projects={projects}
          projectId={task.projectId}
        />
      )}
    </div>
  )
} 