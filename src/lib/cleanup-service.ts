import { audioService } from './audio-service'
import { pomodoroService } from './pomodoro-service'
import { usePomodoroStore } from '@/store/pomodoro'
import { useTaskStore } from '@/store/tasks'
import { useProjectStore } from '@/store/projects'
import { useHabitStore } from '@/store/habits'
import { useNoteStore } from '@/store/notes'
import { useOrganizationStore } from '@/store/organizations'

class CleanupService {
  private static instance: CleanupService

  private constructor() {}

  static getInstance(): CleanupService {
    if (!CleanupService.instance) {
      CleanupService.instance = new CleanupService()
    }
    return CleanupService.instance
  }

  /**
   * Perform complete cleanup when user logs out
   */
  async performLogoutCleanup(): Promise<void> {
    try {
      console.log('Starting logout cleanup...')
      
      // Stop all audio
      this.stopAllAudio()
      
      // Stop all timers
      this.stopAllTimers()
      
      // Clear all stores
      this.clearAllStores()
      
      // Clear all storage
      this.clearAllStorage()
      
      console.log('Logout cleanup completed successfully')
    } catch (error) {
      console.error('Error during logout cleanup:', error)
      // Don't throw - we want logout to continue even if cleanup fails
    }
  }

  /**
   * Stop all audio playback
   */
  private stopAllAudio(): void {
    try {
      if (audioService) {
        audioService.stop()
        console.log('Audio stopped')
      }
    } catch (error) {
      console.error('Error stopping audio:', error)
    }
  }

  /**
   * Stop all active timers
   */
  private stopAllTimers(): void {
    try {
      if (pomodoroService) {
        // Reset the pomodoro timer
        pomodoroService.resetTimer(0)
        console.log('Timers stopped')
      }
    } catch (error) {
      console.error('Error stopping timers:', error)
    }
  }

  /**
   * Clear all Zustand stores
   */
  private clearAllStores(): void {
    try {
      // Reset all stores to their initial state
      usePomodoroStore.getState().resetStore()
      useTaskStore.getState().resetStore?.()
      useProjectStore.getState().resetStore?.()
      useHabitStore.getState().resetStore?.()
      useNoteStore.getState().resetStore?.()
      useOrganizationStore.getState().resetStore?.()
      
      console.log('All stores reset')
    } catch (error) {
      console.error('Error clearing stores:', error)
    }
  }

  /**
   * Clear all browser storage
   */
  private clearAllStorage(): void {
    try {
      // Clear localStorage
      if (typeof window !== 'undefined') {
        localStorage.clear()
        sessionStorage.clear()
        
        // Clear specific app storage
        const keysToRemove = [
          'pomodoro-storage',
          'tasks-storage',
          'projects-storage',
          'habits-storage',
          'notes-storage',
          'organizations-storage',
          'pomodoro-selected-music',
          'pomodoro-music-volume'
        ]
        
        keysToRemove.forEach(key => {
          try {
            localStorage.removeItem(key)
            sessionStorage.removeItem(key)
          } catch (e) {
            // Ignore errors for individual keys
          }
        })
        
        console.log('Storage cleared')
      }
    } catch (error) {
      console.error('Error clearing storage:', error)
    }
  }

  /**
   * Cleanup on page unload (for browser close/refresh)
   */
  setupPageUnloadCleanup(): (() => void) | undefined {
    if (typeof window !== 'undefined') {
      const handleBeforeUnload = () => {
        this.stopAllAudio()
        this.stopAllTimers()
      }

      window.addEventListener('beforeunload', handleBeforeUnload)
      
      // Cleanup function to remove listener
      return () => {
        window.removeEventListener('beforeunload', handleBeforeUnload)
      }
    }
    return undefined
  }
}

export const cleanupService = CleanupService.getInstance() 