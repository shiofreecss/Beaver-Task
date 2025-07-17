class AudioService {
  private static instance: AudioService
  private audio: HTMLAudioElement | null = null
  private isInitialized = false

  private constructor() {}

  static getInstance(): AudioService {
    if (!AudioService.instance) {
      AudioService.instance = new AudioService()
    }
    return AudioService.instance
  }

  initialize() {
    if (this.isInitialized) return

    if (typeof window !== 'undefined') {
      this.audio = new Audio()
      this.audio.loop = true
      this.audio.volume = 0.5
      this.isInitialized = true
    }
  }

  setMusicSource(src: string) {
    if (this.audio) {
      this.audio.src = src
    }
  }

  async play(): Promise<void> {
    if (this.audio) {
      try {
        await this.audio.play()
      } catch (error) {
        console.error('Failed to play audio:', error)
        throw error
      }
    }
  }

  pause() {
    if (this.audio) {
      this.audio.pause()
    }
  }

  stop() {
    if (this.audio) {
      this.audio.pause()
      this.audio.currentTime = 0
    }
  }

  setVolume(volume: number) {
    if (this.audio) {
      this.audio.volume = Math.max(0, Math.min(1, volume))
    }
  }

  isPlaying(): boolean {
    return this.audio ? !this.audio.paused : false
  }
}

export const audioService = AudioService.getInstance() 