// Unified data loader for dashboard performance optimization
export interface DashboardData {
  tasks: any[]
  projects: any[]
  habits: any[]
  pomodoroSessions: any[]
  organizations: any[]
  notes: any[]
}

export class DataLoader {
  private static cache = new Map<string, { data: any; timestamp: number }>()
  private static CACHE_DURATION = 30000 // 30 seconds

  static async fetchDashboardData(): Promise<DashboardData> {
    const cacheKey = 'dashboard-data'
    const cached = this.cache.get(cacheKey)
    
    // Return cached data if still valid
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      return cached.data
    }

    try {
      // Fetch all data in parallel with timeout
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 second timeout

      const [tasksRes, projectsRes, habitsRes, pomodoroRes, organizationsRes, notesRes] = await Promise.allSettled([
        fetch('/api/tasks-convex', { signal: controller.signal }),
        fetch('/api/projects-convex', { signal: controller.signal }),
        fetch('/api/habits-convex', { signal: controller.signal }),
        fetch('/api/pomodoro-convex', { signal: controller.signal }),
        fetch('/api/organizations-convex', { signal: controller.signal }),
        fetch('/api/notes-convex', { signal: controller.signal })
      ])

      clearTimeout(timeoutId)

      // Process results with error handling
      const data: DashboardData = {
        tasks: [],
        projects: [],
        habits: [],
        pomodoroSessions: [],
        organizations: [],
        notes: []
      }

      if (tasksRes.status === 'fulfilled' && tasksRes.value.ok) {
        data.tasks = await tasksRes.value.json()
      }

      if (projectsRes.status === 'fulfilled' && projectsRes.value.ok) {
        data.projects = await projectsRes.value.json()
      }

      if (habitsRes.status === 'fulfilled' && habitsRes.value.ok) {
        data.habits = await habitsRes.value.json()
      }

      if (pomodoroRes.status === 'fulfilled' && pomodoroRes.value.ok) {
        data.pomodoroSessions = await pomodoroRes.value.json()
      }

      if (organizationsRes.status === 'fulfilled' && organizationsRes.value.ok) {
        data.organizations = await organizationsRes.value.json()
      }

      if (notesRes.status === 'fulfilled' && notesRes.value.ok) {
        data.notes = await notesRes.value.json()
      }

      // Cache the successful data
      this.cache.set(cacheKey, { data, timestamp: Date.now() })

      return data
    } catch (error) {
      console.error('Dashboard data fetch error:', error)
      
      // Return cached data if available, even if expired
      const cached = this.cache.get(cacheKey)
      if (cached) {
        console.log('Returning cached data due to fetch error')
        return cached.data
      }
      
      throw error
    }
  }

  static clearCache() {
    this.cache.clear()
  }

  static async prefetchData() {
    // Prefetch data in the background
    this.fetchDashboardData().catch(error => {
      console.warn('Background data prefetch failed:', error)
    })
  }
} 