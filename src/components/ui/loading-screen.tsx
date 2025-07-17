'use client'

import { Loader2, CheckCircle } from 'lucide-react'
import { useState, useEffect } from 'react'
import { LoadingProgress } from './loading-progress'

interface LoadingStep {
  id: string
  label: string
  completed: boolean
  loading: boolean
}

interface LoadingScreenProps {
  onComplete: () => void
  loadingStates: {
    tasks: boolean
    projects: boolean
    habits: boolean
    notes: boolean
    organizations: boolean
    pomodoro: boolean
    calendar: boolean
  }
}

export function LoadingScreen({ onComplete, loadingStates }: LoadingScreenProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [steps, setSteps] = useState<LoadingStep[]>([
    { id: 'auth', label: 'Authenticating...', completed: true, loading: false },
    { id: 'tasks', label: 'Loading tasks...', completed: false, loading: true },
    { id: 'projects', label: 'Loading projects...', completed: false, loading: true },
    { id: 'habits', label: 'Loading habits...', completed: false, loading: true },
    { id: 'notes', label: 'Loading notes...', completed: false, loading: true },
    { id: 'organizations', label: 'Loading organizations...', completed: false, loading: true },
    { id: 'pomodoro', label: 'Loading pomodoro sessions...', completed: false, loading: true },
    { id: 'calendar', label: 'Loading calendar...', completed: false, loading: true },
    { id: 'complete', label: 'Ready!', completed: false, loading: false },
  ])

  useEffect(() => {
    console.log('Loading screen states:', loadingStates)
    
    // Update steps based on actual loading states
    const updatedSteps = steps.map(step => {
      switch (step.id) {
        case 'tasks':
          return { ...step, completed: !loadingStates.tasks, loading: loadingStates.tasks }
        case 'projects':
          return { ...step, completed: !loadingStates.projects, loading: loadingStates.projects }
        case 'habits':
          return { ...step, completed: !loadingStates.habits, loading: loadingStates.habits }
        case 'notes':
          return { ...step, completed: !loadingStates.notes, loading: loadingStates.notes }
        case 'organizations':
          return { ...step, completed: !loadingStates.organizations, loading: loadingStates.organizations }
        case 'pomodoro':
          return { ...step, completed: !loadingStates.pomodoro, loading: loadingStates.pomodoro }
        case 'calendar':
          return { ...step, completed: !loadingStates.calendar, loading: loadingStates.calendar }
        default:
          return step
      }
    })

    setSteps(updatedSteps)

    // Check if all data is loaded
    const allLoaded = !Object.values(loadingStates).some(loading => loading)
    console.log('All loaded:', allLoaded, 'Loading states:', loadingStates)
    
    if (allLoaded) {
      console.log('All data loaded, completing loading screen')
      // Mark complete step as done
      const finalSteps = updatedSteps.map(step => 
        step.id === 'complete' ? { ...step, completed: true, loading: false } : step
      )
      setSteps(finalSteps)
      
      // Small delay before completing
      setTimeout(() => {
        console.log('Calling onComplete')
        onComplete()
      }, 500)
    }
  }, [loadingStates, onComplete])

  // Find current step (first incomplete step)
  const currentStepIndex = steps.findIndex(step => !step.completed)
  const currentStepId = currentStepIndex >= 0 ? steps[currentStepIndex].id : 'complete'

  return (
    <div className="fixed inset-0 bg-background flex items-center justify-center z-50">
      <div className="text-center space-y-8">
        {/* Logo/Icon */}
        <div className="flex justify-center">
          <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center">
            <span className="text-2xl">🦫</span>
          </div>
        </div>
        
        {/* Title */}
        <div>
          <h1 className="text-2xl font-bold text-foreground">Beaver Task</h1>
          <p className="text-muted-foreground mt-2">Loading your workspace...</p>
        </div>

        {/* Loading Steps */}
        <div className="space-y-3 max-w-md mx-auto">
          {steps.map((step, index) => (
            <div
              key={step.id}
              className={`flex items-center space-x-3 transition-all duration-300 ${
                step.completed || step.loading ? 'opacity-100' : 'opacity-50'
              }`}
            >
              <div className="flex-shrink-0">
                {step.completed ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : step.loading ? (
                  <Loader2 className="h-5 w-5 text-primary animate-spin" />
                ) : (
                  <div className="h-5 w-5 rounded-full border-2 border-muted-foreground" />
                )}
              </div>
              <span
                className={`text-sm ${
                  step.completed || step.loading ? 'text-foreground' : 'text-muted-foreground'
                }`}
              >
                {step.label}
              </span>
            </div>
          ))}
        </div>

        {/* Progress Bar */}
        <LoadingProgress loadingStates={loadingStates} />
      </div>
    </div>
  )
} 