'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus, Circle, CheckCircle2, Clock, Calendar, MoreVertical, Pencil, Trash2, AlertTriangle, Flag, Grid3X3, List, Table, Columns, CheckSquare } from 'lucide-react'
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

type ViewMode = 'grid' | 'list' | 'table' | 'kanban'

export function TasksView({ projectId }: TasksViewProps) {
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const [isLoading, setIsLoading] = useState(true)

  // Get tasks and projects from stores
  const tasks = useTaskStore((state) => state.tasks)
  const fetchTasks = useTaskStore((state) => state.fetchTasks)
  const addTask = useTaskStore((state) => state.addTask)
  const updateTask = useTaskStore((state) => state.updateTask)
  const deleteTask = useTaskStore((state) => state.deleteTask)
  const projects = useProjectStore((state) => state.projects)
  const fetchProjects = useProjectStore((state) => state.fetchProjects)

  // Fetch tasks and projects on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        await Promise.all([fetchTasks(), fetchProjects()])
      } catch (error) {
        console.error('Failed to fetch data:', error)
        toast({
          title: "Error",
          description: "Failed to load data. Please try again.",
          variant: "destructive"
        })
      } finally {
        setIsLoading(false)
      }
    }
    loadData()
  }, [fetchTasks, fetchProjects])

  // Filter tasks by project if projectId is provided
  const filteredTasks = projectId
    ? tasks.filter(task => task.projectId === projectId)
    : tasks

  const handleCreateTask = async (taskData: any) => {
    try {
      await addTask({
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
    } catch (error) {
      console.error('Error creating task:', error)
      toast({
        title: "Error",
        description: "Failed to create task. Please try again.",
        variant: "destructive"
      })
    }
  }

  const handleEditTask = async (taskData: any) => {
    if (!editingTask) return
    
    try {
      await updateTask(editingTask.id, {
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
    } catch (error) {
      console.error('Error updating task:', error)
      toast({
        title: "Error",
        description: "Failed to update task. Please try again.",
        variant: "destructive"
      })
    }
  }

  const handleDeleteTask = async (taskId: string) => {
    try {
      await deleteTask(taskId)
      toast({
        title: "Task deleted",
        description: "The task has been deleted successfully.",
      })
    } catch (error) {
      console.error('Error deleting task:', error)
      toast({
        title: "Error",
        description: "Failed to delete task. Please try again.",
        variant: "destructive"
      })
    }
  }

  const toggleTask = async (taskId: string) => {
    const task = tasks.find(t => t.id === taskId)
    if (!task) return
    
    const newStatus = task.status === 'COMPLETED' ? 'TODO' : 'COMPLETED'
    try {
      await updateTask(taskId, { status: newStatus })
      toast({
        title: `Task ${newStatus === 'COMPLETED' ? 'completed' : 'reopened'}`,
        description: `${task.title} has been ${newStatus === 'COMPLETED' ? 'marked as complete' : 'reopened'}.`,
      })
    } catch (error) {
      console.error('Error updating task status:', error)
      toast({
        title: "Error",
        description: "Failed to update task status. Please try again.",
        variant: "destructive"
      })
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'P1': return 'text-red-600 bg-red-50 border-red-200'
      case 'P2': return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      case 'P3': return 'text-green-600 bg-green-50 border-green-200'
      default: return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'S1': return 'text-red-600 bg-red-50 border-red-200'
      case 'S2': return 'text-orange-600 bg-orange-50 border-orange-200'
      case 'S3': return 'text-blue-600 bg-blue-50 border-blue-200'
      default: return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  const getBorderColor = (priority: string, severity: string) => {
    if (priority === 'P1' || severity === 'S1') return 'border-l-red-500'
    if (priority === 'P2' || severity === 'S2') return 'border-l-yellow-500'
    if (priority === 'P3' || severity === 'S3') return 'border-l-green-500'
    return 'border-l-gray-300'
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'TODO': return 'bg-gray-500'
      case 'IN_PROGRESS': return 'bg-blue-500'
      case 'COMPLETED': return 'bg-green-500'
      default: return 'bg-gray-500'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'TODO': return 'To Do'
      case 'IN_PROGRESS': return 'In Progress'
      case 'COMPLETED': return 'Completed'
      default: return status
    }
  }

  const getFormDataFromTask = (task: Task) => {
    return {
      title: task.title,
      description: task.description || '',
      status: task.status,
      priority: task.priority,
      severity: task.severity,
      dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '',
      projectId: task.projectId || ''
    }
  }

  const viewModeButtons = [
    { mode: 'grid' as ViewMode, icon: Grid3X3, label: 'Grid' },
    { mode: 'list' as ViewMode, icon: List, label: 'List' },
    { mode: 'table' as ViewMode, icon: Table, label: 'Table' },
    { mode: 'kanban' as ViewMode, icon: Columns, label: 'Kanban' }
  ]

  const renderGridView = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {filteredTasks.map((task) => (
        <Card key={task.id} className={`cursor-pointer hover:shadow-lg transition-shadow border-l-4 ${getBorderColor(task.priority, task.severity)}`}>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleTask(task.id)}
                  className="p-0 h-6 w-6"
                >
                  {task.status === 'COMPLETED' ? (
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                  ) : (
                    <Circle className="h-5 w-5 text-gray-400" />
                  )}
                </Button>
                <CardTitle className={`text-lg ${task.status === 'COMPLETED' ? 'line-through text-muted-foreground' : ''}`}>
                  {task.title}
                </CardTitle>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => setEditingTask(task)}>
                    <Pencil className="mr-2 h-4 w-4" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => handleDeleteTask(task.id)}
                    className="text-destructive"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            {task.description && (
              <p className="text-sm text-muted-foreground mt-2">{task.description}</p>
            )}
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className={`${getStatusColor(task.status)} text-white`}>
                  {getStatusLabel(task.status)}
                </Badge>
                <Badge variant="outline" className={getPriorityColor(task.priority)}>
                  <Flag className="mr-1 h-3 w-3" />
                  {PRIORITY_LABELS[task.priority]}
                </Badge>
                <Badge variant="outline" className={getSeverityColor(task.severity)}>
                  <AlertTriangle className="mr-1 h-3 w-3" />
                  {SEVERITY_LABELS[task.severity]}
                </Badge>
              </div>
              {task.dueDate && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>Due {new Date(task.dueDate).toLocaleDateString()}</span>
                </div>
              )}
              {task.projectId && !projectId && (
                <div className="text-sm text-muted-foreground">
                  Project: {projects.find(p => p.id === task.projectId)?.name || 'Unknown'}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )

  const renderListView = () => (
    <div className="space-y-3">
      {filteredTasks.map((task) => (
        <Card key={task.id} className={`cursor-pointer hover:shadow-md transition-shadow border-l-4 ${getBorderColor(task.priority, task.severity)}`}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4 flex-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleTask(task.id)}
                  className="p-0 h-6 w-6 flex-shrink-0"
                >
                  {task.status === 'COMPLETED' ? (
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                  ) : (
                    <Circle className="h-5 w-5 text-gray-400" />
                  )}
                </Button>
                <div className="flex-1 min-w-0">
                  <h3 className={`font-semibold text-lg truncate ${task.status === 'COMPLETED' ? 'line-through text-muted-foreground' : ''}`}>
                    {task.title}
                  </h3>
                  {task.description && (
                    <p className="text-sm text-muted-foreground truncate">{task.description}</p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className={`${getStatusColor(task.status)} text-white`}>
                    {getStatusLabel(task.status)}
                  </Badge>
                  <Badge variant="outline" className={getPriorityColor(task.priority)}>
                    {PRIORITY_LABELS[task.priority]}
                  </Badge>
                  <Badge variant="outline" className={getSeverityColor(task.severity)}>
                    {SEVERITY_LABELS[task.severity]}
                  </Badge>
                  {task.dueDate && (
                    <span className="text-sm text-muted-foreground">
                      {new Date(task.dueDate).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => setEditingTask(task)}>
                    <Pencil className="mr-2 h-4 w-4" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => handleDeleteTask(task.id)}
                    className="text-destructive"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )

  const renderTableView = () => (
    <Card>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b">
              <tr>
                <th className="text-left p-4 font-semibold">Task</th>
                <th className="text-left p-4 font-semibold">Status</th>
                <th className="text-left p-4 font-semibold">Priority</th>
                <th className="text-left p-4 font-semibold">Severity</th>
                <th className="text-left p-4 font-semibold">Due Date</th>
                {!projectId && <th className="text-left p-4 font-semibold">Project</th>}
                <th className="text-left p-4 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredTasks.map((task) => (
                <tr key={task.id} className="border-b hover:bg-muted/50">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleTask(task.id)}
                        className="p-0 h-6 w-6"
                      >
                        {task.status === 'COMPLETED' ? (
                          <CheckCircle2 className="h-5 w-5 text-green-600" />
                        ) : (
                          <Circle className="h-5 w-5 text-gray-400" />
                        )}
                      </Button>
                      <div>
                        <span className={`font-medium ${task.status === 'COMPLETED' ? 'line-through text-muted-foreground' : ''}`}>
                          {task.title}
                        </span>
                        {task.description && (
                          <p className="text-sm text-muted-foreground truncate max-w-xs">
                            {task.description}
                          </p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <Badge variant="secondary" className={`${getStatusColor(task.status)} text-white`}>
                      {getStatusLabel(task.status)}
                    </Badge>
                  </td>
                  <td className="p-4">
                    <Badge variant="outline" className={getPriorityColor(task.priority)}>
                      {PRIORITY_LABELS[task.priority]}
                    </Badge>
                  </td>
                  <td className="p-4">
                    <Badge variant="outline" className={getSeverityColor(task.severity)}>
                      {SEVERITY_LABELS[task.severity]}
                    </Badge>
                  </td>
                  <td className="p-4">
                    {task.dueDate ? (
                      <span className="text-sm">
                        {new Date(task.dueDate).toLocaleDateString()}
                      </span>
                    ) : (
                      <span className="text-sm text-muted-foreground">No due date</span>
                    )}
                  </td>
                  {!projectId && (
                    <td className="p-4">
                      <span className="text-sm">
                        {task.projectId ? (projects.find(p => p.id === task.projectId)?.name || 'Unknown') : 'No project'}
                      </span>
                    </td>
                  )}
                  <td className="p-4">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem onClick={() => setEditingTask(task)}>
                          <Pencil className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => handleDeleteTask(task.id)}
                          className="text-destructive"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )

  const renderKanbanView = () => {
    const statusColumns = [
      { key: 'TODO', label: 'To Do', color: 'bg-gray-100 border-gray-300 dark:bg-zinc-900 dark:border-zinc-700' },
      { key: 'IN_PROGRESS', label: 'In Progress', color: 'bg-blue-100 border-blue-300 dark:bg-blue-900 dark:border-blue-700' },
      { key: 'COMPLETED', label: 'Completed', color: 'bg-green-100 border-green-300 dark:bg-green-900 dark:border-green-700' }
    ]

    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {statusColumns.map((column) => (
          <div key={column.key} className={`rounded-lg border-2 ${column.color} p-4`}>
            <h3 className="font-semibold mb-4 flex items-center justify-between">
              {column.label}
              <Badge variant="secondary">
                {filteredTasks.filter(t => t.status === column.key).length}
              </Badge>
            </h3>
            <div className="space-y-3">
              {filteredTasks
                .filter(task => task.status === column.key)
                .map((task) => (
                  <Card key={task.id} className={`cursor-pointer hover:shadow-md transition-shadow border-l-4 ${getBorderColor(task.priority, task.severity)}`}>
                    <CardContent className="p-3">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-sm truncate">{task.title}</h4>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                              <MoreVertical className="h-3 w-3" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            <DropdownMenuItem onClick={() => setEditingTask(task)}>
                              <Pencil className="mr-2 h-3 w-3" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleDeleteTask(task.id)}
                              className="text-destructive"
                            >
                              <Trash2 className="mr-2 h-3 w-3" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                      {task.description && (
                        <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                          {task.description}
                        </p>
                      )}
                      <div className="space-y-2">
                        <div className="flex gap-1">
                          <Badge variant="outline" className={`${getPriorityColor(task.priority)} text-xs`}>
                            {PRIORITY_LABELS[task.priority]}
                          </Badge>
                          <Badge variant="outline" className={`${getSeverityColor(task.severity)} text-xs`}>
                            {SEVERITY_LABELS[task.severity]}
                          </Badge>
                        </div>
                        {task.dueDate && (
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Calendar className="h-3 w-3" />
                            <span>{new Date(task.dueDate).toLocaleDateString()}</span>
                          </div>
                        )}
                        {task.projectId && !projectId && (
                          <div className="text-xs text-muted-foreground">
                            {projects.find(p => p.id === task.projectId)?.name || 'Unknown'}
                          </div>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleTask(task.id)}
                          className="w-full h-6 text-xs"
                        >
                          {task.status === 'COMPLETED' ? 'Reopen' : 'Complete'}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          </div>
        ))}
      </div>
    )
  }

  const renderCurrentView = () => {
    switch (viewMode) {
      case 'grid':
        return renderGridView()
      case 'list':
        return renderListView()
      case 'table':
        return renderTableView()
      case 'kanban':
        return renderKanbanView()
      default:
        return renderGridView()
    }
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {projectId ? 'Project Tasks' : 'Tasks'}
          </h1>
          <p className="text-muted-foreground">
            Manage your tasks and track their progress
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* View Mode Toggle */}
          <div className="flex rounded-lg border p-1">
            {viewModeButtons.map(({ mode, icon: Icon, label }) => (
              <Button
                key={mode}
                variant={viewMode === mode ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode(mode)}
                className="h-8 px-3"
              >
                <Icon className="h-4 w-4" />
                <span className="sr-only">{label}</span>
              </Button>
            ))}
          </div>
          <Button onClick={() => setShowCreateModal(true)}>
            <Plus className="mr-2 h-4 w-4" />
            New Task
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-12">
          <p>Loading tasks...</p>
        </div>
      ) : filteredTasks.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <CheckSquare className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No tasks yet</h3>
            <p className="text-muted-foreground mb-4">
              Create your first task to get started
            </p>
            <Button onClick={() => setShowCreateModal(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Create Task
            </Button>
          </CardContent>
        </Card>
      ) : (
        renderCurrentView()
      )}

      <CreateTaskModal
        open={showCreateModal}
        onOpenChange={setShowCreateModal}
        onSubmit={handleCreateTask}
        projects={projects}
        projectId={projectId}
      />

      {editingTask && (
        <CreateTaskModal
          open={true}
          onOpenChange={(open) => !open && setEditingTask(null)}
          onSubmit={handleEditTask}
          initialData={getFormDataFromTask(editingTask)}
          projects={projects}
          projectId={projectId}
        />
      )}
    </div>
  )
} 