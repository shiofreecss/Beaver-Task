import { create } from 'zustand'

interface Habit {
  id: string
  name: string
  description?: string
  frequency: string
  target: number
  color?: string
  customDays?: number[]
  customPeriod?: string
  streak: number
  completedToday: boolean
  weeklyProgress: boolean[]
  completionRate: number
  createdAt: Date
  updatedAt: Date
}

interface HabitStore {
  habits: Habit[]
  isLoading: boolean
  error: string | null
  fetchHabits: () => Promise<void>
  resetStore: () => void
}

export const useHabitStore = create<HabitStore>((set) => ({
  habits: [],
  isLoading: false,
  error: null,
  fetchHabits: async () => {
    set({ isLoading: true, error: null })
    try {
      const response = await fetch('/api/habits-convex')
      if (!response.ok) throw new Error('Failed to fetch habits')
      const habits = await response.json()
      set({ habits, isLoading: false })
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false })
    }
  },

  resetStore: () => {
    set({
      habits: [],
      isLoading: false,
      error: null
    })
  }
})) 