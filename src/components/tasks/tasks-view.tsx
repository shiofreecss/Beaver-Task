'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus, Circle, CheckCircle2, Clock, Calendar, MoreVertical, Pencil, Trash2, AlertTriangle, Flag, Grid3X3, List, Table, Columns, CheckSquare, CalendarRange, Filter } from 'lucide-react'
import { CreateTaskModal } from '@/components/tasks/create-task-modal'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from "@/components/ui/use-toast"
import { useTaskStore, PRIORITY_LABELS, SEVERITY_LABELS, TASK_STATUS_COLORS, TASK_STATUS_LABELS, type Task } from '@/store/tasks'
import { useProjectStore } from '@/store/projects'
import { Badge } from '@/components/ui/badge'
import { DragDropContext, Droppable, Draggable, DroppableProvided, DraggableProvided, DropResult } from '@hello-pangea/dnd'
import { KanbanColumnSettings } from './kanban-column-settings'
import { TimelineView } from './timeline-view'
import { SubTasksView } from './subtasks-view'

interface TasksViewProps {
  projectId?: string
}

type ViewMode = 'grid' | 'list' | 'table' | 'kanban' | 'timeline'

export function TasksView({ projectId }: TasksViewProps) {
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showColumnSettings, setShowColumnSettings] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const [isLoading, setIsLoading] = useState(true)
  const [selectedProjectFilter, setSelectedProjectFilter] = useState<string>('all')
  const [localTasks, setLocalTasks] = useState<Task[]>([]) // Local state for optimistic updates

  // Get tasks and projects from stores
  const tasks = useTaskStore((state) => state.tasks)
  const fetchTasks = useTaskStore((state) => state.fetchTasks)
  const addTask = useTaskStore((state) => state.addTask)
  const addTasks = useTaskStore((state) => state.addTasks)
  const updateTask = useTaskStore((state) => state.updateTask)
  const deleteTask = useTaskStore((state) => state.deleteTask)
  const moveTask = useTaskStore((state) => state.moveTask)
  const columns = useTaskStore((state) => state.columns)
  const fetchColumns = useTaskStore((state) => state.fetchColumns)
  const projects = useProjectStore((state) => state.projects)
  const fetchProjects = useProjectStore((state) => state.fetchProjects)

  // Sync local tasks with store tasks
  useEffect(() => {
    setLocalTasks(tasks)
  }, [tasks])

  // Fetch tasks and projects on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        await Promise.all([fetchTasks(), fetchProjects(), fetchColumns()])
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
  }, [fetchTasks, fetchProjects, fetchColumns])

  // Filter tasks by project if projectId is provided, and only show parent tasks (no parentId)
  // Also apply project filter if selectedProjectFilter is set
  const filteredTasks = localTasks.filter(task => {
    // Only show parent tasks (no parentId)
    if (task.parentId) return false
    
    // If we're in a specific project view, filter by that project
    if (projectId && task.projectId !== projectId) return false
    
    // If we're in the general tasks view and a project filter is selected
    if (!projectId && selectedProjectFilter !== 'all') {
      if (selectedProjectFilter === 'no-project') {
        return !task.projectId
      } else {
        return task.projectId === selectedProjectFilter
      }
    }
    
    return true
  })

  const handleCreateTask = async (taskData: any) => {
    try {
      if (Array.isArray(taskData)) {
        // Handle multiple tasks
        await addTasks(taskData.map(task => ({
          title: task.title,
          description: task.description,
          status: task.status,
          priority: task.priority,
          severity: task.severity,
          dueDate: task.dueDate,
          projectId: projectId || task.projectId
        })))
        setShowCreateModal(false)
        toast({
          title: "Tasks created",
          description: `${taskData.length} tasks have been created successfully.`,
        })
      } else {
        // Handle single task
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
      }
    } catch (error) {
      console.error('Error creating task(s):', error)
      toast({
        title: "Error",
        description: "Failed to create task(s). Please try again.",
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

  // Handle local task updates for optimistic UI updates (especially for subtasks)
  const handleTaskUpdate = (taskId: string, updates: Partial<Task>) => {
    // Update local state immediately for instant UI feedback
    setLocalTasks(prevTasks => {
      const updateTaskInTree = (tasks: Task[]): Task[] => {
        return tasks.map(task => {
          if (task.id === taskId) {
            return { ...task, ...updates }
          }
          if (task.subtasks?.length) {
            return { ...task, subtasks: updateTaskInTree(task.subtasks) }
          }
          return task
        })
      }
      return updateTaskInTree(prevTasks)
    })
  }

  const toggleTask = async (taskId: string) => {
    const task = localTasks.find(t => t.id === taskId)
    if (!task) return
    
    const newStatus = task.status === 'COMPLETED' ? 'ACTIVE' : 'COMPLETED'
    
    // Optimistic update
    handleTaskUpdate(taskId, { status: newStatus })
    
    try {
      await updateTask(taskId, { status: newStatus })
      // Removed toast for consistency with subtask updates
    } catch (error) {
      console.error('Error updating task status:', error)
      // Revert optimistic update on error
      handleTaskUpdate(taskId, { status: task.status })
      toast({
        title: "Error",
        description: "Failed to update task status. Please try again.",
        variant: "destructive"
      })
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'P3': return 'text-blue-600 bg-blue-50 border-blue-200'
      case 'P2': return 'text-orange-600 bg-orange-50 border-orange-200'
      case 'P1': return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      default: return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'S3': return 'text-red-600 bg-red-50 border-red-200'
      case 'S2': return 'text-orange-600 bg-orange-50 border-orange-200'
      case 'S1': return 'text-yellow-600 bg-yellow-50 border-yellow-200'
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
    return TASK_STATUS_COLORS[status as keyof typeof TASK_STATUS_COLORS] || 'bg-gray-500'
  }

  const getStatusBadgeStyle = (status: string) => {
    switch (status) {
      case 'IN_PROGRESS': 
        return 'bg-yellow-600 text-white border-yellow-600'
      case 'PLANNING': 
        return 'bg-orange-600 text-white border-orange-600'
      case 'ACTIVE': 
        return 'bg-blue-500 text-white border-blue-500'
      case 'COMPLETED': 
        return 'bg-green-500 text-white border-green-500'
      case 'ON_HOLD': 
        return 'bg-gray-500 text-white border-gray-500'
      default: 
        return 'bg-gray-500 text-white border-gray-500'
    }
  }

  const getStatusLabel = (status: string) => {
    return TASK_STATUS_LABELS[status as keyof typeof TASK_STATUS_LABELS] || status
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
    { mode: 'kanban' as ViewMode, icon: Columns, label: 'Kanban' },
    { mode: 'timeline' as ViewMode, icon: CalendarRange, label: 'Timeline' }
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
                <Badge variant="outline" className={getStatusBadgeStyle(task.status)}>
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
            <SubTasksView task={task} onTaskUpdate={handleTaskUpdate} />
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
                  <Badge variant="outline" className={getStatusBadgeStyle(task.status)}>
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
                    <Badge variant="outline" className={getStatusBadgeStyle(task.status)}>
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
    const projectColumns = columns
      .filter(col => col.projectId === projectId)
      .sort((a, b) => a.order - b.order)

    // If no custom columns exist for this project, use default columns
    const columnsToUse = projectColumns.length > 0 ? projectColumns : [
      { id: 'active', name: 'Active', color: 'bg-blue-500 dark:bg-blue-600', order: 0 },
      { id: 'planning', name: 'Planning', color: 'bg-orange-500 dark:bg-orange-600', order: 1 },
      { id: 'in_progress', name: 'In Progress', color: 'bg-yellow-500 dark:bg-yellow-600', order: 2 },
      { id: 'on_hold', name: 'On Hold', color: 'bg-gray-500 dark:bg-gray-600', order: 3 },
      { id: 'completed', name: 'Completed', color: 'bg-green-500 dark:bg-green-600', order: 4 }
    ]

    const getTasksForColumn = (columnId: string) => {
      const tasksForColumn = filteredTasks.filter(task => {
        // If task has a columnId, use that
        if (task.columnId) {
          return task.columnId === columnId
        }
        // Otherwise, map the task's status to the default column id
        const statusToColumnId: Record<string, string> = {
          'ACTIVE': 'active',
          'PLANNING': 'planning',
          'IN_PROGRESS': 'in_progress',
          'ON_HOLD': 'on_hold',
          'COMPLETED': 'completed'
        }
        return statusToColumnId[task.status] === columnId
      })
      
      console.log(`Tasks for column ${columnId}:`, tasksForColumn)
      return tasksForColumn
    }

    const handleDragEnd = async (result: DropResult) => {
      console.log('Drag ended:', result)
      if (!result.destination) {
        console.log('No destination provided')
        return
      }

      const taskId = result.draggableId
      const sourceColumnId = result.source.droppableId
      const destinationColumnId = result.destination.droppableId

      if (sourceColumnId === destinationColumnId) {
        console.log('Same column, no action needed')
        return
      }

      try {
        console.log('Moving task:', { taskId, sourceColumnId, destinationColumnId })
        await moveTask(taskId, destinationColumnId)
        toast({
          title: 'Success',
          description: 'Task moved successfully',
        })
      } catch (error) {
        console.error('Error moving task:', error)
        toast({
          title: 'Error',
          description: 'Failed to move task. Please try again.',
          variant: 'destructive',
        })
      }
    }

    // Debug logging
    console.log('Kanban Debug:', {
      projectId,
      totalTasks: tasks.length,
      filteredTasks: filteredTasks.length,
      columns: columns.length,
      projectColumns: projectColumns.length,
      columnsToUse: columnsToUse.length,
      tasksPerColumn: columnsToUse.map(col => ({
        columnId: col.id,
        columnName: col.name,
        taskCount: getTasksForColumn(col.id).length,
        tasks: getTasksForColumn(col.id).map(t => ({ id: t.id, title: t.title, status: t.status, columnId: t.columnId }))
      }))
    })

    // Show a message if no tasks are available
    if (filteredTasks.length === 0) {
      return (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No tasks available for this project.</p>
          <Button 
            onClick={() => setShowCreateModal(true)}
            className="mt-4"
          >
            <Plus className="mr-2 h-4 w-4" />
            Create First Task
          </Button>
        </div>
      )
    }

    return (
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="kanban-container px-4 lg:px-6">
          {columnsToUse.map((column) => {
            const columnTasks = getTasksForColumn(column.id)
            return (
              <Droppable key={column.id} droppableId={column.id}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`kanban-column ${snapshot.isDraggingOver ? 'bg-muted/50' : ''}`}
                  >
                    <div className={`p-3 rounded-t-lg ${column.color}`}>
                      <h3 className="font-semibold text-white text-base flex items-center justify-between">
                        <span className="truncate pr-2">
                          {column.name}
                        </span>
                        <Badge variant="secondary" className="bg-white/10 text-white text-xs">
                          {columnTasks.length}
                        </Badge>
                      </h3>
                    </div>
                    <div className="bg-card p-3 rounded-b-lg border border-border" style={{ minHeight: 'auto' }}>
                      {columnTasks.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground text-sm">
                          No tasks in this column
                        </div>
                      ) : (
                        columnTasks.map((task, index) => (
                          <Draggable
                            key={task.id}
                            draggableId={task.id}
                            index={index}
                          >
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                className={`mb-3 ${snapshot.isDragging ? 'rotate-2' : ''}`}
                              >
                                <Card className="cursor-pointer hover:shadow-lg transition-shadow">
                                  <CardContent className="p-4">
                                    <div className="flex items-start justify-between mb-3">
                                      <div className="flex items-start gap-2 min-w-0 flex-1">
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={(e) => {
                                            e.stopPropagation()
                                            toggleTask(task.id)
                                          }}
                                          className="p-0 h-6 w-6 flex-shrink-0 mt-0.5"
                                        >
                                          {task.status === 'COMPLETED' ? (
                                            <CheckCircle2 className="h-4 w-4 text-green-600" />
                                          ) : (
                                            <Circle className="h-4 w-4 text-gray-400" />
                                          )}
                                        </Button>
                                        <div className="min-w-0 flex-1">
                                          <h4 className={`font-medium text-sm truncate ${task.status === 'COMPLETED' ? 'line-through text-muted-foreground' : ''}`}>
                                            {task.title}
                                          </h4>
                                          {task.description && (
                                            <p className="text-xs text-muted-foreground line-clamp-2 mt-1">{task.description}</p>
                                          )}
                                        </div>
                                      </div>
                                      <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                          <Button variant="ghost" size="sm" className="h-7 w-7 p-0 flex-shrink-0">
                                            <MoreVertical className="h-4 w-4" />
                                          </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
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
                                    <div className="space-y-2">
                                      <div className="flex gap-1 flex-wrap">
                                        <Badge variant="outline" className={`${getPriorityColor(task.priority)} text-xs`}>
                                          <Flag className="mr-1 h-3 w-3" />
                                          {PRIORITY_LABELS[task.priority]}
                                        </Badge>
                                        <Badge variant="outline" className={`${getSeverityColor(task.severity)} text-xs`}>
                                          <AlertTriangle className="mr-1 h-3 w-3" />
                                          {SEVERITY_LABELS[task.severity]}
                                        </Badge>
                                      </div>
                                      {task.dueDate && (
                                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                          <Calendar className="h-3 w-3 flex-shrink-0" />
                                          <span className="truncate">Due {new Date(task.dueDate).toLocaleDateString()}</span>
                                        </div>
                                      )}
                                      {task.projectId && !projectId && (
                                        <div className="text-xs text-muted-foreground">
                                          Project: {projects.find(p => p.id === task.projectId)?.name || 'Unknown'}
                                        </div>
                                      )}
                                    </div>
                                  </CardContent>
                                </Card>
                              </div>
                            )}
                          </Draggable>
                        ))
                      )}
                      {provided.placeholder}
                    </div>
                  </div>
                )}
              </Droppable>
            )
          })}
        </div>
      </DragDropContext>
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
      case 'timeline':
        return <TimelineView tasks={filteredTasks} />
      default:
        return renderGridView()
    }
  }

  return (
    <div className="p-4 lg:p-6 w-full">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold tracking-tight">
            {projectId ? 'Project Tasks' : 'Tasks'}
          </h1>
        </div>
        <div className="flex items-center gap-2">
          {/* Project Filter - only show in general tasks view */}
          {!projectId && (
            <Select value={selectedProjectFilter} onValueChange={setSelectedProjectFilter}>
              <SelectTrigger className="w-48">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter by project" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Projects</SelectItem>
                <SelectItem value="no-project">No Project</SelectItem>
                {projects.map((project) => (
                  <SelectItem key={project.id} value={project.id}>
                    {project.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          
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
          {viewMode === 'kanban' && projectId && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowColumnSettings(true)}
              className="h-8"
            >
              Manage Columns
            </Button>
          )}
          <Button onClick={() => setShowCreateModal(true)}>
            <Plus className="mr-2 h-4 w-4" />
            New Task
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
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

      {projectId && (
        <KanbanColumnSettings
          open={showColumnSettings}
          onOpenChange={setShowColumnSettings}
          projectId={projectId}
        />
      )}
    </div>
  )
} 