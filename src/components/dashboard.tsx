'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  CheckSquare, 
  FolderKanban, 
  FileText, 
  Target, 
  Timer,
  Plus,
  Clock,
  TrendingUp
} from 'lucide-react'
import { ProjectsView } from '@/components/projects/projects-view'
import { TasksView } from '@/components/tasks/tasks-view'
import { NotesView } from '@/components/notes/notes-view'
import { HabitsView } from '@/components/habits/habits-view'
import { PomodoroView } from '@/components/pomodoro/pomodoro-view'
import { Sidebar } from '@/components/sidebar'

export function Dashboard() {
  const [activeTab, setActiveTab] = useState('dashboard')

  const renderContent = () => {
    switch (activeTab) {
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
      default:
        return <DashboardOverview />
    }
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
      <main className="flex-1 overflow-auto">
        {renderContent()}
      </main>
    </div>
  )
}

function DashboardOverview() {
  const stats = [
    {
      title: "Active Projects",
      value: "3",
      description: "2 due this week",
      icon: FolderKanban,
      color: "text-blue-600"
    },
    {
      title: "Pending Tasks",
      value: "12",
      description: "4 overdue",
      icon: CheckSquare,
      color: "text-green-600"
    },
    {
      title: "Notes",
      value: "28",
      description: "5 updated today",
      icon: FileText,
      color: "text-purple-600"
    },
    {
      title: "Habits Completed",
      value: "75%",
      description: "This week",
      icon: Target,
      color: "text-orange-600"
    }
  ]

  const recentActivities = [
    { type: 'task', text: 'Completed "Design homepage layout"', time: '2 hours ago' },
    { type: 'project', text: 'Created new project "Mobile App"', time: '4 hours ago' },
    { type: 'habit', text: 'Completed morning workout', time: '1 day ago' },
    { type: 'note', text: 'Added note "Meeting insights"', time: '2 days ago' },
  ]

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Welcome back! Here's your overview.</p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Quick Add
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon
          return (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <Icon className={`h-4 w-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground">
                  {stat.description}
                </p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>
                Your latest updates and completed items
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivities.map((activity, index) => (
                  <div key={index} className="flex items-center space-x-4">
                    <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-900">{activity.text}</p>
                      <p className="text-xs text-gray-500">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Today's Focus */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Timer className="mr-2 h-4 w-4" />
                Today's Focus
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center p-6 bg-gray-50 rounded-lg">
                <Timer className="h-8 w-8 mx-auto text-blue-600 mb-2" />
                <p className="text-sm text-gray-600 mb-2">Ready to focus?</p>
                <Button size="sm" className="w-full">
                  Start Pomodoro
                </Button>
              </div>
              
              <div>
                <h4 className="text-sm font-medium mb-2">Today's Tasks</h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Review project proposal</span>
                    <Clock className="h-3 w-3 text-gray-400" />
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span>Update documentation</span>
                    <Clock className="h-3 w-3 text-gray-400" />
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span>Team standup meeting</span>
                    <Clock className="h-3 w-3 text-gray-400" />
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium mb-2">Habit Progress</h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Morning Exercise</span>
                    <span className="text-green-600">✓</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Read 30 min</span>
                    <span className="text-gray-400">○</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Meditation</span>
                    <span className="text-gray-400">○</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
} 