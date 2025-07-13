import { create } from 'zustand'

interface PomodoroSession {
  id: string
  duration: number // duration in minutes
  type: 'FOCUS' | 'SHORT_BREAK' | 'LONG_BREAK'
  taskId?: string | null
  startTime: Date
  endTime?: Date | null
  completed: boolean
  createdAt: Date
  updatedAt: Date
}

interface PomodoroStore {
  sessions: PomodoroSession[]
  isLoading: boolean
  error: string | null
  fetchSessions: () => Promise<void>
  getTodayFocusTime: () => number // Returns focus time in hours
}

export const usePomodoroStore = create<PomodoroStore>((set, get) => ({
  sessions: [],
  isLoading: false,
  error: null,
  fetchSessions: async () => {
    set({ isLoading: true, error: null })
    try {
      const response = await fetch('/api/pomodoro')
      if (!response.ok) throw new Error('Failed to fetch pomodoro sessions')
      const sessions = await response.json()
      set({ sessions, isLoading: false })
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false })
    }
  },
  getTodayFocusTime: () => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    return get().sessions
      .filter(session => 
        session.type === 'FOCUS' &&
        session.completed &&
        new Date(session.startTime) >= today
      )
      .reduce((total, session) => {
        // Convert minutes to hours
        return total + (session.duration / 60)
      }, 0)
  }
})) 