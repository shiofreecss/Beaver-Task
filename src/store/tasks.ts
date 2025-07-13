import { create } from 'zustand'

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

export interface Task {
  id: string
  title: string
  description?: string
  status: 'TODO' | 'IN_PROGRESS' | 'COMPLETED'
  priority: PriorityLevel
  severity: SeverityLevel
  dueDate?: string
  projectId?: string
  project?: {
    id: string
    name: string
  }
  createdAt: string
  updatedAt: string
}

interface TaskState {
  tasks: Task[]
  setTasks: (tasks: Task[]) => void
  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'project'>) => Promise<void>
  updateTask: (id: string, task: Partial<Task>) => Promise<void>
  deleteTask: (id: string) => Promise<void>
  fetchTasks: () => Promise<void>
}

export const useTaskStore = create<TaskState>((set, get) => ({
  tasks: [],

  setTasks: (tasks) => set({ tasks }),

  addTask: async (task) => {
    try {
      // Convert empty projectId to null
      const taskData = {
        ...task,
        projectId: task.projectId || null
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
    } catch (error) {
      console.error('Error adding task:', error)
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
      set({ tasks })
    } catch (error) {
      console.error('Error fetching tasks:', error)
      throw error
    }
  }
})) 