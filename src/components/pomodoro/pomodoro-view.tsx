'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Play, Pause, RotateCcw, Settings, Timer, CheckCircle2, X } from 'lucide-react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'

export function PomodoroView() {
  const [timeLeft, setTimeLeft] = useState(25 * 60) // 25 minutes in seconds
  const [isActive, setIsActive] = useState(false)
  const [sessionType, setSessionType] = useState<'focus' | 'shortBreak' | 'longBreak'>('focus')
  const [completedSessions, setCompletedSessions] = useState(0)
  const [selectedTaskId, setSelectedTaskId] = useState<string>('')
  const [pomodoroSessions, setPomodoroSessions] = useState<any[]>([])
  const { toast } = useToast()

  const sessionTypes = {
    focus: { duration: 25 * 60, label: 'Focus Time', color: 'bg-red-500' },
    shortBreak: { duration: 5 * 60, label: 'Short Break', color: 'bg-green-500' },
    longBreak: { duration: 15 * 60, label: 'Long Break', color: 'bg-blue-500' }
  }

  const mockTasks = [
    { id: '1', title: 'Design homepage layout', project: 'Website Redesign' },
    { id: '2', title: 'Write API documentation', project: 'Mobile App Development' },
    { id: '3', title: 'Research competitors', project: 'Marketing Campaign' },
    { id: '4', title: 'Update documentation', project: 'Website Redesign' }
  ]

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
    toast({
      title: "Session Complete! 🎉",
      description: `${sessionTypes[sessionType].label} completed${selectedTaskId ? ` for ${mockTasks.find(t => t.id === selectedTaskId)?.title}` : ''}`,
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
      if (sessionType === 'focus' && selectedTaskId) {
        toast({
          title: "Session Started! 🔥",
          description: `Focus session started for ${mockTasks.find(t => t.id === selectedTaskId)?.title}`,
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

  const todaysSessions = [
    { type: 'focus', completed: true, startTime: '09:00' },
    { type: 'shortBreak', completed: true, startTime: '09:25' },
    { type: 'focus', completed: true, startTime: '09:30' },
    { type: 'shortBreak', completed: true, startTime: '09:55' },
    { type: 'focus', completed: false, startTime: '10:00' },
  ]

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Pomodoro Timer</h1>
          <p className="text-gray-600">Stay focused with time-boxed work sessions</p>
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
                   <Select value={selectedTaskId} onValueChange={setSelectedTaskId} disabled={isActive}>
                     <SelectTrigger>
                       <SelectValue placeholder="Select a task (optional)" />
                     </SelectTrigger>
                     <SelectContent>
                       <SelectItem value="">No specific task</SelectItem>
                       {mockTasks.map((task) => (
                         <SelectItem key={task.id} value={task.id}>
                           {task.title}
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
                      stroke="#e5e7eb"
                      strokeWidth="8"
                      fill="none"
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
                    <span className="text-4xl font-mono font-bold text-gray-900">
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

              {/* Session Counter */}
              <div className="text-center">
                <p className="text-sm text-gray-600">Completed Sessions Today</p>
                <p className="text-2xl font-bold text-gray-900">{completedSessions}</p>
              </div>
            </CardContent>
          </Card>
        </div>

                 {/* Stats and History */}
         <div className="space-y-6">
           {/* Today's Sessions */}
           <Card>
             <CardHeader>
               <CardTitle className="text-lg">Today's Sessions</CardTitle>
             </CardHeader>
             <CardContent>
               <div className="space-y-2">
                 {[...todaysSessions, ...pomodoroSessions].map((session, index) => (
                   <div
                     key={index}
                     className={`flex items-center justify-between p-2 rounded ${
                       session.completed ? 'bg-green-50' : 'bg-gray-50'
                     }`}
                   >
                     <div className="flex items-center space-x-2">
                       <div className={`w-3 h-3 rounded-full ${
                         session.type === 'focus' ? 'bg-red-500' :
                         session.type === 'shortBreak' ? 'bg-green-500' :
                         'bg-blue-500'
                       }`}></div>
                       <div className="flex flex-col">
                         <span className="text-sm capitalize">
                           {session.type === 'shortBreak' ? 'Short Break' :
                            session.type === 'longBreak' ? 'Long Break' : 'Focus'}
                         </span>
                         {session.taskId && (
                           <span className="text-xs text-gray-500">
                             {mockTasks.find(t => t.id === session.taskId)?.title}
                           </span>
                         )}
                       </div>
                     </div>
                     <div className="flex items-center space-x-2">
                       <span className="text-xs text-gray-500">{session.startTime || '10:00'}</span>
                       {session.completed && (
                         <CheckCircle2 className="h-4 w-4 text-green-600" />
                       )}
                     </div>
                   </div>
                 ))}
               </div>
             </CardContent>
           </Card>

          {/* Weekly Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">This Week</CardTitle>
            </CardHeader>
                         <CardContent>
               <div className="space-y-4">
                 <div className="flex justify-between">
                   <span className="text-sm text-gray-600">Total Sessions</span>
                   <span className="font-medium">{28 + pomodoroSessions.length}</span>
                 </div>
                 <div className="flex justify-between">
                   <span className="text-sm text-gray-600">Focus Time</span>
                   <span className="font-medium">{Math.floor((11 * 60 + 40 + pomodoroSessions.filter(s => s.type === 'focus').length * 25) / 60)}h {(11 * 60 + 40 + pomodoroSessions.filter(s => s.type === 'focus').length * 25) % 60}m</span>
                 </div>
                 <div className="flex justify-between">
                   <span className="text-sm text-gray-600">Focus Sessions</span>
                   <span className="font-medium">{completedSessions}</span>
                 </div>
                 <div className="flex justify-between">
                   <span className="text-sm text-gray-600">Current Streak</span>
                   <span className="font-medium">12 days</span>
                 </div>
               </div>
             </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
} 