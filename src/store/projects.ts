import { create } from 'zustand'
import { getTailwindClass } from '@/lib/utils'

export interface Project {
  id: string
  name: string
  description?: string
  status: 'ACTIVE' | 'PLANNING' | 'ON_HOLD' | 'COMPLETED'
  organizationId: string
  color: string
  dueDate?: string
  createdAt: string
  updatedAt: string
}

export const PROJECT_STATUS_COLORS = {
  'ACTIVE': 'bg-blue-500',
  'PLANNING': 'bg-yellow-500',
  'ON_HOLD': 'bg-gray-500',
  'COMPLETED': 'bg-green-500'
} as const

export const PROJECT_STATUS_LABELS = {
  'ACTIVE': 'Active',
  'PLANNING': 'Planning',
  'ON_HOLD': 'On Hold',
  'COMPLETED': 'Completed'
} as const

interface ProjectState {
  projects: Project[]
  setProjects: (projects: Project[]) => void
  addProject: (project: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>
  updateProject: (id: string, project: Partial<Project>) => Promise<void>
  deleteProject: (id: string) => Promise<void>
  getProjectById: (id: string) => Project | undefined
  fetchProjects: () => Promise<void>
}

export const useProjectStore = create<ProjectState>((set, get) => ({
  projects: [],

  setProjects: (projects) => set({ projects }),

  addProject: async (project) => {
    try {
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...project,
          color: getTailwindClass(project.color)
        }),
      })
      
      if (!response.ok) throw new Error('Failed to create project')
      
      const newProject = await response.json()
      set((state) => ({
        projects: [...state.projects, newProject]
      }))
    } catch (error) {
      console.error('Error adding project:', error)
      throw error
    }
  },

  updateProject: async (id, project) => {
    try {
      const response = await fetch(`/api/projects/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...project,
          color: project.color ? getTailwindClass(project.color) : undefined
        }),
      })
      
      if (!response.ok) throw new Error('Failed to update project')
      
      const updatedProject = await response.json()
      set((state) => ({
        projects: state.projects.map((p) => 
          p.id === id ? updatedProject : p
        )
      }))
    } catch (error) {
      console.error('Error updating project:', error)
      throw error
    }
  },

  deleteProject: async (id) => {
    try {
      const response = await fetch(`/api/projects?id=${id}`, {
        method: 'DELETE'
      })
      
      if (!response.ok) throw new Error('Failed to delete project')
      
      set((state) => ({
        projects: state.projects.filter((p) => p.id !== id)
      }))
    } catch (error) {
      console.error('Error deleting project:', error)
      throw error
    }
  },

  getProjectById: (id) => {
    return get().projects.find((p) => p.id === id)
  },

  fetchProjects: async () => {
    try {
      const response = await fetch('/api/projects')
      
      if (!response.ok) throw new Error('Failed to fetch projects')
      
      const projects = await response.json()
      set({ projects })
    } catch (error) {
      console.error('Error fetching projects:', error)
      throw error
    }
  }
})) 