'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus, Circle, CheckCircle2, Clock, Calendar, MoreVertical, Pencil, Trash2, AlertTriangle, Flag } from 'lucide-react'
import { CreateTaskModal } from '@/components/tasks/create-task-modal'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { toast } from "@/components/ui/use-toast"
import { useTaskStore, PRIORITY_LABELS, SEVERITY_LABELS, type Task } from '@/store/tasks'
import { useProjectStore } from '@/store/projects'
import { Badge } from '@/components/ui/badge'

interface TasksViewProps {
  projectId?: string
}

export function TasksView({ projectId }: TasksViewProps) {
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)

  // Get tasks and projects from stores
  const tasks = useTaskStore((state) => state.tasks)
  const addTask = useTaskStore((state) => state.addTask)
  const updateTask = useTaskStore((state) => state.updateTask)
  const deleteTask = useTaskStore((state) => state.deleteTask)
  const projects = useProjectStore((state) => state.projects)

  // Filter tasks by project if projectId is provided
  const filteredTasks = projectId
    ? tasks.filter(task => task.projectId === projectId)
    : tasks

  const handleCreateTask = (taskData: any) => {
    addTask({
      title: taskData.title,
      description: taskData.description,
      status: taskData.status,
      priority: taskData.priority,
      severity: taskData.severity,
      dueDate: taskData.dueDate,
      projectId: projectId || taskData.projectId
    })
    setShowCreateModal(false)
    toast({
      title: "Task created",
      description: `${taskData.title} has been created successfully.`,
    })
  }

  const handleEditTask = (taskData: any) => {
    if (!editingTask) return
    
    updateTask(editingTask.id, {
      title: taskData.title,
      description: taskData.description,
      status: taskData.status,
      priority: taskData.priority,
      severity: taskData.severity,
      dueDate: taskData.dueDate,
      projectId: projectId || taskData.projectId
    })
    setEditingTask(null)
    toast({
      title: "Task updated",
      description: `${taskData.title} has been updated successfully.`,
    })
  }

  const handleDeleteTask = (taskId: string) => {
    const taskToDelete = tasks.find(task => task.id === taskId)
    if (!taskToDelete) return

    // Check if task has active Pomodoro sessions
    const hasActiveSessions = false // This would need to be replaced with actual check
    
    if (hasActiveSessions) {
      toast({
        title: "Cannot delete task",
        description: "Please complete or cancel active Pomodoro sessions before deleting this task.",
        variant: "destructive"
      })
      return
    }
    
    deleteTask(taskId)
    toast({
      title: "Task deleted",
      description: "The task has been deleted successfully.",
    })
  }

  const toggleTask = (taskId: string) => {
    const task = tasks.find(t => t.id === taskId)
    if (!task) return

    updateTask(taskId, {
      status: task.status === 'COMPLETED' ? 'TODO' : 'COMPLETED'
    })

    toast({
      title: task.status === 'COMPLETED' ? "Task reopened" : "Task completed",
      description: `${task.title} has been ${task.status === 'COMPLETED' ? 'reopened' : 'marked as complete'}.`,
    })
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'P3': return 'bg-red-500 text-white'
      case 'P2': return 'bg-orange-500 text-white'
      case 'P1': return 'bg-yellow-500 text-white'
      case 'P0': return 'bg-green-500 text-white'
      default: return 'bg-muted text-muted-foreground'
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'S3': return 'bg-red-500 text-white'
      case 'S2': return 'bg-orange-500 text-white'
      case 'S1': return 'bg-yellow-500 text-white'
      case 'S0': return 'bg-green-500 text-white'
      default: return 'bg-muted text-muted-foreground'
    }
  }

  const getBorderColor = (priority: string, severity: string) => {
    // Use the higher of priority or severity for the border color
    const level = Math.max(
      parseInt(priority.charAt(1)),
      parseInt(severity.charAt(1))
    )
    switch (level) {
      case 3: return 'border-l-red-500 bg-red-50 dark:bg-red-950/20'
      case 2: return 'border-l-orange-500 bg-orange-50 dark:bg-orange-950/20'
      case 1: return 'border-l-yellow-500 bg-yellow-50 dark:bg-yellow-950/20'
      case 0: return 'border-l-green-500 bg-green-50 dark:bg-green-950/20'
      default: return 'border-l-muted bg-muted/20'
    }
  }

  const getFormDataFromTask = (task: Task) => {
    return {
      title: task.title,
      description: task.description || '',
      priority: task.priority,
      severity: task.severity,
      status: task.status,
      dueDate: task.dueDate || '',
      projectId: projectId || task.projectId || ''
    }
  }

  const selectedProject = projectId ? projects.find(p => p.id === projectId) : null

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            {selectedProject ? `Tasks - ${selectedProject.name}` : 'Tasks'}
          </h1>
          <p className="text-muted-foreground">Manage your tasks and track progress</p>
        </div>
        <Button onClick={() => setShowCreateModal(true)}>
          <Plus className="mr-2 h-4 w-4" />
          New Task
        </Button>
      </div>

      <div className="space-y-4">
        {filteredTasks.map((task) => {
          const project = !projectId && task.projectId ? projects.find(p => p.id === task.projectId) : null
          return (
            <Card 
              key={task.id} 
              className={`border-l-4 ${getBorderColor(task.priority, task.severity)} hover:shadow-md transition-shadow`}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3">
                    <button
                      onClick={() => toggleTask(task.id)}
                      className="mt-1"
                    >
                      {task.status === 'COMPLETED' ? (
                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                      ) : (
                        <Circle className="h-5 w-5 text-muted-foreground" />
                      )}
                    </button>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <CardTitle className={`text-lg ${task.status === 'COMPLETED' ? 'line-through text-muted-foreground' : ''}`}>
                          {task.title}
                        </CardTitle>
                        <Badge variant="secondary" className={getPriorityColor(task.priority)}>
                          <Flag className="h-3 w-3 mr-1" />
                          {task.priority} - {PRIORITY_LABELS[task.priority]}
                        </Badge>
                        <Badge variant="secondary" className={getSeverityColor(task.severity)}>
                          <AlertTriangle className="h-3 w-3 mr-1" />
                          {task.severity} - {SEVERITY_LABELS[task.severity]}
                        </Badge>
                      </div>
                      <p className={`text-sm text-muted-foreground ${task.status === 'COMPLETED' ? 'line-through' : ''}`}>
                        {task.description}
                      </p>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem 
                        onClick={() => setEditingTask(task)}
                        className="flex items-center"
                      >
                        <Pencil className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => handleDeleteTask(task.id)}
                        className="flex items-center text-red-600"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <div className="flex items-center space-x-4">
                    {task.dueDate && (
                      <div className="flex items-center">
                        <Calendar className="mr-1 h-3 w-3" />
                        <span>Due {new Date(task.dueDate).toLocaleDateString()}</span>
                      </div>
                    )}
                    {project && (
                      <div className="flex items-center">
                        <Clock className="mr-1 h-3 w-3" />
                        <span>{project.name}</span>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center">
                    <span className="capitalize">{task.status.toLowerCase().replace('_', ' ')}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <CreateTaskModal
        open={showCreateModal}
        onOpenChange={setShowCreateModal}
        onSubmit={handleCreateTask}
        projects={projectId ? [] : projects}
      />

      <CreateTaskModal
        open={!!editingTask}
        onOpenChange={(open) => !open && setEditingTask(null)}
        onSubmit={handleEditTask}
        projects={projectId ? [] : projects}
        initialData={editingTask ? getFormDataFromTask(editingTask) : undefined}
      />
    </div>
  )
} 