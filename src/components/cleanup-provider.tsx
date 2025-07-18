'use client'

import { useEffect } from 'react'
import { cleanupService } from '@/lib/cleanup-service'

interface CleanupProviderProps {
  children: React.ReactNode
}

export function CleanupProvider({ children }: CleanupProviderProps) {
  useEffect(() => {
    // Setup page unload cleanup
    const cleanup = cleanupService.setupPageUnloadCleanup()
    
    // Cleanup function to remove event listeners
    return () => {
      if (cleanup) {
        cleanup()
      }
    }
  }, [])

  return <>{children}</>
} 