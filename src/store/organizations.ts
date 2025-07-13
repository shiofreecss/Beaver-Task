import { create } from 'zustand'
import { getTailwindClass } from '@/lib/utils'

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
  setOrganizations: (organizations: Organization[]) => void
  addOrganization: (organization: Omit<Organization, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>
  updateOrganization: (id: string, organization: Partial<Organization>) => Promise<void>
  deleteOrganization: (id: string) => Promise<void>
  getOrganizationById: (id: string) => Organization | undefined
  fetchOrganizations: () => Promise<void>
}

export const useOrganizationStore = create<OrganizationState>((set, get) => ({
  organizations: [],

  setOrganizations: (organizations) => set({ organizations }),

  addOrganization: async (organization) => {
    try {
      const response = await fetch('/api/organizations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...organization,
          color: getTailwindClass(organization.color)
        }),
      })
      
      if (!response.ok) throw new Error('Failed to create organization')
      
      const newOrg = await response.json()
      set((state) => ({
        organizations: [...state.organizations, newOrg]
      }))
    } catch (error) {
      console.error('Error adding organization:', error)
      throw error
    }
  },

  updateOrganization: async (id, updatedOrganization) => {
    try {
      const response = await fetch('/api/organizations', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id,
          ...updatedOrganization,
          color: updatedOrganization.color ? getTailwindClass(updatedOrganization.color) : undefined
        }),
      })
      
      if (!response.ok) throw new Error('Failed to update organization')
      
      const updated = await response.json()
      set((state) => ({
        organizations: state.organizations.map((org) =>
          org.id === id ? updated : org
        )
      }))
    } catch (error) {
      console.error('Error updating organization:', error)
      throw error
    }
  },

  deleteOrganization: async (id) => {
    try {
      const response = await fetch(`/api/organizations?id=${id}`, {
        method: 'DELETE',
      })
      
      if (!response.ok) throw new Error('Failed to delete organization')
      
      set((state) => ({
        organizations: state.organizations.filter((org) => org.id !== id)
      }))
    } catch (error) {
      console.error('Error deleting organization:', error)
      throw error
    }
  },

  getOrganizationById: (id) => {
    return get().organizations.find((organization) => organization.id === id)
  },

  fetchOrganizations: async () => {
    try {
      const response = await fetch('/api/organizations')
      if (!response.ok) throw new Error('Failed to fetch organizations')
      const organizations = await response.json()
      set({ organizations })
    } catch (error) {
      console.error('Error fetching organizations:', error)
      throw error
    }
  }
})) 