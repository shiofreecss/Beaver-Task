import { create } from 'zustand'

export interface Project {
  id: string
  name: string
  description?: string
  status: 'planning' | 'active' | 'completed' | 'on_hold'
  dueDate?: string
  color: string
  progress: number
  organizationId?: string
  createdAt: string
  updatedAt: string
}

interface ProjectState {
  projects: Project[]
  addProject: (project: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>) => void
  updateProject: (id: string, project: Partial<Project>) => void
  deleteProject: (id: string) => void
  getProjectById: (id: string) => Project | undefined
  getProjectsByOrganization: (organizationId: string) => Project[]
}

export const useProjectStore = create<ProjectState>((set, get) => ({
  projects: [],
  
  addProject: (project) => set((state) => ({
    projects: [...state.projects, {
      ...project,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }]
  })),

  updateProject: (id, updatedProject) => set((state) => ({
    projects: state.projects.map((project) =>
      project.id === id
        ? { ...project, ...updatedProject, updatedAt: new Date().toISOString() }
        : project
    )
  })),

  deleteProject: (id) => set((state) => ({
    projects: state.projects.filter((project) => project.id !== id)
  })),

  getProjectById: (id) => {
    return get().projects.find((project) => project.id === id)
  },

  getProjectsByOrganization: (organizationId) => {
    return get().projects.filter((project) => project.organizationId === organizationId)
  }
})) 