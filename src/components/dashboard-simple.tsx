'use client'

import { useState, useEffect, memo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  CheckSquare, 
  FolderKanban, 
  FileText, 
  Target, 
  Timer,
  TrendingUp,
  Calendar,
  Loader2,
  Menu
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Sidebar } from '@/components/sidebar'
import { DashboardCharts } from '@/components/dashboard/charts'
import { useTaskStore } from '@/store/tasks'
import { useProjectStore } from '@/store/projects'
import { useHabitStore } from '@/store/habits'
import { usePomodoroStore } from '@/store/pomodoro'
import { useNoteStore } from '@/store/notes'
import { useOrganizationStore } from '@/store/organizations'
import { OrganizationsView } from '@/components/organizations/organizations-view'
import { ProjectsView } from '@/components/projects/projects-view'
import { TasksView } from '@/components/tasks/tasks-view'
import { NotesView } from '@/components/notes/notes-view'
import { HabitsView } from '@/components/habits/habits-view'
import { PomodoroView } from '@/components/pomodoro/pomodoro-view'
import CalendarView from '@/components/calendar/calendar-view'

const DashboardOverview = memo(function DashboardOverview() {
  const tasks = useTaskStore(state => state.tasks)
  const projects = useProjectStore(state => state.projects)
  const habits = useHabitStore(state => state.habits)
  const sessions = usePomodoroStore(state => state.sessions)
  const fetchTasks = useTaskStore(state => state.fetchTasks)
  const fetchProjects = useProjectStore(state => state.fetchProjects)
  const fetchHabits = useHabitStore(state => state.fetchHabits)
  const fetchSessions = usePomodoroStore(state => state.fetchSessions)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const completedTasks = tasks.filter(task => task.status === 'COMPLETED' && !task.parentId).length
  const activeProjects = projects.filter(project => project.status === 'ACTIVE').length
  const completedHabits = habits.filter(habit => habit.completedToday).length
  const focusMinutes = sessions.reduce((acc, session) => acc + (session.duration || 0), 0)

  useEffect(() => {
    // Initial fetch with loading state
    const fetchAllData = async () => {
      setIsLoading(true)
      setError(null)
      
      try {
        await Promise.allSettled([
          fetchTasks(),
          fetchProjects(),
          fetchHabits(),
          fetchSessions()
        ])
      } catch (err) {
        setError('Failed to load dashboard data')
        console.error('Dashboard data fetch error:', err)
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchAllData()

    // Set up auto-refresh every 60 seconds (reduced from 30)
    const interval = setInterval(() => {
      fetchAllData()
    }, 60000)

    return () => clearInterval(interval)
  }, [fetchTasks, fetchProjects, fetchHabits, fetchSessions])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-destructive mb-2">{error}</p>
          <Button onClick={() => window.location.reload()}>
            Retry
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div>
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
})

export const DashboardSimple = memo(function DashboardSimple() {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

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
        setIsLoading(true)
        setError(null)
        
        // Load all data with proper error handling
        await Promise.allSettled([
          fetchTasks(),
          fetchProjects(),
          fetchHabits(),
          fetchSessions(),
          fetchNotes(),
          fetchOrganizations()
        ])
      } catch (error) {
        console.error('Error loading data:', error)
        setError('Failed to load application data')
      } finally {
        setIsLoading(false)
      }
    }

    loadAllData()

    // Timeout to ensure loading doesn't get stuck
    const timeout = setTimeout(() => {
      console.log('Loading timeout reached, forcing completion')
      setIsLoading(false)
    }, 10000) // 10 second timeout

    return () => clearTimeout(timeout)
  }, [fetchTasks, fetchProjects, fetchHabits, fetchSessions, fetchNotes, fetchOrganizations])

  const renderContent = () => {
    switch (activeTab) {
      case 'organizations':
        return <OrganizationsView />
      case 'projects':
        return <ProjectsView />
      case 'tasks':
        return <TasksView />
      case 'notes':
        return <NotesView />
      case 'habits':
        return <HabitsView />
      case 'pomodoro':
        return <PomodoroView />
      case 'calendar':
        return <CalendarView />
      default:
        return (
          <div className="p-8">
            <h1 className="text-3xl font-bold mb-8">Dashboard</h1>
            {isLoading ? (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : error ? (
              <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <p className="text-destructive mb-2">{error}</p>
                  <Button onClick={() => window.location.reload()}>
                    Retry
                  </Button>
                </div>
              </div>
            ) : (
              <DashboardOverview />
            )}
          </div>
        )
    }
  }

  return (
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
  )
}) 