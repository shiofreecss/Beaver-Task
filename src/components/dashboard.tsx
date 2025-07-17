'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  CheckSquare, 
  FolderKanban, 
  FileText, 
  Target, 
  Timer,
  TrendingUp,
  Calendar,
  Menu
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { FullScreenLoading } from '@/components/ui/loading-screen'
import { useLoadingManager } from '@/components/ui/loading-manager'
import { useTaskStore } from '@/store/tasks'
import { useProjectStore } from '@/store/projects'
import { useHabitStore } from '@/store/habits'
import { usePomodoroStore } from '@/store/pomodoro'
import { useNoteStore } from '@/store/notes'
import { useOrganizationStore } from '@/store/organizations'
import {
  LazyOrganizationsView,
  LazyProjectsView,
  LazyTasksView,
  LazyNotesView,
  LazyHabitsView,
  LazyPomodoroView,
  LazyCalendarView,
  preloadCriticalComponents
} from '@/components/lazy-components'
import { Sidebar } from '@/components/sidebar'
import { DashboardCharts } from '@/components/dashboard/charts'
import { ErrorBoundary } from '@/components/ui/error-boundary'

function DashboardOverview() {
  const tasks = useTaskStore(state => state.tasks)
  const projects = useProjectStore(state => state.projects)
  const habits = useHabitStore(state => state.habits)
  const sessions = usePomodoroStore(state => state.sessions)
  const fetchTasks = useTaskStore(state => state.fetchTasks)
  const fetchProjects = useProjectStore(state => state.fetchProjects)
  const fetchHabits = useHabitStore(state => state.fetchHabits)
  const fetchSessions = usePomodoroStore(state => state.fetchSessions)

  const completedTasks = tasks.filter(task => task.status === 'COMPLETED' && !task.parentId).length
  const activeProjects = projects.filter(project => project.status === 'ACTIVE').length
  const completedHabits = habits.filter(habit => habit.completedToday).length
  const focusMinutes = sessions.reduce((acc, session) => acc + (session.duration || 0), 0)

  useEffect(() => {
    // Initial fetch
    const fetchAllData = async () => {
      await Promise.all([
        fetchTasks(),
        fetchProjects(),
        fetchHabits(),
        fetchSessions()
      ])
    }
    
    fetchAllData()

    // Set up auto-refresh every 30 seconds
    const interval = setInterval(fetchAllData, 30000)

    return () => clearInterval(interval)
  }, [fetchTasks, fetchProjects, fetchHabits, fetchSessions])

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-8">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Completed Tasks</CardTitle>
            <CheckSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedTasks}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active Projects</CardTitle>
            <FolderKanban className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeProjects}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Completed Habits</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedHabits}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Focus Minutes</CardTitle>
            <Timer className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{focusMinutes}</div>
          </CardContent>
        </Card>
      </div>

      <DashboardCharts 
        tasks={tasks}
        projects={projects}
        sessions={sessions}
      />
    </div>
  )
}

export function Dashboard() {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [isLoading, setIsLoading] = useState(true)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const { loadingStates, setLoadingState, resetLoadingStates } = useLoadingManager()

  // Initialize all stores
  const fetchTasks = useTaskStore(state => state.fetchTasks)
  const fetchProjects = useProjectStore(state => state.fetchProjects)
  const fetchHabits = useHabitStore(state => state.fetchHabits)
  const fetchSessions = usePomodoroStore(state => state.fetchSessions)
  const fetchNotes = useNoteStore(state => state.fetchNotes)
  const fetchOrganizations = useOrganizationStore(state => state.fetchOrganizations)

  useEffect(() => {
    const loadAllData = async () => {
      try {
        // Load data with individual tracking
        const promises = [
          fetchTasks().then(() => setLoadingState('tasks', false)).catch(() => setLoadingState('tasks', false)),
          fetchProjects().then(() => setLoadingState('projects', false)).catch(() => setLoadingState('projects', false)),
          fetchHabits().then(() => setLoadingState('habits', false)).catch(() => setLoadingState('habits', false)),
          fetchSessions().then(() => setLoadingState('pomodoro', false)).catch(() => setLoadingState('pomodoro', false)),
          fetchNotes().then(() => setLoadingState('notes', false)).catch(() => setLoadingState('notes', false)),
          fetchOrganizations().then(() => setLoadingState('organizations', false)).catch(() => setLoadingState('organizations', false))
        ]

        await Promise.allSettled(promises)
      } catch (error) {
        console.error('Error loading data:', error)
        // Mark all as loaded even if some fail
        resetLoadingStates()
      }
    }

    loadAllData()

    // Timeout to ensure loading doesn't get stuck
    const timeout = setTimeout(() => {
      console.log('Loading timeout reached, forcing completion')
      resetLoadingStates()
    }, 10000) // 10 second timeout

    return () => clearTimeout(timeout)
  }, [fetchTasks, fetchProjects, fetchHabits, fetchSessions, fetchNotes, fetchOrganizations, setLoadingState, resetLoadingStates])

  const handleLoadingComplete = () => {
    console.log('Loading complete, hiding loading screen')
    setIsLoading(false)
    // Preload critical components after initial load
    preloadCriticalComponents()
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'organizations':
        return (
          <ErrorBoundary>
            <LazyOrganizationsView />
          </ErrorBoundary>
        )
      case 'projects':
        return (
          <ErrorBoundary>
            <LazyProjectsView />
          </ErrorBoundary>
        )
      case 'tasks':
        return (
          <ErrorBoundary>
            <LazyTasksView />
          </ErrorBoundary>
        )
      case 'notes':
        return (
          <ErrorBoundary>
            <LazyNotesView />
          </ErrorBoundary>
        )
      case 'habits':
        return (
          <ErrorBoundary>
            <LazyHabitsView />
          </ErrorBoundary>
        )
      case 'pomodoro':
        return (
          <ErrorBoundary>
            <LazyPomodoroView />
          </ErrorBoundary>
        )
      case 'calendar':
        return (
          <ErrorBoundary>
            <LazyCalendarView />
          </ErrorBoundary>
        )
      default:
        return <DashboardOverview />
    }
  }

  // Show loading screen until data is loaded
  if (isLoading) {
    return <FullScreenLoading message="Loading your workspace..." />
  }

  return (
    <ErrorBoundary>
      <div className="flex h-screen bg-background">
        {/* Mobile Menu Button */}
        <div className="lg:hidden">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="mobile-menu-button"
          >
            <Menu className="h-4 w-4" />
          </Button>
        </div>

        {/* Sidebar */}
        <Sidebar 
          activeTab={activeTab} 
          onTabChange={setActiveTab}
          isMobileOpen={isMobileMenuOpen}
          onMobileToggle={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        />
        
        {/* Main Content */}
        <main className="flex-1 overflow-auto min-w-0 lg:ml-0">
          {renderContent()}
        </main>
      </div>
    </ErrorBoundary>
  )
} 