'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus, Circle, CheckCircle2, Clock, Calendar, MoreVertical, Pencil, Trash2 } from 'lucide-react'
import { CreateTaskModal } from '@/components/tasks/create-task-modal'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { toast } from "@/components/ui/use-toast"

export function TasksView() {
  const [tasks, setTasks] = useState([
    {
      id: '1',
      title: 'Design homepage layout',
      description: 'Create wireframes and mockups for the new homepage',
      status: 'completed',
      priority: 'high',
      dueDate: '2024-01-20',
      project: 'Website Redesign'
    },
    {
      id: '2',
      title: 'Set up development environment',
      description: 'Configure local development setup for the mobile app',
      status: 'in-progress',
      priority: 'medium',
      dueDate: '2024-01-22',
      project: 'Mobile App Development'
    },
    {
      id: '3',
      title: 'Research competitors',
      description: 'Analyze competitor strategies and positioning',
      status: 'todo',
      priority: 'low',
      dueDate: '2024-01-25',
      project: 'Marketing Campaign'
    },
    {
      id: '4',
      title: 'Write API documentation',
      description: 'Document all endpoints and authentication methods',
      status: 'todo',
      priority: 'high',
      dueDate: '2024-01-24',
      project: 'Mobile App Development'
    }
  ])

  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingTask, setEditingTask] = useState<any>(null)

  const mockProjects = [
    { id: '1', name: 'Website Redesign' },
    { id: '2', name: 'Mobile App Development' },
    { id: '3', name: 'Marketing Campaign' }
  ]

  const handleCreateTask = (taskData: any) => {
    const newTask = {
      id: Date.now().toString(),
      title: taskData.title,
      description: taskData.description,
      status: taskData.status.toLowerCase().replace('_', '-'),
      priority: taskData.priority.toLowerCase(),
      dueDate: taskData.dueDate,
      project: mockProjects.find(p => p.id === taskData.projectId)?.name || 'No Project'
    }
    setTasks(prev => [...prev, newTask])
    setShowCreateModal(false)
    toast({
      title: "Task created",
      description: `${taskData.title} has been created successfully.`,
    })
  }

  const handleEditTask = (taskData: any) => {
    setTasks(prev => prev.map(task => 
      task.id === editingTask.id 
        ? { 
            ...task, 
            title: taskData.title,
            description: taskData.description,
            status: taskData.status.toLowerCase().replace('_', '-'),
            priority: taskData.priority.toLowerCase(),
            dueDate: taskData.dueDate,
            project: mockProjects.find(p => p.id === taskData.projectId)?.name || task.project
          }
        : task
    ))
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
    
    setTasks(prev => prev.filter(task => task.id !== taskId))
    toast({
      title: "Task deleted",
      description: "The task has been deleted successfully.",
    })
  }

  const toggleTask = (taskId: string) => {
    setTasks(prev => prev.map(task => 
      task.id === taskId 
        ? { ...task, status: task.status === 'completed' ? 'todo' : 'completed' }
        : task
    ))
    const task = tasks.find(t => t.id === taskId)
    if (task) {
      toast({
        title: task.status === 'completed' ? "Task reopened" : "Task completed",
        description: `${task.title} has been ${task.status === 'completed' ? 'reopened' : 'marked as complete'}.`,
      })
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'border-l-red-500 bg-red-50 dark:bg-red-950/20'
      case 'medium': return 'border-l-yellow-500 bg-yellow-50 dark:bg-yellow-950/20'
      case 'low': return 'border-l-green-500 bg-green-50 dark:bg-green-950/20'
      default: return 'border-l-muted bg-muted/20'
    }
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Tasks</h1>
          <p className="text-muted-foreground">Manage your tasks and track progress</p>
        </div>
        <Button onClick={() => setShowCreateModal(true)}>
          <Plus className="mr-2 h-4 w-4" />
          New Task
        </Button>
      </div>

      <div className="space-y-4">
        {tasks.map((task) => (
          <Card 
            key={task.id} 
            className={`border-l-4 ${getPriorityColor(task.priority)} hover:shadow-md transition-shadow`}
          >
            <CardHeader className="py-3">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3">
                  <button
                    onClick={() => toggleTask(task.id)}
                    className="mt-1"
                  >
                    {task.status === 'completed' ? (
                      <CheckCircle2 className="h-5 w-5 text-green-500" />
                    ) : (
                      <Circle className="h-5 w-5 text-muted-foreground" />
                    )}
                  </button>
                  <div>
                    <CardTitle className={`text-lg ${task.status === 'completed' ? 'line-through text-muted-foreground' : ''}`}>
                      {task.title}
                    </CardTitle>
                    <p className={`text-sm text-muted-foreground ${task.status === 'completed' ? 'line-through' : ''}`}>
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
            <CardContent className="py-3">
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center">
                    <Calendar className="mr-1 h-3 w-3" />
                    <span>Due {task.dueDate}</span>
                  </div>
                  <div className="flex items-center">
                    <Clock className="mr-1 h-3 w-3" />
                    <span>{task.project}</span>
                  </div>
                </div>
                <div className="flex items-center">
                  <span className="capitalize">{task.status}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <CreateTaskModal
        open={showCreateModal}
        onOpenChange={setShowCreateModal}
        onSubmit={handleCreateTask}
        projects={mockProjects}
      />

      <CreateTaskModal
        open={!!editingTask}
        onOpenChange={(open) => !open && setEditingTask(null)}
        onSubmit={handleEditTask}
        projects={mockProjects}
        initialData={{
          ...editingTask,
          status: editingTask?.status?.toUpperCase().replace('-', '_'),
          priority: editingTask?.priority?.toUpperCase(),
          projectId: mockProjects.find(p => p.name === editingTask?.project)?.id || ''
        }}
      />
    </div>
  )
} 