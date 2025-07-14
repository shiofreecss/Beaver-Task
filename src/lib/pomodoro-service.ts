import { usePomodoroStore } from '@/store/pomodoro'

class PomodoroService {
  private static instance: PomodoroService
  private worker: Worker | null = null
  private isInitialized = false

  private constructor() {}

  static getInstance(): PomodoroService {
    if (!PomodoroService.instance) {
      PomodoroService.instance = new PomodoroService()
    }
    return PomodoroService.instance
  }

  initialize() {
    if (this.isInitialized) return

    if (typeof window !== 'undefined') {
      this.worker = new Worker(new URL('./pomodoro-worker.ts', import.meta.url))
      
      this.worker.onmessage = (e) => {
        const { type, payload } = e.data
        const store = usePomodoroStore.getState()
        
        switch (type) {
          case 'TICK':
            store.updateTimeLeft(payload.timeLeft)
            break
          case 'COMPLETE':
            store.completeSession()
            break
        }
      }

      // Sync with store state
      const { activeTimer } = usePomodoroStore.getState()
      if (activeTimer?.isActive) {
        this.worker.postMessage({
          type: 'SYNC',
          payload: { timeLeft: activeTimer.timeLeft }
        })
        this.worker.postMessage({ type: 'RESUME' })
      }

      this.isInitialized = true
    }
  }

  startTimer(timeLeft: number) {
    this.worker?.postMessage({
      type: 'START',
      payload: { timeLeft }
    })
  }

  pauseTimer() {
    this.worker?.postMessage({ type: 'PAUSE' })
  }

  resumeTimer() {
    this.worker?.postMessage({ type: 'RESUME' })
  }

  resetTimer(timeLeft: number) {
    this.worker?.postMessage({
      type: 'RESET',
      payload: { timeLeft }
    })
  }

  syncTimer(timeLeft: number) {
    this.worker?.postMessage({
      type: 'SYNC',
      payload: { timeLeft }
    })
  }
}

export const pomodoroService = PomodoroService.getInstance() 