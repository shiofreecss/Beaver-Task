'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Play, Pause, RotateCcw, Settings, Timer, CheckCircle2, X } from 'lucide-react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import { useTaskStore } from '@/store/tasks'
import { useProjectStore } from '@/store/projects'

export function PomodoroView() {
  const [timeLeft, setTimeLeft] = useState(25 * 60) // 25 minutes in seconds
  const [isActive, setIsActive] = useState(false)
  const [sessionType, setSessionType] = useState<'focus' | 'shortBreak' | 'longBreak'>('focus')
  const [completedSessions, setCompletedSessions] = useState(0)
  const [selectedTaskId, setSelectedTaskId] = useState<string>('')
  const [pomodoroSessions, setPomodoroSessions] = useState<any[]>([])
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
        setTimeLeft(time => time - 1)
      }, 1000)
    } else if (timeLeft === 0) {
      setIsActive(false)
      // Auto-complete session and switch
      handleSessionComplete()
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isActive, timeLeft])

  const handleSessionComplete = () => {
    // Save completed session
    const session = {
      id: Date.now().toString(),
      type: sessionType,
      duration: sessionTypes[sessionType].duration,
      taskId: selectedTaskId,
      completed: true,
      startTime: new Date(Date.now() - sessionTypes[sessionType].duration * 1000).toISOString(),
      endTime: new Date().toISOString()
    }
    setPomodoroSessions(prev => [...prev, session])

    // Show completion toast
    const selectedTask = tasks.find(t => t.id === selectedTaskId)
    toast({
      title: "Session Complete! 🎉",
      description: `${sessionTypes[sessionType].label} completed${selectedTask ? ` for ${selectedTask.title}` : ''}`,
    })

    if (sessionType === 'focus') {
      setCompletedSessions(prev => prev + 1)
      // After 4 focus sessions, take a long break
      const nextType = (completedSessions + 1) % 4 === 0 ? 'longBreak' : 'shortBreak'
      setSessionType(nextType)
      setTimeLeft(sessionTypes[nextType].duration)
    } else {
      setSessionType('focus')
      setTimeLeft(sessionTypes.focus.duration)
    }
  }

  const toggleTimer = () => {
    if (!isActive) {
      // Starting a new session
      const selectedTask = tasks.find(t => t.id === selectedTaskId)
      if (sessionType === 'focus' && selectedTask) {
        toast({
          title: "Session Started! 🔥",
          description: `Focus session started for ${selectedTask.title}`,
        })
      } else if (sessionType === 'focus') {
        toast({
          title: "Session Started! 🔥",
          description: "Focus session started",
        })
      }
    }
    setIsActive(!isActive)
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

  const cancelSession = () => {
    if (isActive) {
      setIsActive(false)
      toast({
        title: "Session Cancelled",
        description: "Timer stopped and reset",
      })
    }
    setTimeLeft(sessionTypes[sessionType].duration)
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const progress = ((sessionTypes[sessionType].duration - timeLeft) / sessionTypes[sessionType].duration) * 100

  // Get task with project info
  const getTaskWithProject = (task: any) => {
    const project = task.projectId ? projects.find(p => p.id === task.projectId) : null
    return {
      ...task,
      projectName: project?.name || 'No Project'
    }
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Pomodoro Timer</h1>
          <p className="text-gray-600 dark:text-gray-400">Stay focused with time-boxed work sessions</p>
        </div>
        <Button variant="outline">
          <Settings className="mr-2 h-4 w-4" />
          Settings
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Timer */}
        <div className="lg:col-span-2">
          <Card className="text-center">
            <CardHeader>
              <CardTitle className="flex items-center justify-center">
                <Timer className="mr-2 h-5 w-5" />
                {sessionTypes[sessionType].label}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Session Type Selector */}
              <div className="flex justify-center space-x-2">
                {Object.entries(sessionTypes).map(([key, type]) => (
                  <Button
                    key={key}
                    variant={sessionType === key ? "default" : "outline"}
                    size="sm"
                    onClick={() => switchSession(key as any)}
                    className="text-xs"
                    disabled={isActive}
                  >
                    {type.label}
                  </Button>
                ))}
              </div>

              {/* Task Selection for Focus Sessions */}
              {sessionType === 'focus' && (
                <div className="max-w-sm mx-auto">
                  <Select 
                    value={selectedTaskId} 
                    onValueChange={(value) => setSelectedTaskId(value === "none" ? "" : value)} 
                    disabled={isActive}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a task (optional)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No specific task</SelectItem>
                      {tasks.map((task) => (
                        <SelectItem key={task.id} value={task.id}>
                          {task.title} {task.projectId && `(${getTaskWithProject(task).projectName})`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Timer Display */}
              <div className="relative">
                <div className="w-64 h-64 mx-auto relative">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                    <circle
                      cx="50"
                      cy="50"
                      r="45"
                      stroke="currentColor"
                      strokeOpacity="0.1"
                      strokeWidth="8"
                      fill="none"
                      className="dark:stroke-gray-700"
                    />
                    <circle
                      cx="50"
                      cy="50"
                      r="45"
                      stroke="currentColor"
                      strokeWidth="8"
                      fill="none"
                      strokeLinecap="round"
                      strokeDasharray={`${2 * Math.PI * 45}`}
                      strokeDashoffset={`${2 * Math.PI * 45 * (1 - progress / 100)}`}
                      className={`transition-all duration-1000 ${sessionTypes[sessionType].color.replace('bg-', 'text-')}`}
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-4xl font-mono font-bold text-gray-900 dark:text-gray-100">
                      {formatTime(timeLeft)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Controls */}
              <div className="flex justify-center space-x-4">
                <Button
                  onClick={toggleTimer}
                  size="lg"
                  className={`${sessionTypes[sessionType].color}`}
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
                
                <Button onClick={resetTimer} variant="outline" size="lg">
                  <RotateCcw className="mr-2 h-5 w-5" />
                  Reset
                </Button>

                {isActive && (
                  <Button onClick={cancelSession} variant="destructive" size="lg">
                    <X className="mr-2 h-5 w-5" />
                    Cancel
                  </Button>
                )}
              </div>

              {/* Completed Sessions Counter */}
              <div className="text-center mt-4">
                <p className="text-gray-600 dark:text-gray-400">
                  Completed Sessions Today
                </p>
                <span className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {completedSessions}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Today's Sessions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <CheckCircle2 className="mr-2 h-5 w-5" />
              Today's Sessions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {pomodoroSessions.map((session, index) => {
                const task = session.taskId ? tasks.find(t => t.id === session.taskId) : null
                return (
                  <div key={index} className="flex items-center justify-between p-2 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                    <div className="flex items-center">
                      <div className={`w-2 h-2 rounded-full mr-3 ${
                        session.type === 'focus' ? 'bg-red-500' : 
                        session.type === 'shortBreak' ? 'bg-green-500' : 'bg-blue-500'
                      }`} />
                      <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {session.type === 'focus' ? 'Focus Time' :
                         session.type === 'shortBreak' ? 'Short Break' : 'Long Break'}
                        {task && ` - ${task.title}`}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {new Date(session.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* This Week's Stats */}
        <Card>
          <CardHeader>
            <CardTitle>This Week</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">Total Sessions</span>
                <span className="font-bold text-gray-900 dark:text-gray-100">{pomodoroSessions.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">Focus Time</span>
                <span className="font-bold text-gray-900 dark:text-gray-100">
                  {Math.floor(pomodoroSessions.filter(s => s.type === 'focus').length * 25 / 60)}h {(pomodoroSessions.filter(s => s.type === 'focus').length * 25) % 60}m
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">Current Streak</span>
                <span className="font-bold text-gray-900 dark:text-gray-100">
                  {completedSessions} sessions
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 