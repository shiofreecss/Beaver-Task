'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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

type ViewMode = 'grid' | 'list' | 'table'

export function HabitsView() {
  const [habits, setHabits] = useState([
    {
      id: '1',
      name: 'Morning Exercise',
      description: '30 minutes of cardio or strength training',
      streak: 12,
      completedToday: true,
      weeklyProgress: [true, true, false, true, true, true, false],
      completionRate: 85
    },
    {
      id: '2',
      name: 'Read for 30 minutes',
      description: 'Read books, articles, or educational content',
      streak: 8,
      completedToday: false,
      weeklyProgress: [true, true, true, false, true, true, true],
      completionRate: 78
    },
    {
      id: '3',
      name: 'Drink 8 glasses of water',
      description: 'Stay hydrated throughout the day',
      streak: 5,
      completedToday: true,
      weeklyProgress: [false, true, true, true, true, true, false],
      completionRate: 71
    },
    {
      id: '4',
      name: 'Meditation',
      description: '10 minutes of mindfulness practice',
      streak: 15,
      completedToday: false,
      weeklyProgress: [true, true, true, true, false, true, true],
      completionRate: 92
    }
  ])

  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingHabit, setEditingHabit] = useState<any>(null)
  const [viewMode, setViewMode] = useState<ViewMode>('grid')

  const handleCreateHabit = (habitData: any) => {
    const newHabit = {
      id: Date.now().toString(),
      name: habitData.name,
      description: habitData.description,
      streak: 0,
      completedToday: false,
      weeklyProgress: [false, false, false, false, false, false, false],
      completionRate: 0
    }
    setHabits([newHabit, ...habits])
    setShowCreateModal(false)
    toast({
      title: "Habit created",
      description: `${habitData.name} has been created successfully.`,
    })
  }

  const handleEditHabit = (habitData: any) => {
    if (!editingHabit) return
    
    setHabits(habits.map(habit => 
      habit.id === editingHabit.id 
        ? {
            ...habit,
            name: habitData.name,
            description: habitData.description
          }
        : habit
    ))
    setEditingHabit(null)
    toast({
      title: "Habit updated",
      description: `${habitData.name} has been updated successfully.`,
    })
  }

  const handleDeleteHabit = (habitId: string) => {
    setHabits(habits.filter(habit => habit.id !== habitId))
    toast({
      title: "Habit deleted",
      description: "The habit has been deleted successfully.",
    })
  }

  const toggleHabit = (habitId: string) => {
    setHabits(habits.map(habit => 
      habit.id === habitId 
        ? {
            ...habit,
            completedToday: !habit.completedToday,
            streak: !habit.completedToday ? habit.streak + 1 : Math.max(0, habit.streak - 1)
          }
        : habit
    ))
    
    const habit = habits.find(h => h.id === habitId)
    if (habit) {
      toast({
        title: `Habit ${!habit.completedToday ? 'completed' : 'unchecked'}`,
        description: `${habit.name} has been ${!habit.completedToday ? 'marked as complete' : 'unchecked'} for today.`,
      })
    }
  }

  const getDaysOfWeek = () => ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

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
                  onClick={() => toggleHabit(habit.id)}
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
                  onClick={() => toggleHabit(habit.id)}
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
                      onClick={() => toggleHabit(habit.id)}
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
          <p className="text-muted-foreground">
            Build and track your daily habits
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
          <Button onClick={() => setShowCreateModal(true)}>
            <Plus className="mr-2 h-4 w-4" />
            New Habit
          </Button>
        </div>
      </div>

      {habits.length === 0 ? (
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

      {/* Create/Edit Modal Placeholder */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md mx-4">
            <CardHeader>
              <CardTitle>Create New Habit</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">Name</label>
                <Input placeholder="Enter habit name" />
              </div>
              <div>
                <label className="text-sm font-medium">Description</label>
                <Input placeholder="Enter habit description" />
              </div>
              <div className="flex gap-2 pt-4">
                <Button 
                  variant="outline" 
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={() => {
                    handleCreateHabit({
                      name: 'New Habit',
                      description: 'Sample description'
                    })
                  }}
                  className="flex-1"
                >
                  Create
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {editingHabit && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md mx-4">
            <CardHeader>
              <CardTitle>Edit Habit</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">Name</label>
                <Input defaultValue={editingHabit.name} />
              </div>
              <div>
                <label className="text-sm font-medium">Description</label>
                <Input defaultValue={editingHabit.description} />
              </div>
              <div className="flex gap-2 pt-4">
                <Button 
                  variant="outline" 
                  onClick={() => setEditingHabit(null)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={() => {
                    handleEditHabit({
                      name: editingHabit.name,
                      description: editingHabit.description
                    })
                  }}
                  className="flex-1"
                >
                  Update
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
} 