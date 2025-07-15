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
  Calendar
} from 'lucide-react'
import { OrganizationsView } from '@/components/organizations/organizations-view'
import { ProjectsView } from '@/components/projects/projects-view'
import { TasksView } from '@/components/tasks/tasks-view'
import { NotesView } from '@/components/notes/notes-view'
import { HabitsView } from '@/components/habits/habits-view'
import { PomodoroView } from '@/components/pomodoro/pomodoro-view'
import CalendarView from '@/components/calendar/calendar-view'
import { Sidebar } from '@/components/sidebar'
import { useTaskStore } from '@/store/tasks'
import { useProjectStore } from '@/store/projects'
import { useHabitStore } from '@/store/habits'
import { usePomodoroStore } from '@/store/pomodoro'
import { DashboardCharts } from '@/components/dashboard/charts'

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
} 