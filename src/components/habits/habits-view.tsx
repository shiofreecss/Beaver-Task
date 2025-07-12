'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Plus, CheckCircle2, Circle, Flame, Calendar, MoreVertical, Pencil, Trash2 } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { toast } from "@/components/ui/use-toast"

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
    setHabits(prev => [...prev, newHabit])
    setShowCreateModal(false)
    toast({
      title: "Habit created",
      description: `${habitData.name} has been created successfully.`,
    })
  }

  const handleEditHabit = (habitData: any) => {
    setHabits(prev => prev.map(habit => 
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
    const habitToDelete = habits.find(habit => habit.id === habitId)
    if (!habitToDelete) return

    setHabits(prev => prev.filter(habit => habit.id !== habitId))
    toast({
      title: "Habit deleted",
      description: "The habit has been deleted successfully.",
    })
  }

  const toggleHabitCompletion = (habitId: string) => {
    setHabits(prev => prev.map(habit => 
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
        title: habit.completedToday ? "Habit unchecked" : "Habit completed",
        description: `${habit.name} has been ${habit.completedToday ? 'unchecked' : 'marked as complete'}.`,
      })
    }
  }

  const getDaysOfWeek = () => ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Habits</h1>
          <p className="text-muted-foreground">Build and track your daily habits</p>
        </div>
        <Button onClick={() => setShowCreateModal(true)}>
          <Plus className="mr-2 h-4 w-4" />
          New Habit
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {habits.map((habit) => (
          <Card key={habit.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3">
                  <button
                    onClick={() => toggleHabitCompletion(habit.id)}
                    className="mt-1"
                  >
                    {habit.completedToday ? (
                      <CheckCircle2 className="h-6 w-6 text-green-500" />
                    ) : (
                      <Circle className="h-6 w-6 text-muted-foreground hover:text-foreground" />
                    )}
                  </button>
                  <div>
                    <CardTitle className="text-lg">{habit.name}</CardTitle>
                    <CardDescription>{habit.description}</CardDescription>
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem 
                      onClick={() => setEditingHabit(habit)}
                      className="flex items-center"
                    >
                      <Pencil className="mr-2 h-4 w-4" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => handleDeleteHabit(habit.id)}
                      className="flex items-center text-red-600"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Streak */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Flame className="h-4 w-4 text-orange-500" />
                    <span className="text-sm font-medium">Streak</span>
                  </div>
                  <span className="text-lg font-bold text-orange-500">{habit.streak} days</span>
                </div>

                {/* Weekly Progress */}
                <div>
                  <div className="flex items-center space-x-2 mb-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">This Week</span>
                  </div>
                  <div className="grid grid-cols-7 gap-1">
                    {getDaysOfWeek().map((day, index) => (
                      <div key={day} className="text-center">
                        <div className="text-xs text-muted-foreground mb-1">{day}</div>
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                          habit.weeklyProgress[index] 
                            ? 'bg-green-500' 
                            : 'bg-muted'
                        }`}>
                          {habit.weeklyProgress[index] && (
                            <CheckCircle2 className="h-3 w-3 text-white" />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Completion Rate */}
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Completion Rate</span>
                    <span className="font-medium">{habit.completionRate}%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className="bg-green-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${habit.completionRate}%` }}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Create/Edit Habit Modal */}
      {(showCreateModal || editingHabit) && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-card p-6 rounded-lg w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold mb-4">
              {editingHabit ? 'Edit Habit' : 'Create New Habit'}
            </h3>
            <form onSubmit={(e) => {
              e.preventDefault()
              const formData = new FormData(e.target as HTMLFormElement)
              const habitData = {
                name: formData.get('name') as string,
                description: formData.get('description') as string
              }
              if (editingHabit) {
                handleEditHabit(habitData)
              } else {
                handleCreateHabit(habitData)
              }
            }}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Name</label>
                  <Input
                    name="name"
                    defaultValue={editingHabit?.name || ''}
                    placeholder="Enter habit name"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Description</label>
                  <Input
                    name="description"
                    defaultValue={editingHabit?.description || ''}
                    placeholder="Enter habit description"
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-2 mt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowCreateModal(false)
                    setEditingHabit(null)
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit">
                  {editingHabit ? 'Save Changes' : 'Create Habit'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
} 