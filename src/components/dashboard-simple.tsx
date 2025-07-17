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
  Loader2
} from 'lucide-react'
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
      <div className="p-8">
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center space-x-2">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span className="text-lg">Loading dashboard...</span>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-700">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
          >
            Try again
          </button>
        </div>
      </div>
    )
  }

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
})

export const DashboardSimple = memo(function DashboardSimple() {
  const [activeTab, setActiveTab] = useState('dashboard')

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
        return <DashboardOverview />
    }
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
      <main className="flex-1 overflow-auto min-w-0">
        {renderContent()}
      </main>
    </div>
  )
}) 