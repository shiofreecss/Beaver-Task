import { create } from 'zustand'
import { getTailwindClass } from '@/lib/utils'

export interface Organization {
  id: string
  name: string
  description?: string
  color: string
  createdAt: string
  updatedAt: string
  projects?: Array<{
    id: string
    name: string
    status: string
  }>
}

interface OrganizationState {
  organizations: Organization[]
  lastFetchTime: number | null
  setOrganizations: (organizations: Organization[]) => void
  addOrganization: (organization: Omit<Organization, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>
  updateOrganization: (id: string, organization: Partial<Organization>) => Promise<void>
  deleteOrganization: (id: string) => Promise<void>
  getOrganizationById: (id: string) => Organization | undefined
  fetchOrganizations: (force?: boolean) => Promise<void>
}

// Cache duration: 5 minutes
const CACHE_DURATION = 5 * 60 * 1000

export const useOrganizationStore = create<OrganizationState>((set, get) => ({
  organizations: [],
  lastFetchTime: null,

  setOrganizations: (organizations) => set({ organizations, lastFetchTime: Date.now() }),

  addOrganization: async (organization) => {
    try {
      const response = await fetch('/api/organizations-convex', {
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
        organizations: [...state.organizations, newOrg],
        lastFetchTime: Date.now()
      }))
    } catch (error) {
      console.error('Error adding organization:', error)
      throw error
    }
  },

  updateOrganization: async (id, updatedOrganization) => {
    try {
      const response = await fetch('/api/organizations-convex', {
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
        ),
        lastFetchTime: Date.now()
      }))
    } catch (error) {
      console.error('Error updating organization:', error)
      throw error
    }
  },

  deleteOrganization: async (id) => {
    try {
      const response = await fetch(`/api/organizations-convex?id=${id}`, {
        method: 'DELETE',
      })
      
      if (!response.ok) throw new Error('Failed to delete organization')
      
      set((state) => ({
        organizations: state.organizations.filter((org) => org.id !== id),
        lastFetchTime: Date.now()
      }))
    } catch (error) {
      console.error('Error deleting organization:', error)
      throw error
    }
  },

  getOrganizationById: (id) => {
    return get().organizations.find((organization) => organization.id === id)
  },

  fetchOrganizations: async (force = false) => {
    const state = get()
    
    // Check if we need to fetch (no data, forced, or cache expired)
    const needsFetch = force || 
                      !state.lastFetchTime || 
                      (Date.now() - state.lastFetchTime) > CACHE_DURATION ||
                      state.organizations.length === 0

    if (!needsFetch) {
      console.log('Using cached organizations data')
      return
    }

    try {
      console.log('Fetching organizations from API')
      const response = await fetch('/api/organizations-convex')
      if (!response.ok) throw new Error('Failed to fetch organizations')
      const organizations = await response.json()
      set({ organizations, lastFetchTime: Date.now() })
    } catch (error) {
      console.error('Error fetching organizations:', error)
      throw error
    }
  }
})) 