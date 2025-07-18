import { create } from 'zustand'
import { getTailwindClass } from '@/lib/utils'

export interface Project {
  id: string
  name: string
  description?: string
  status: 'ACTIVE' | 'PLANNING' | 'IN_PROGRESS' | 'ON_HOLD' | 'COMPLETED'
  organizationId?: string | null
  color: string
  dueDate?: string
  website?: string
  categories?: string[]
  documents?: string[]
  createdAt: string
  updatedAt: string
}

export const PROJECT_STATUS_COLORS = {
  'ACTIVE': 'bg-blue-500',
  'PLANNING': 'bg-yellow-500',
  'IN_PROGRESS': 'bg-purple-500',
  'ON_HOLD': 'bg-gray-500',
  'COMPLETED': 'bg-green-500'
} as const

export const PROJECT_STATUS_LABELS = {
  'ACTIVE': 'Active',
  'PLANNING': 'Planning',
  'IN_PROGRESS': 'In Progress',
  'ON_HOLD': 'On Hold',
  'COMPLETED': 'Completed'
} as const

interface ProjectState {
  projects: Project[]
  lastFetchTime: number | null
  setProjects: (projects: Project[]) => void
  addProject: (project: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>
  updateProject: (id: string, project: Partial<Project>) => Promise<void>
  deleteProject: (id: string) => Promise<void>
  getProjectById: (id: string) => Project | undefined
  fetchProjects: (force?: boolean) => Promise<void>
  resetStore: () => void
}

// Cache duration: 5 minutes
const CACHE_DURATION = 5 * 60 * 1000

export const useProjectStore = create<ProjectState>((set, get) => ({
  projects: [],
  lastFetchTime: null,

  setProjects: (projects) => set({ projects, lastFetchTime: Date.now() }),

  addProject: async (project) => {
    try {
      const response = await fetch('/api/projects-convex', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...project,
          color: getTailwindClass(project.color),
          website: project.website,
          categories: project.categories,
          documents: project.documents
        }),
      })
      
      if (!response.ok) throw new Error('Failed to create project')
      
      const newProject = await response.json()
      set((state) => ({
        projects: [...state.projects, newProject],
        lastFetchTime: Date.now()
      }))
    } catch (error) {
      console.error('Error adding project:', error)
      throw error
    }
  },

  updateProject: async (id, project) => {
    try {
      const response = await fetch('/api/projects-convex', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id,
          ...project,
          color: project.color ? getTailwindClass(project.color) : undefined,
          website: project.website,
          categories: project.categories,
          documents: project.documents
        }),
      })
      
      if (!response.ok) {
        const errorText = await response.text()
        console.error('API Error Response:', response.status, errorText)
        throw new Error(`Failed to update project: ${response.status} ${errorText}`)
      }
      
      const updatedProject = await response.json()
      set((state) => ({
        projects: state.projects.map((p) => 
          p.id === id ? updatedProject : p
        ),
        lastFetchTime: Date.now()
      }))
    } catch (error) {
      console.error('Error updating project:', error)
      throw error
    }
  },

  deleteProject: async (id) => {
    try {
      // Get the current user's Convex ID first
      const userResponse = await fetch('/api/auth/session')
      if (!userResponse.ok) {
        throw new Error('Failed to get user session')
      }
      const session = await userResponse.json()
      if (!session?.user?.id) {
        throw new Error('No user session found')
      }

      const response = await fetch('/api/projects-convex', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId: id })
      })
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => null)
        throw new Error(errorData?.error || 'Failed to delete project')
      }
      
      set((state) => ({
        projects: state.projects.filter((p) => p.id !== id),
        lastFetchTime: Date.now()
      }))
    } catch (error) {
      console.error('Error deleting project:', error)
      throw error
    }
  },

  getProjectById: (id) => {
    return get().projects.find((p) => p.id === id)
  },

  fetchProjects: async (force = false) => {
    const state = get()
    
    // Check if we need to fetch (no data, forced, or cache expired)
    const needsFetch = force || 
                      !state.lastFetchTime || 
                      (Date.now() - state.lastFetchTime) > CACHE_DURATION ||
                      state.projects.length === 0

    if (!needsFetch) {
      console.log('Using cached projects data')
      return
    }

    try {
      console.log('Fetching projects from API')
      const response = await fetch('/api/projects-convex')
      
      if (!response.ok) throw new Error('Failed to fetch projects')
      
      const projects = await response.json()
      set({ projects, lastFetchTime: Date.now() })
    } catch (error) {
      console.error('Error fetching projects:', error)
      throw error
    }
  },

  resetStore: () => {
    set({
      projects: [],
      lastFetchTime: null
    })
  }
})) 