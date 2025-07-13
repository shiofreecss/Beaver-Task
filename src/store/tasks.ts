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
  createdAt: string
  updatedAt: string
}

interface TaskState {
  tasks: Task[]
  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => void
  updateTask: (id: string, task: Partial<Task>) => void
  deleteTask: (id: string) => void
  getTasksByProject: (projectId: string) => Task[]
}

export const useTaskStore = create<TaskState>((set, get) => ({
  tasks: [],
  
  addTask: (task) => set((state) => ({
    tasks: [...state.tasks, {
      ...task,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }]
  })),

  updateTask: (id, updatedTask) => set((state) => ({
    tasks: state.tasks.map((task) =>
      task.id === id
        ? { ...task, ...updatedTask, updatedAt: new Date().toISOString() }
        : task
    )
  })),

  deleteTask: (id) => set((state) => ({
    tasks: state.tasks.filter((task) => task.id !== id)
  })),

  getTasksByProject: (projectId) => {
    return get().tasks.filter((task) => task.projectId === projectId)
  }
})) 