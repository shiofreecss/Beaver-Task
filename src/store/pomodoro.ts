import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface PomodoroSession {
  id: string
  duration: number // duration in minutes
  type: 'FOCUS' | 'SHORT_BREAK' | 'LONG_BREAK'
  taskId?: string | null
  projectId?: string | null
  startTime: Date
  endTime?: Date | null
  completed: boolean
  createdAt: Date
  updatedAt: Date
}

interface ActiveTimer {
  type: 'FOCUS' | 'SHORT_BREAK' | 'LONG_BREAK'
  timeLeft: number // in seconds
  isActive: boolean
  sessionId?: string
  taskId?: string
  projectId?: string
  startTime?: number // timestamp when timer was started
  pausedTime?: number // timestamp when timer was paused
}

interface PomodoroStore {
  sessions: PomodoroSession[]
  activeTimer: ActiveTimer | null
  isLoading: boolean
  error: string | null
  
  // Timer actions
  startTimer: (type: 'FOCUS' | 'SHORT_BREAK' | 'LONG_BREAK', duration: number, taskId?: string, projectId?: string) => Promise<void>
  pauseTimer: () => Promise<void>
  resumeTimer: () => void
  resetTimer: () => void
  updateTimeLeft: (timeLeft: number) => void
  completeSession: () => Promise<void>
  
  // Session actions
  fetchSessions: () => Promise<void>
  deleteSession: (id: string) => Promise<void>
  getTodayFocusTime: () => number // Returns focus time in hours
  
  // Store management
  resetStore: () => void
}

// Helper to get session duration in seconds
const getSessionDuration = (type: 'FOCUS' | 'SHORT_BREAK' | 'LONG_BREAK'): number => {
  const durations = {
    'FOCUS': 25 * 60,
    'SHORT_BREAK': 5 * 60,
    'LONG_BREAK': 15 * 60
  }
  return durations[type]
}

export const usePomodoroStore = create<PomodoroStore>()(
  persist(
    (set, get) => ({
      sessions: [],
      activeTimer: null,
      isLoading: false,
      error: null,

      startTimer: async (type, duration, taskId, projectId) => {
        set({ isLoading: true, error: null })
        try {
          // Convert seconds to minutes for Convex
          const durationInMinutes = Math.floor(duration / 60)
          
          const response = await fetch('/api/pomodoro-convex', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              duration: durationInMinutes,
              type,
              taskId: taskId || undefined,
              projectId: projectId || undefined
            })
          })
          
          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}))
            throw new Error(errorData.error || 'Failed to start session')
          }
          
          const session = await response.json()
          
          set(state => ({
            sessions: [session, ...state.sessions],
            activeTimer: {
              type,
              timeLeft: duration,
              isActive: true,
              sessionId: session.id,
              taskId,
              projectId,
              startTime: Date.now()
            },
            isLoading: false
          }))
        } catch (error) {
          console.error('Error starting timer:', error)
          set({ 
            error: (error as Error).message, 
            isLoading: false 
          })
          throw error // Re-throw to allow UI to handle
        }
      },

      pauseTimer: async () => {
        const { activeTimer } = get()
        if (!activeTimer?.isActive || !activeTimer.sessionId) return

        set(state => ({
          activeTimer: state.activeTimer ? {
            ...state.activeTimer,
            isActive: false,
            pausedTime: Date.now()
          } : null
        }))

        try {
          const response = await fetch('/api/pomodoro-convex', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              id: activeTimer.sessionId,
              completed: false
            })
          })

          if (!response.ok) {
            console.error('Failed to pause session:', response.statusText)
          }
        } catch (error) {
          console.error('Failed to pause session:', error)
        }
      },

      resumeTimer: () => {
        set(state => ({
          activeTimer: state.activeTimer ? {
            ...state.activeTimer,
            isActive: true,
            startTime: state.activeTimer.startTime! + (Date.now() - (state.activeTimer.pausedTime || Date.now()))
          } : null
        }))
      },

      resetTimer: () => {
        const { activeTimer } = get()
        if (!activeTimer) return
        
        set(state => ({
          activeTimer: {
            ...state.activeTimer!,
            timeLeft: getSessionDuration(state.activeTimer!.type),
            isActive: false,
            startTime: undefined,
            pausedTime: undefined
          }
        }))
      },

      updateTimeLeft: (timeLeft: number) => {
        set(state => ({
          activeTimer: state.activeTimer ? {
            ...state.activeTimer,
            timeLeft
          } : null
        }))
      },

      completeSession: async () => {
        const { activeTimer } = get()
        if (!activeTimer?.sessionId) return

        try {
          const response = await fetch('/api/pomodoro-convex', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              id: activeTimer.sessionId,
              completed: true
            })
          })

          if (response.status === 404) {
            // Session not found, just clear the active timer
            set({ activeTimer: null })
            return
          }

          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}))
            throw new Error(errorData.error || 'Failed to complete session')
          }
          
          const completedSession = await response.json()

          set(state => ({
            sessions: [
              completedSession,
              ...state.sessions.filter(s => s.id !== completedSession.id)
            ],
            activeTimer: null
          }))
        } catch (error) {
          console.error('Failed to complete session:', error)
          // Clear active timer on error to prevent stuck state
          set({ activeTimer: null })
          throw error // Re-throw to allow UI to handle
        }
      },

      fetchSessions: async () => {
        set({ isLoading: true, error: null })
        try {
          const response = await fetch('/api/pomodoro-convex')
          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}))
            throw new Error(errorData.error || 'Failed to fetch pomodoro sessions')
          }
          const sessions = await response.json()
          set({ sessions, isLoading: false })
        } catch (error) {
          console.error('Error fetching sessions:', error)
          set({ error: (error as Error).message, isLoading: false })
        }
      },

      deleteSession: async (id: string) => {
        try {
          const response = await fetch(`/api/pomodoro-convex?id=${id}`, {
            method: 'DELETE'
          })
          
          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}))
            throw new Error(errorData.error || 'Failed to delete session')
          }
          
          set(state => ({
            sessions: state.sessions.filter(session => session.id !== id)
          }))
        } catch (error) {
          console.error('Failed to delete session:', error)
          set({ error: (error as Error).message })
          throw error // Re-throw to allow UI to handle
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
            return total + (session.duration / 60)
          }, 0)
      },

      resetStore: () => {
        set({
          sessions: [],
          activeTimer: null,
          isLoading: false,
          error: null
        })
      }
    }),
    {
      name: 'pomodoro-storage',
      partialize: (state) => ({
        activeTimer: state.activeTimer
      })
    }
  )
) 