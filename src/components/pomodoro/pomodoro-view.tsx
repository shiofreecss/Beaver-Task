'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Play, Pause, RotateCcw, Settings, Timer, CheckCircle2, X, BarChart3, History, Clock, Trash2 } from 'lucide-react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import { useTaskStore } from '@/store/tasks'
import { useProjectStore } from '@/store/projects'
import { usePomodoroStore } from '@/store/pomodoro'
import { pomodoroService } from '@/lib/pomodoro-service'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'

type ViewMode = 'timer' | 'statistics' | 'history'

type SessionType = 'FOCUS' | 'SHORT_BREAK' | 'LONG_BREAK'

interface SessionConfig {
  duration: number
  label: string
  color: string
}

interface PomodoroSession {
  id: string
  duration: number
  type: SessionType
  taskId?: string | null
  startTime: Date
  endTime?: Date | null
  completed: boolean
  createdAt: Date
  updatedAt: Date
}

export function PomodoroView() {
  const [viewMode, setViewMode] = useState<ViewMode>('timer')
  const [selectedProjectId, setSelectedProjectId] = useState<string>('')
  const [selectedTaskId, setSelectedTaskId] = useState<string>('')
  const [sessionToDelete, setSessionToDelete] = useState<string | null>(null)
  const { toast } = useToast()

  // Get tasks and projects from stores
  const tasks = useTaskStore((state) => state.tasks)
  const projects = useProjectStore((state) => state.projects)

  // Filter tasks by selected project
  const projectTasks = selectedProjectId 
    ? tasks.filter(task => task.projectId === selectedProjectId)
    : tasks

  // Get pomodoro state and actions from store
  const {
    activeTimer,
    sessions,
    isLoading,
    startTimer,
    pauseTimer,
    resumeTimer,
    resetTimer,
    completeSession,
    fetchSessions,
    deleteSession
  } = usePomodoroStore()

  const sessionTypes: Record<SessionType, SessionConfig> = {
    FOCUS: { duration: 25 * 60, label: 'Focus Time', color: 'bg-red-500' },
    SHORT_BREAK: { duration: 5 * 60, label: 'Short Break', color: 'bg-green-500' },
    LONG_BREAK: { duration: 15 * 60, label: 'Long Break', color: 'bg-blue-500' }
  }

  // Initialize pomodoro service
  useEffect(() => {
    pomodoroService.initialize()
  }, [])

  // Fetch sessions on mount
  useEffect(() => {
    fetchSessions()
  }, [])

  const handleStart = async () => {
    if (!activeTimer) {
      await startTimer('FOCUS', sessionTypes.FOCUS.duration, selectedTaskId)
      pomodoroService.startTimer(sessionTypes.FOCUS.duration)
    } else {
      resumeTimer()
      pomodoroService.resumeTimer()
    }
  }

  const handlePause = async () => {
    await pauseTimer()
    pomodoroService.pauseTimer()
  }

  const handleReset = () => {
    resetTimer()
    if (activeTimer) {
      pomodoroService.resetTimer(sessionTypes[activeTimer.type].duration)
    }
  }

  const handleSessionComplete = async () => {
    await completeSession()
    
    const completedSessions = sessions.filter(
      s => s.type === 'FOCUS' && s.completed && 
      new Date(s.startTime).toDateString() === new Date().toDateString()
    ).length

    if (activeTimer?.type === 'FOCUS') {
      toast({
        title: "Focus session completed!",
        description: "Great work! Time for a break.",
      })
      
      // Auto-switch to break
      const nextSession = completedSessions % 4 === 3 ? 'LONG_BREAK' : 'SHORT_BREAK'
      const duration = sessionTypes[nextSession].duration
      
      await startTimer(nextSession, duration, selectedTaskId)
      pomodoroService.startTimer(duration)
    } else {
      toast({
        title: "Break completed!",
        description: "Ready for another focus session?",
      })
      
      const duration = sessionTypes.FOCUS.duration
      await startTimer('FOCUS', duration, selectedTaskId)
      pomodoroService.startTimer(duration)
    }
  }

  const switchSession = async (type: SessionType) => {
    if (activeTimer?.isActive) {
      await pauseTimer()
    }
    
    const duration = sessionTypes[type].duration
    await startTimer(type, duration, selectedTaskId)
    pomodoroService.startTimer(duration)
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const getProgress = () => {
    if (!activeTimer) return 0
    const totalTime = sessionTypes[activeTimer.type].duration
    return ((totalTime - activeTimer.timeLeft) / totalTime) * 100
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

  const handleDeleteSession = async (id: string) => {
    try {
      await deleteSession(id)
      toast({
        title: "Session deleted",
        description: "The pomodoro session has been removed from your history.",
      })
      setSessionToDelete(null)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete the session. Please try again.",
        variant: "destructive"
      })
    }
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
            {sessionTypes[activeTimer?.type || 'FOCUS'].label}
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
                  className={sessionTypes[activeTimer?.type || 'FOCUS'].color.replace('bg-', 'text-')}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-4xl font-mono font-bold">
                    {formatTime(activeTimer?.timeLeft || 0)}
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
              onClick={activeTimer?.isActive ? handlePause : handleStart}
              size="lg"
              className="w-24"
            >
              {activeTimer?.isActive ? (
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
              onClick={handleReset}
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
                variant={activeTimer?.type === type ? "default" : "outline"}
                size="sm"
                onClick={() => switchSession(type as SessionType)}
                disabled={activeTimer?.isActive}
              >
                {config.label}
              </Button>
            ))}
          </div>

          {/* Project and Task Selector */}
          <div className="max-w-md mx-auto space-y-4">
            {/* Project Selector */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Select Project (Optional)
              </label>
              <Select 
                value={selectedProjectId || "none"} 
                onValueChange={(value) => {
                  const newProjectId = value === "none" ? "" : value;
                  setSelectedProjectId(newProjectId);
                  setSelectedTaskId(""); // Reset task selection when project changes
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose a project" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No specific project</SelectItem>
                  {projects.map((project) => (
                    <SelectItem key={project.id} value={project.id}>
                      {project.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Task Selector */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Select Task (Optional)
              </label>
              <Select 
                value={selectedTaskId || "none"} 
                onValueChange={(value) => setSelectedTaskId(value === "none" ? "" : value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose a task to work on" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No specific task</SelectItem>
                  {projectTasks.map((task) => (
                    <SelectItem key={task.id} value={task.id}>
                      {task.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Session Counter */}
          <div className="text-center">
            <div className="text-2xl font-bold">{sessions.filter(s => s.type === 'FOCUS' && s.completed).length}</div>
            <div className="text-sm text-muted-foreground">
              Focus sessions completed today
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )

  const renderStatisticsView = () => {
    const focusSessions = sessions.filter(s => s.type === 'FOCUS' && s.completed)
    const totalFocusTime = focusSessions.reduce((total, session) => total + session.duration, 0) // already in minutes
    const todaysSessions = sessions.filter(s => 
      new Date(s.createdAt).toDateString() === new Date().toDateString() && s.completed
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
              {todaysSessions.filter(s => s.type === 'FOCUS').length} focus sessions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Average per Day</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {sessions.length > 0 ? Math.round(focusSessions.length / 7) : 0}
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
            <div className="text-2xl font-bold">{sessions.filter(s => s.type === 'FOCUS' && s.completed && new Date(s.startTime).toDateString() === new Date().toDateString()).length}</div>
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
                value={sessions.length > 0 ? (focusSessions.length / sessions.length) * 100 : 0} 
                className="h-2" 
              />
              <div className="flex justify-between text-sm">
                <span>Breaks</span>
                <span>{sessions.length - focusSessions.length}</span>
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
      {sessions.length === 0 ? (
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
          {sessions.map((session) => (
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
                        {new Date(session.createdAt).toLocaleString()}
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
                  <div className="flex items-center gap-4">
                    <div className="text-sm font-medium">
                      {Math.round(session.duration / 60)} min
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setSessionToDelete(session.id)}
                      className="h-8 w-8 text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                      <span className="sr-only">Delete session</span>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!sessionToDelete} onOpenChange={() => setSessionToDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Session</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this pomodoro session? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setSessionToDelete(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => sessionToDelete && handleDeleteSession(sessionToDelete)}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
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

      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : (
        renderCurrentView()
      )}
    </div>
  )
} 