'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus, CheckCircle2, Circle, Flame, Calendar, MoreVertical, Pencil, Trash2, Grid3X3, List, Table, Target } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { toast } from "@/components/ui/use-toast"
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { CreateHabitModal } from './create-habit-modal'

type ViewMode = 'grid' | 'list' | 'table'

interface HabitEntry {
  id: string
  date: string
  completed: boolean
  habitId: string
}

interface Habit {
  id: string
  name: string
  description?: string
  frequency: string
  target: number
  color?: string
  customDays?: number[]
  customPeriod?: string
  completedToday: boolean
  streak: number
  completionRate: number
  weeklyProgress: boolean[]
  entries?: HabitEntry[]
}

interface HabitFormData {
  name: string
  description?: string
  frequency: string
  target: number
  color?: string
  customDays?: number[]
  customPeriod?: string
}

export function HabitsView() {
  const [habits, setHabits] = useState<Habit[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null)
  const [viewMode, setViewMode] = useState<ViewMode>('grid')

  useEffect(() => {
    fetchHabits()
  }, [])

  const fetchHabits = async () => {
    try {
      const response = await fetch('/api/habits-convex')
      if (!response.ok) throw new Error('Failed to fetch habits')
      const data = await response.json()
      setHabits(data)
    } catch (error) {
      console.error('Error fetching habits:', error)
      toast({
        title: "Error",
        description: "Failed to load habits. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateHabit = async (habitData: HabitFormData) => {
    try {
      const response = await fetch('/api/habits-convex', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(habitData)
      })

      if (!response.ok) throw new Error('Failed to create habit')
      
      const newHabit = await response.json()
      setHabits([newHabit, ...habits])
      toast({
        title: "Success",
        description: `${habitData.name} has been created successfully.`,
      })
    } catch (error) {
      console.error('Error creating habit:', error)
      toast({
        title: "Error",
        description: "Failed to create habit. Please try again.",
        variant: "destructive"
      })
      throw error
    }
  }

  const handleUpdateHabit = async (habitData: HabitFormData) => {
    if (!editingHabit) return

    try {
      const response = await fetch('/api/habits-convex', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingHabit.id,
          ...habitData
        })
      })

      if (!response.ok) throw new Error('Failed to update habit')
      
      const updatedHabit = await response.json()
      setHabits(habits.map(habit => 
        habit.id === editingHabit.id ? updatedHabit : habit
      ))
      toast({
        title: "Success",
        description: `${habitData.name} has been updated successfully.`,
      })
    } catch (error) {
      console.error('Error updating habit:', error)
      toast({
        title: "Error",
        description: "Failed to update habit. Please try again.",
        variant: "destructive"
      })
      throw error
    }
  }

  const handleDeleteHabit = async (habitId: string) => {
    try {
      const response = await fetch(`/api/habits-convex?id=${habitId}`, {
        method: 'DELETE'
      })

      if (!response.ok) throw new Error('Failed to delete habit')
      
      setHabits(habits.filter(habit => habit.id !== habitId))
      toast({
        title: "Success",
        description: "Habit has been deleted successfully.",
      })
    } catch (error) {
      console.error('Error deleting habit:', error)
      toast({
        title: "Error",
        description: "Failed to delete habit. Please try again.",
        variant: "destructive"
      })
    }
  }

  const handleToggleCompletion = async (habitId: string, completed: boolean) => {
    try {
      const response = await fetch('/api/habits-convex', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: habitId,
          completed
        })
      })

      if (!response.ok) throw new Error('Failed to update habit')
      
      const updatedHabit = await response.json()
      setHabits(habits.map(habit => 
        habit.id === habitId ? updatedHabit : habit
      ))
    } catch (error) {
      console.error('Error toggling habit completion:', error)
      toast({
        title: "Error",
        description: "Failed to update habit. Please try again.",
        variant: "destructive"
      })
    }
  }

  const getDaysOfWeek = () => ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  const getFrequencyDisplay = (habit: Habit) => {
    if (habit.frequency === 'CUSTOM' && habit.customDays && habit.customDays.length > 0) {
      const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
      const selectedDays = habit.customDays.map(day => dayNames[day]).join(', ')
      const periodMap = {
        'WEEKLY': 'every week',
        'BIWEEKLY': 'every 2 weeks',
        'MONTHLY': 'monthly',
        'ANNUALLY': 'annually'
      }
      const period = habit.customPeriod ? periodMap[habit.customPeriod as keyof typeof periodMap] : 'every week'
      return `Custom (${selectedDays} ${period})`
    }
    
    const frequencyMap = {
      'DAILY': 'Daily',
      'WEEKLY': 'Weekly',
      'MONTHLY': 'Monthly',
      'CUSTOM': 'Custom'
    }
    return frequencyMap[habit.frequency as keyof typeof frequencyMap] || habit.frequency
  }

  const viewModeButtons = [
    { mode: 'grid' as ViewMode, icon: Grid3X3, label: 'Grid' },
    { mode: 'list' as ViewMode, icon: List, label: 'List' },
    { mode: 'table' as ViewMode, icon: Table, label: 'Table' }
  ]

  const renderGridView = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {habits.map((habit) => (
        <Card key={habit.id} className="cursor-pointer hover:shadow-lg transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleToggleCompletion(habit.id, !habit.completedToday)}
                  className="p-0 h-6 w-6"
                >
                  {habit.completedToday ? (
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                  ) : (
                    <Circle className="h-5 w-5 text-gray-400" />
                  )}
                </Button>
                <CardTitle className="text-lg">{habit.name}</CardTitle>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => setEditingHabit(habit)}>
                    <Pencil className="mr-2 h-4 w-4" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => handleDeleteHabit(habit.id)}
                    className="text-destructive"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            {habit.description && (
              <CardDescription className="mt-2">{habit.description}</CardDescription>
            )}
            <div className="flex items-center gap-2 mt-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                {getFrequencyDisplay(habit)} • {habit.target} time{habit.target > 1 ? 's' : ''}
              </span>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Flame className="h-4 w-4 text-orange-500" />
                  <span className="text-sm font-medium">{habit.streak} day streak</span>
                </div>
                <Badge variant="secondary">
                  {habit.completionRate}% complete
                </Badge>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Weekly Progress</span>
                  <span>{habit.weeklyProgress.filter(Boolean).length}/7 days</span>
                </div>
                <Progress value={(habit.weeklyProgress.filter(Boolean).length / 7) * 100} className="h-2" />
              </div>

              <div className="grid grid-cols-7 gap-1">
                {getDaysOfWeek().map((day, index) => (
                  <div key={day} className="text-center">
                    <div className="text-xs text-muted-foreground mb-1">{day}</div>
                    <div 
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                        habit.weeklyProgress[index] 
                          ? 'bg-green-500 text-white' 
                          : 'bg-gray-200 text-gray-500'
                      }`}
                    >
                      {habit.weeklyProgress[index] ? '✓' : '○'}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )

  const renderListView = () => (
    <div className="space-y-3">
      {habits.map((habit) => (
        <Card key={habit.id} className="cursor-pointer hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4 flex-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleToggleCompletion(habit.id, !habit.completedToday)}
                  className="p-0 h-6 w-6 flex-shrink-0"
                >
                  {habit.completedToday ? (
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                  ) : (
                    <Circle className="h-5 w-5 text-gray-400" />
                  )}
                </Button>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-lg truncate">{habit.name}</h3>
                  {habit.description && (
                    <p className="text-sm text-muted-foreground truncate">{habit.description}</p>
                  )}
                  <div className="flex items-center gap-2 mt-1">
                    <Calendar className="h-3 w-3 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">
                      {getFrequencyDisplay(habit)} • {habit.target} time{habit.target > 1 ? 's' : ''}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Flame className="h-4 w-4 text-orange-500" />
                    <span className="text-sm font-medium">{habit.streak} days</span>
                  </div>
                  <div className="w-24">
                    <Progress value={habit.completionRate} className="h-2" />
                  </div>
                  <span className="text-sm font-medium w-8 text-right">
                    {habit.completionRate}%
                  </span>
                  <div className="flex gap-1">
                    {habit.weeklyProgress.map((completed, index) => (
                      <div 
                        key={index}
                        className={`w-3 h-3 rounded-full ${
                          completed ? 'bg-green-500' : 'bg-gray-200'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => setEditingHabit(habit)}>
                    <Pencil className="mr-2 h-4 w-4" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => handleDeleteHabit(habit.id)}
                    className="text-destructive"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )

  const renderTableView = () => (
    <Card>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b">
              <tr>
                <th className="text-left p-4 font-semibold">Habit</th>
                <th className="text-left p-4 font-semibold">Streak</th>
                <th className="text-left p-4 font-semibold">Completion Rate</th>
                <th className="text-left p-4 font-semibold">Weekly Progress</th>
                <th className="text-left p-4 font-semibold">Today</th>
                <th className="text-left p-4 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {habits.map((habit) => (
                <tr key={habit.id} className="border-b hover:bg-muted/50">
                  <td className="p-4">
                    <div>
                      <span className="font-medium">{habit.name}</span>
                      {habit.description && (
                        <p className="text-sm text-muted-foreground truncate max-w-xs">
                          {habit.description}
                        </p>
                      )}
                      <div className="flex items-center gap-2 mt-1">
                        <Calendar className="h-3 w-3 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">
                          {getFrequencyDisplay(habit)} • {habit.target} time{habit.target > 1 ? 's' : ''}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <Flame className="h-4 w-4 text-orange-500" />
                      <span className="font-medium">{habit.streak} days</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <Progress value={habit.completionRate} className="h-2 w-20" />
                      <span className="text-sm font-medium">
                        {habit.completionRate}%
                      </span>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex gap-1">
                      {habit.weeklyProgress.map((completed, index) => (
                        <div 
                          key={index}
                          className={`w-4 h-4 rounded-full flex items-center justify-center text-xs ${
                            completed 
                              ? 'bg-green-500 text-white' 
                              : 'bg-gray-200 text-gray-500'
                          }`}
                        >
                          {completed ? '✓' : '○'}
                        </div>
                      ))}
                    </div>
                  </td>
                  <td className="p-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleToggleCompletion(habit.id, !habit.completedToday)}
                      className="p-0 h-6 w-6"
                    >
                      {habit.completedToday ? (
                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                      ) : (
                        <Circle className="h-5 w-5 text-gray-400" />
                      )}
                    </Button>
                  </td>
                  <td className="p-4">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem onClick={() => setEditingHabit(habit)}>
                          <Pencil className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => handleDeleteHabit(habit.id)}
                          className="text-destructive"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )

  const renderCurrentView = () => {
    switch (viewMode) {
      case 'grid':
        return renderGridView()
      case 'list':
        return renderListView()
      case 'table':
        return renderTableView()
      default:
        return renderGridView()
    }
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Habits</h1>
        </div>
        <div className="flex items-center gap-2">
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
          <Button onClick={() => setShowCreateModal(true)}>
            <Plus className="mr-2 h-4 w-4" />
            New Habit
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : habits.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <Target className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No habits yet</h3>
            <p className="text-muted-foreground mb-4">
              Create your first habit to start building positive routines
            </p>
            <Button onClick={() => setShowCreateModal(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Create Habit
            </Button>
          </CardContent>
        </Card>
      ) : (
        renderCurrentView()
      )}

      <CreateHabitModal
        open={showCreateModal || editingHabit !== null}
        onOpenChange={(open) => {
          setShowCreateModal(open)
          if (!open) setEditingHabit(null)
        }}
        onSubmit={editingHabit ? handleUpdateHabit : handleCreateHabit}
        habit={editingHabit || undefined}
      />
    </div>
  )
} 