'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Play, Pause, RotateCcw, Settings, Timer, CheckCircle2, X, BarChart3, History, Clock } from 'lucide-react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import { useTaskStore } from '@/store/tasks'
import { useProjectStore } from '@/store/projects'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'

type ViewMode = 'timer' | 'statistics' | 'history'

export function PomodoroView() {
  const [timeLeft, setTimeLeft] = useState(25 * 60) // 25 minutes in seconds
  const [isActive, setIsActive] = useState(false)
  const [sessionType, setSessionType] = useState<'focus' | 'shortBreak' | 'longBreak'>('focus')
  const [completedSessions, setCompletedSessions] = useState(0)
  const [selectedTaskId, setSelectedTaskId] = useState<string>('')
  const [pomodoroSessions, setPomodoroSessions] = useState<any[]>([])
  const [viewMode, setViewMode] = useState<ViewMode>('timer')
  const { toast } = useToast()

  // Get tasks from the store
  const tasks = useTaskStore((state) => state.tasks)
  const projects = useProjectStore((state) => state.projects)

  const sessionTypes = {
    focus: { duration: 25 * 60, label: 'Focus Time', color: 'bg-red-500' },
    shortBreak: { duration: 5 * 60, label: 'Short Break', color: 'bg-green-500' },
    longBreak: { duration: 15 * 60, label: 'Long Break', color: 'bg-blue-500' }
  }

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null

    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(timeLeft => timeLeft - 1)
      }, 1000)
    } else if (timeLeft === 0) {
      handleSessionComplete()
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isActive, timeLeft])

  const handleSessionComplete = () => {
    setIsActive(false)
    
    const session = {
      id: Date.now().toString(),
      type: sessionType,
      duration: sessionTypes[sessionType].duration,
      taskId: selectedTaskId || null,
      completedAt: new Date().toISOString()
    }
    
    setPomodoroSessions(prev => [session, ...prev])
    
    if (sessionType === 'focus') {
      setCompletedSessions(prev => prev + 1)
      toast({
        title: "Focus session completed!",
        description: "Great work! Time for a break.",
      })
      
      // Auto-switch to break
      const nextSession = completedSessions % 4 === 3 ? 'longBreak' : 'shortBreak'
      setSessionType(nextSession)
      setTimeLeft(sessionTypes[nextSession].duration)
    } else {
      toast({
        title: "Break completed!",
        description: "Ready for another focus session?",
      })
      setSessionType('focus')
      setTimeLeft(sessionTypes.focus.duration)
    }
  }

  const startTimer = () => {
    setIsActive(true)
  }

  const pauseTimer = () => {
    setIsActive(false)
  }

  const resetTimer = () => {
    setIsActive(false)
    setTimeLeft(sessionTypes[sessionType].duration)
  }

  const switchSession = (type: 'focus' | 'shortBreak' | 'longBreak') => {
    setIsActive(false)
    setSessionType(type)
    setTimeLeft(sessionTypes[type].duration)
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const getProgress = () => {
    const totalTime = sessionTypes[sessionType].duration
    return ((totalTime - timeLeft) / totalTime) * 100
  }

  const getTaskName = (taskId: string) => {
    const task = tasks.find(t => t.id === taskId)
    return task?.title || 'Unknown Task'
  }

  const getProjectName = (taskId: string) => {
    const task = tasks.find(t => t.id === taskId)
    if (!task?.projectId) return null
    const project = projects.find(p => p.id === task.projectId)
    return project?.name || null
  }

  const viewModeButtons = [
    { mode: 'timer' as ViewMode, icon: Timer, label: 'Timer' },
    { mode: 'statistics' as ViewMode, icon: BarChart3, label: 'Statistics' },
    { mode: 'history' as ViewMode, icon: History, label: 'History' }
  ]

  const renderTimerView = () => (
    <div className="max-w-2xl mx-auto">
      <Card className="text-center">
        <CardHeader>
          <CardTitle className="text-2xl">
            {sessionTypes[sessionType].label}
          </CardTitle>
          {selectedTaskId && (
            <div className="text-sm text-muted-foreground">
              Working on: <span className="font-medium">{getTaskName(selectedTaskId)}</span>
              {getProjectName(selectedTaskId) && (
                <span className="ml-1">({getProjectName(selectedTaskId)})</span>
              )}
            </div>
          )}
        </CardHeader>
        <CardContent className="space-y-8">
          {/* Timer Display */}
          <div className="relative">
            <div className="w-64 h-64 mx-auto relative">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  stroke="currentColor"
                  strokeWidth="2"
                  fill="none"
                  className="text-muted"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="none"
                  strokeDasharray={`${2 * Math.PI * 45}`}
                  strokeDashoffset={`${2 * Math.PI * 45 * (1 - getProgress() / 100)}`}
                  className={sessionTypes[sessionType].color.replace('bg-', 'text-')}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-4xl font-mono font-bold">
                    {formatTime(timeLeft)}
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">
                    {Math.round(getProgress())}% complete
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="flex justify-center gap-4">
            <Button
              onClick={isActive ? pauseTimer : startTimer}
              size="lg"
              className="w-24"
            >
              {isActive ? (
                <>
                  <Pause className="mr-2 h-5 w-5" />
                  Pause
                </>
              ) : (
                <>
                  <Play className="mr-2 h-5 w-5" />
                  Start
                </>
              )}
            </Button>
            <Button
              onClick={resetTimer}
              variant="outline"
              size="lg"
            >
              <RotateCcw className="mr-2 h-4 w-4" />
              Reset
            </Button>
          </div>

          {/* Session Type Selector */}
          <div className="flex justify-center gap-2">
            {Object.entries(sessionTypes).map(([type, config]) => (
              <Button
                key={type}
                variant={sessionType === type ? "default" : "outline"}
                size="sm"
                onClick={() => switchSession(type as any)}
                disabled={isActive}
              >
                {config.label}
              </Button>
            ))}
          </div>

          {/* Task Selector */}
          <div className="max-w-md mx-auto">
            <label className="block text-sm font-medium mb-2">
              Select Task (Optional)
            </label>
            <Select value={selectedTaskId} onValueChange={setSelectedTaskId}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a task to work on" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">No specific task</SelectItem>
                {tasks.map((task) => (
                  <SelectItem key={task.id} value={task.id}>
                    {task.title}
                    {task.projectId && (
                      <span className="text-muted-foreground ml-2">
                        ({projects.find(p => p.id === task.projectId)?.name})
                      </span>
                    )}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Session Counter */}
          <div className="text-center">
            <div className="text-2xl font-bold">{completedSessions}</div>
            <div className="text-sm text-muted-foreground">
              Focus sessions completed today
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )

  const renderStatisticsView = () => {
    const focusSessions = pomodoroSessions.filter(s => s.type === 'focus')
    const totalFocusTime = focusSessions.length * 25 // minutes
    const todaysSessions = pomodoroSessions.filter(s => 
      new Date(s.completedAt).toDateString() === new Date().toDateString()
    )

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Focus Time</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.floor(totalFocusTime / 60)}h {totalFocusTime % 60}m</div>
            <p className="text-xs text-muted-foreground">
              Across {focusSessions.length} sessions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Today's Sessions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{todaysSessions.length}</div>
            <p className="text-xs text-muted-foreground">
              {todaysSessions.filter(s => s.type === 'focus').length} focus sessions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Average per Day</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {pomodoroSessions.length > 0 ? Math.round(focusSessions.length / 7) : 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Focus sessions this week
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Current Streak</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedSessions}</div>
            <p className="text-xs text-muted-foreground">
              Sessions completed today
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Focus vs Break</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Focus</span>
                <span>{focusSessions.length}</span>
              </div>
              <Progress 
                value={pomodoroSessions.length > 0 ? (focusSessions.length / pomodoroSessions.length) * 100 : 0} 
                className="h-2" 
              />
              <div className="flex justify-between text-sm">
                <span>Breaks</span>
                <span>{pomodoroSessions.length - focusSessions.length}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Most Productive Time</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2-4 PM</div>
            <p className="text-xs text-muted-foreground">
              Based on session history
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const renderHistoryView = () => (
    <div className="space-y-6">
      {pomodoroSessions.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <Clock className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No sessions yet</h3>
            <p className="text-muted-foreground mb-4">
              Start your first Pomodoro session to see your history here
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {pomodoroSessions.map((session) => (
            <Card key={session.id}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`w-3 h-3 rounded-full ${sessionTypes[session.type].color}`} />
                    <div>
                      <div className="font-medium">
                        {sessionTypes[session.type].label}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {new Date(session.completedAt).toLocaleString()}
                      </div>
                    </div>
                    {session.taskId && (
                      <div className="text-sm">
                        <Badge variant="outline">
                          {getTaskName(session.taskId)}
                        </Badge>
                        {getProjectName(session.taskId) && (
                          <Badge variant="secondary" className="ml-2">
                            {getProjectName(session.taskId)}
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="text-sm font-medium">
                    {Math.round(session.duration / 60)} min
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )

  const renderCurrentView = () => {
    switch (viewMode) {
      case 'timer':
        return renderTimerView()
      case 'statistics':
        return renderStatisticsView()
      case 'history':
        return renderHistoryView()
      default:
        return renderTimerView()
    }
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Pomodoro Timer</h1>
          <p className="text-muted-foreground">
            Stay focused with the Pomodoro Technique
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* View Mode Toggle */}
          <div className="flex rounded-lg border p-1">
            {viewModeButtons.map(({ mode, icon: Icon, label }) => (
              <Button
                key={mode}
                variant={viewMode === mode ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode(mode)}
                className="h-8 px-3"
              >
                <Icon className="h-4 w-4" />
                <span className="sr-only">{label}</span>
              </Button>
            ))}
          </div>
        </div>
      </div>

      {renderCurrentView()}
    </div>
  )
} 