'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

interface LoadingState {
  tasks: boolean
  projects: boolean
  habits: boolean
  notes: boolean
  organizations: boolean
  pomodoro: boolean
  calendar: boolean
}

interface LoadingManagerContextType {
  loadingStates: LoadingState
  setLoadingState: (key: keyof LoadingState, loading: boolean) => void
  isAnyLoading: boolean
  resetLoadingStates: () => void
}

const LoadingManagerContext = createContext<LoadingManagerContextType | undefined>(undefined)

export function LoadingManagerProvider({ children }: { children: ReactNode }) {
  const [loadingStates, setLoadingStates] = useState<LoadingState>({
    tasks: true,
    projects: true,
    habits: true,
    notes: true,
    organizations: true,
    pomodoro: true,
    calendar: false
  })

  const setLoadingState = (key: keyof LoadingState, loading: boolean) => {
    setLoadingStates(prev => ({ ...prev, [key]: loading }))
  }

  const isAnyLoading = Object.values(loadingStates).some(loading => loading)

  const resetLoadingStates = () => {
    setLoadingStates({
      tasks: false,
      projects: false,
      habits: false,
      notes: false,
      organizations: false,
      pomodoro: false,
      calendar: false
    })
  }

  return (
    <LoadingManagerContext.Provider value={{
      loadingStates,
      setLoadingState,
      isAnyLoading,
      resetLoadingStates
    }}>
      {children}
    </LoadingManagerContext.Provider>
  )
}

export function useLoadingManager() {
  const context = useContext(LoadingManagerContext)
  if (context === undefined) {
    throw new Error('useLoadingManager must be used within a LoadingManagerProvider')
  }
  return context
} 