'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus, CheckCircle2, Circle, Target, TrendingUp } from 'lucide-react'

export function HabitsView() {
  const [habits, setHabits] = useState([
    {
      id: '1',
      name: 'Morning Exercise',
      description: '30 minutes of physical activity',
      frequency: 'daily',
      target: 1,
      completed: true,
      streak: 12,
      color: 'bg-green-500'
    },
    {
      id: '2',
      name: 'Read for 30 minutes',
      description: 'Read books or articles',
      frequency: 'daily',
      target: 1,
      completed: false,
      streak: 8,
      color: 'bg-blue-500'
    },
    {
      id: '3',
      name: 'Meditation',
      description: '10 minutes of mindfulness',
      frequency: 'daily',
      target: 1,
      completed: false,
      streak: 5,
      color: 'bg-purple-500'
    },
    {
      id: '4',
      name: 'Drink 8 glasses of water',
      description: 'Stay hydrated throughout the day',
      frequency: 'daily',
      target: 8,
      completed: false,
      streak: 15,
      color: 'bg-cyan-500'
    }
  ])

  const toggleHabit = (habitId: string) => {
    setHabits(prev => prev.map(habit => 
      habit.id === habitId 
        ? { ...habit, completed: !habit.completed }
        : habit
    ))
  }

  const weekDays = ['M', 'T', 'W', 'T', 'F', 'S', 'S']

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Habits</h1>
          <p className="text-gray-600">Build better habits and track your progress</p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          New Habit
        </Button>
      </div>

      {/* Today's Progress */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Target className="mr-2 h-5 w-5" />
            Today's Progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <span className="text-2xl font-bold">
              {habits.filter(h => h.completed).length}/{habits.length}
            </span>
            <span className="text-sm text-gray-600">Habits Completed</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div 
              className="bg-green-500 h-3 rounded-full transition-all"
              style={{ width: `${(habits.filter(h => h.completed).length / habits.length) * 100}%` }}
            ></div>
          </div>
        </CardContent>
      </Card>

      {/* Habits List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {habits.map((habit) => (
          <Card key={habit.id} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start space-x-3">
                  <button
                    onClick={() => toggleHabit(habit.id)}
                    className="mt-1"
                  >
                    {habit.completed ? (
                      <CheckCircle2 className="h-6 w-6 text-green-600" />
                    ) : (
                      <Circle className="h-6 w-6 text-gray-400 hover:text-gray-600" />
                    )}
                  </button>
                  
                  <div>
                    <h3 className={`font-medium ${
                      habit.completed ? 'line-through text-gray-500' : 'text-gray-900'
                    }`}>
                      {habit.name}
                    </h3>
                    <p className="text-sm text-gray-600">{habit.description}</p>
                  </div>
                </div>
                
                <div className={`w-4 h-4 rounded-full ${habit.color}`}></div>
              </div>

              {/* Streak and Stats */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="h-4 w-4 text-orange-500" />
                    <span className="text-sm text-gray-600">
                      {habit.streak} day streak
                    </span>
                  </div>
                  <span className="text-xs text-gray-500 uppercase">
                    {habit.frequency}
                  </span>
                </div>

                {/* Week Progress */}
                <div>
                  <div className="flex justify-between text-xs text-gray-500 mb-1">
                    <span>This Week</span>
                    <span>5/7 days</span>
                  </div>
                  <div className="flex space-x-1">
                    {weekDays.map((day, index) => (
                      <div
                        key={index}
                        className={`flex-1 h-8 rounded flex items-center justify-center text-xs ${
                          index < 5 ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-400'
                        }`}
                      >
                        {day}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
} 