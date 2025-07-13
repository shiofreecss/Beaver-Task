import { create } from 'zustand'

export interface Organization {
  id: string
  name: string
  description?: string
  color: string
  createdAt: string
  updatedAt: string
}

interface OrganizationState {
  organizations: Organization[]
  addOrganization: (organization: Omit<Organization, 'id' | 'createdAt' | 'updatedAt'>) => void
  updateOrganization: (id: string, organization: Partial<Organization>) => void
  deleteOrganization: (id: string) => void
  getOrganizationById: (id: string) => Organization | undefined
}

export const useOrganizationStore = create<OrganizationState>((set, get) => ({
  organizations: [],
  
  addOrganization: (organization) => set((state) => ({
    organizations: [...state.organizations, {
      ...organization,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }]
  })),

  updateOrganization: (id, updatedOrganization) => set((state) => ({
    organizations: state.organizations.map((organization) =>
      organization.id === id
        ? { ...organization, ...updatedOrganization, updatedAt: new Date().toISOString() }
        : organization
    )
  })),

  deleteOrganization: (id) => set((state) => ({
    organizations: state.organizations.filter((organization) => organization.id !== id)
  })),

  getOrganizationById: (id) => {
    return get().organizations.find((organization) => organization.id === id)
  }
})) 