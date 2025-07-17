// Performance monitoring utility
export class PerformanceMonitor {
  private static metrics: Map<string, number[]> = new Map()
  private static enabled = process.env.NODE_ENV === 'development'

  static startTimer(operation: string): () => void {
    if (!this.enabled) return () => {}
    
    const start = performance.now()
    return () => {
      const duration = performance.now() - start
      this.recordMetric(operation, duration)
    }
  }

  static recordMetric(operation: string, duration: number) {
    if (!this.enabled) return

    if (!this.metrics.has(operation)) {
      this.metrics.set(operation, [])
    }
    
    this.metrics.get(operation)!.push(duration)
    
    // Keep only last 100 measurements
    const measurements = this.metrics.get(operation)!
    if (measurements.length > 100) {
      this.metrics.set(operation, measurements.slice(-100))
    }
  }

  static getMetrics(operation?: string) {
    if (!this.enabled) return {}

    if (operation) {
      const measurements = this.metrics.get(operation) || []
      return {
        count: measurements.length,
        avg: measurements.length > 0 ? measurements.reduce((a, b) => a + b, 0) / measurements.length : 0,
        min: measurements.length > 0 ? Math.min(...measurements) : 0,
        max: measurements.length > 0 ? Math.max(...measurements) : 0,
        latest: measurements.length > 0 ? measurements[measurements.length - 1] : 0
      }
    }

    const result: Record<string, any> = {}
    for (const [op, measurements] of this.metrics.entries()) {
      result[op] = {
        count: measurements.length,
        avg: measurements.length > 0 ? measurements.reduce((a, b) => a + b, 0) / measurements.length : 0,
        min: measurements.length > 0 ? Math.min(...measurements) : 0,
        max: measurements.length > 0 ? Math.max(...measurements) : 0,
        latest: measurements.length > 0 ? measurements[measurements.length - 1] : 0
      }
    }
    return result
  }

  static logMetrics() {
    if (!this.enabled) return

    const metrics = this.getMetrics()
    console.group('🚀 Performance Metrics')
    for (const [operation, data] of Object.entries(metrics)) {
      console.log(`${operation}:`, {
        count: data.count,
        avg: `${data.avg.toFixed(2)}ms`,
        min: `${data.min.toFixed(2)}ms`,
        max: `${data.max.toFixed(2)}ms`,
        latest: `${data.latest.toFixed(2)}ms`
      })
    }
    console.groupEnd()
  }

  static clearMetrics() {
    this.metrics.clear()
  }
}

// Performance-aware fetch wrapper
export async function fetchWithMetrics(url: string, options?: RequestInit): Promise<Response> {
  const stopTimer = PerformanceMonitor.startTimer(`fetch:${url}`)
  
  try {
    const response = await fetch(url, options)
    stopTimer()
    return response
  } catch (error) {
    stopTimer()
    throw error
  }
}

// Performance-aware API call wrapper
export function createApiCall<T>(endpoint: string) {
  return async (data?: any): Promise<T> => {
    const stopTimer = PerformanceMonitor.startTimer(`api:${endpoint}`)
    
    try {
      const response = await fetch(`/api/${endpoint}`, {
        method: data ? 'POST' : 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        body: data ? JSON.stringify(data) : undefined,
      })
      
      if (!response.ok) {
        throw new Error(`API call failed: ${response.status}`)
      }
      
      const result = await response.json()
      stopTimer()
      return result
    } catch (error) {
      stopTimer()
      throw error
    }
  }
}

// Auto-log metrics every 30 seconds in development
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  setInterval(() => {
    PerformanceMonitor.logMetrics()
  }, 30000)
} 