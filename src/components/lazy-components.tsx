import dynamic from 'next/dynamic'
import { Loader2 } from 'lucide-react'

// Loading component for lazy-loaded components
const LoadingFallback = () => (
  <div className="flex items-center justify-center p-8">
    <Loader2 className="h-6 w-6 animate-spin text-primary" />
  </div>
)

// Error component for failed lazy loads
const ErrorFallback = () => (
  <div className="flex items-center justify-center p-8 text-red-500">
    <p>Failed to load component. Please refresh the page.</p>
  </div>
)

// Lazy load all major components
export const LazyOrganizationsView = dynamic(
  () => import('./organizations/organizations-view').then(mod => ({ default: mod.OrganizationsView })),
  {
    loading: LoadingFallback,
    ssr: false
  }
)

export const LazyProjectsView = dynamic(
  () => import('./projects/projects-view').then(mod => ({ default: mod.ProjectsView })),
  {
    loading: LoadingFallback,
    ssr: false
  }
)

export const LazyTasksView = dynamic(
  () => import('./tasks/tasks-view').then(mod => ({ default: mod.TasksView })),
  {
    loading: LoadingFallback,
    ssr: false
  }
)

export const LazyNotesView = dynamic(
  () => import('./notes/notes-view').then(mod => ({ default: mod.NotesView })),
  {
    loading: LoadingFallback,
    ssr: false
  }
)

export const LazyHabitsView = dynamic(
  () => import('./habits/habits-view').then(mod => ({ default: mod.HabitsView })),
  {
    loading: LoadingFallback,
    ssr: false
  }
)

export const LazyPomodoroView = dynamic(
  () => import('./pomodoro/pomodoro-view').then(mod => ({ default: mod.PomodoroView })),
  {
    loading: LoadingFallback,
    ssr: false
  }
)

export const LazyCalendarView = dynamic(
  () => import('./calendar/calendar-view').then(mod => ({ default: mod.default })),
  {
    loading: LoadingFallback,
    ssr: false
  }
)





// Preload functions for critical components (simplified)
export const preloadComponents = {
  tasks: () => import('./tasks/tasks-view'),
  projects: () => import('./projects/projects-view')
}

// Preload critical components after initial load (simplified)
export const preloadCriticalComponents = () => {
  // Preload components after initial load
  setTimeout(() => {
    preloadComponents.tasks()
    preloadComponents.projects()
  }, 1000)
} 