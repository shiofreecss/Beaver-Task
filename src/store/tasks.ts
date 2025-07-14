import { create } from 'zustand'
import { getTailwindClass } from '@/lib/utils'

export type PriorityLevel = 'P0' | 'P1' | 'P2' | 'P3'
export type SeverityLevel = 'S0' | 'S1' | 'S2' | 'S3'

export const PRIORITY_LABELS: Record<PriorityLevel, string> = {
  'P0': 'Low',
  'P1': 'Normal',
  'P2': 'High',
  'P3': 'Highest'
}

export const SEVERITY_LABELS: Record<SeverityLevel, string> = {
  'S0': 'Low',
  'S1': 'Normal',
  'S2': 'High',
  'S3': 'Critical'
}

export interface KanbanColumn {
  id: string
  name: string
  color: string
  order: number
  projectId?: string
}

export interface Task {
  id: string
  title: string
  description?: string
  status: string
  priority: PriorityLevel
  severity: SeverityLevel
  dueDate?: string
  projectId?: string
  parentId?: string
  columnId?: string
  project?: {
    id: string
    name: string
  }
  parent?: Task
  subtasks?: Task[]
  createdAt: string
  updatedAt: string
}

interface TaskState {
  tasks: Task[]
  columns: KanbanColumn[]
  setTasks: (tasks: Task[]) => void
  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'project'>) => Promise<Task>
  addTasks: (tasks: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'project'>[]) => Promise<Task[]>
  updateTask: (id: string, task: Partial<Task>) => Promise<void>
  deleteTask: (id: string) => Promise<void>
  fetchTasks: () => Promise<void>
  addColumn: (column: Omit<KanbanColumn, 'id'>) => Promise<void>
  updateColumn: (id: string, column: Partial<KanbanColumn>) => Promise<void>
  deleteColumn: (id: string) => Promise<void>
  fetchColumns: () => Promise<void>
  moveTask: (taskId: string, columnId: string) => Promise<void>
}

// Default columns for new projects
export const DEFAULT_COLUMNS: Omit<KanbanColumn, 'id' | 'projectId'>[] = [
  { name: 'To Do', color: 'bg-gray-100', order: 0 },
  { name: 'In Progress', color: 'bg-blue-100', order: 1 },
  { name: 'Completed', color: 'bg-green-100', order: 2 }
]

export const useTaskStore = create<TaskState>((set, get) => ({
  tasks: [],
  columns: [],

  setTasks: (tasks) => set({ tasks }),

  addTask: async (task) => {
    try {
      const taskData = {
        ...task,
        projectId: task.projectId || null,
        columnId: task.columnId || get().columns.find(col => col.projectId === task.projectId && col.order === 0)?.id
      }

      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(taskData),
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to create task')
      }
      
      const newTask = await response.json()
      set((state) => ({
        tasks: [...state.tasks, newTask]
      }))
      return newTask
    } catch (error) {
      console.error('Error adding task:', error)
      throw error
    }
  },

  addTasks: async (tasks) => {
    try {
      // If only one task, use addTask instead
      if (tasks.length === 1) {
        return [await get().addTask(tasks[0])]
      }

      const createdTasks = await Promise.all(tasks.map(task => {
        const taskData = {
          ...task,
          projectId: task.projectId || null,
          columnId: task.columnId || get().columns.find(col => col.projectId === task.projectId && col.order === 0)?.id
        }

        return fetch('/api/tasks', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(taskData),
        }).then(response => {
          if (!response.ok) {
            throw new Error('Failed to create task')
          }
          return response.json()
        })
      }))

      set((state) => ({
        tasks: [...state.tasks, ...createdTasks]
      }))

      return createdTasks
    } catch (error) {
      console.error('Error adding tasks:', error)
      throw error
    }
  },

  updateTask: async (id, task) => {
    try {
      const response = await fetch(`/api/tasks/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...task,
          projectId: task.projectId || null
        }),
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to update task')
      }
      
      const updatedTask = await response.json()
      set((state) => ({
        tasks: state.tasks.map((t) => 
          t.id === id ? updatedTask : t
        )
      }))
    } catch (error) {
      console.error('Error updating task:', error)
      throw error
    }
  },

  deleteTask: async (id) => {
    try {
      const response = await fetch(`/api/tasks/${id}`, {
        method: 'DELETE'
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to delete task')
      }
      
      set((state) => ({
        tasks: state.tasks.filter((t) => t.id !== id)
      }))
    } catch (error) {
      console.error('Error deleting task:', error)
      throw error
    }
  },

  fetchTasks: async () => {
    try {
      const response = await fetch('/api/tasks')
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to fetch tasks')
      }
      
      const tasks = await response.json()
      
      // Build hierarchical structure
      const tasksMap = new Map<string, Task>(tasks.map((task: Task) => [task.id, { ...task, subtasks: [] }]))
      
      tasks.forEach((task: Task) => {
        if (task.parentId && tasksMap.has(task.parentId)) {
          const parent = tasksMap.get(task.parentId)!
          const childTask = tasksMap.get(task.id)!
          if (parent.subtasks) {
            parent.subtasks.push(childTask)
          }
        }
      })
      
      set({ tasks: Array.from(tasksMap.values()) })
    } catch (error) {
      console.error('Error fetching tasks:', error)
      throw error
    }
  },

  addColumn: async (column) => {
    try {
      const response = await fetch('/api/tasks/columns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...column,
          color: getTailwindClass(column.color)
        }),
      })

      if (!response.ok) throw new Error('Failed to create column')
      
      const newColumn = await response.json()
      set((state) => ({
        columns: [...state.columns, newColumn]
      }))
    } catch (error) {
      console.error('Error adding column:', error)
      throw error
    }
  },

  updateColumn: async (id, column) => {
    try {
      const response = await fetch(`/api/tasks/columns/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...column,
          color: column.color ? getTailwindClass(column.color) : undefined
        }),
      })

      if (!response.ok) throw new Error('Failed to update column')
      
      const updatedColumn = await response.json()
      set((state) => ({
        columns: state.columns.map((c) => 
          c.id === id ? updatedColumn : c
        )
      }))
    } catch (error) {
      console.error('Error updating column:', error)
      throw error
    }
  },

  deleteColumn: async (id) => {
    try {
      const response = await fetch(`/api/tasks/columns/${id}`, {
        method: 'DELETE'
      })

      if (!response.ok) throw new Error('Failed to delete column')
      
      set((state) => ({
        columns: state.columns.filter((c) => c.id !== id)
      }))
    } catch (error) {
      console.error('Error deleting column:', error)
      throw error
    }
  },

  fetchColumns: async () => {
    try {
      const response = await fetch('/api/tasks/columns')
      
      if (!response.ok) throw new Error('Failed to fetch columns')
      
      const columns = await response.json()
      set({ columns })
    } catch (error) {
      console.error('Error fetching columns:', error)
      throw error
    }
  },

  moveTask: async (taskId: string, columnId: string) => {
    try {
      const response = await fetch(`/api/tasks/${taskId}/move`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ columnId }),
      })

      if (!response.ok) throw new Error('Failed to move task')
      
      const updatedTask = await response.json()
      set((state) => ({
        tasks: state.tasks.map((t) => 
          t.id === taskId ? updatedTask : t
        )
      }))
    } catch (error) {
      console.error('Error moving task:', error)
      throw error
    }
  }
})) 