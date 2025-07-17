'use client'

import { useEffect, useState } from 'react'
import { Progress } from '@/components/ui/progress'

interface LoadingProgressProps {
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

export function LoadingProgress({ loadingStates }: LoadingProgressProps) {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const totalSteps = Object.keys(loadingStates).length
    const completedSteps = Object.values(loadingStates).filter(loading => !loading).length
    const newProgress = (completedSteps / totalSteps) * 100
    setProgress(newProgress)
  }, [loadingStates])

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="flex justify-between text-sm text-muted-foreground mb-2">
        <span>Loading...</span>
        <span>{Math.round(progress)}%</span>
      </div>
      <Progress value={progress} className="w-full" />
    </div>
  )
} 