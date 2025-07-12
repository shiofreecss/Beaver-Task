'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus, Circle, CheckCircle2, Clock, Calendar } from 'lucide-react'

export function TasksView() {
  const [tasks, setTasks] = useState([
    {
      id: '1',
      title: 'Design homepage layout',
      description: 'Create wireframes and mockups for the new homepage',
      status: 'completed',
      priority: 'high',
      dueDate: '2024-01-20',
      project: 'Website Redesign'
    },
    {
      id: '2',
      title: 'Set up development environment',
      description: 'Configure local development setup for the mobile app',
      status: 'in-progress',
      priority: 'medium',
      dueDate: '2024-01-22',
      project: 'Mobile App Development'
    },
    {
      id: '3',
      title: 'Research competitors',
      description: 'Analyze competitor strategies and positioning',
      status: 'todo',
      priority: 'low',
      dueDate: '2024-01-25',
      project: 'Marketing Campaign'
    },
    {
      id: '4',
      title: 'Write API documentation',
      description: 'Document all endpoints and authentication methods',
      status: 'todo',
      priority: 'high',
      dueDate: '2024-01-24',
      project: 'Mobile App Development'
    }
  ])

  const toggleTask = (taskId: string) => {
    setTasks(prev => prev.map(task => 
      task.id === taskId 
        ? { ...task, status: task.status === 'completed' ? 'todo' : 'completed' }
        : task
    ))
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'border-l-red-500 bg-red-50'
      case 'medium': return 'border-l-yellow-500 bg-yellow-50'
      case 'low': return 'border-l-green-500 bg-green-50'
      default: return 'border-l-gray-500 bg-gray-50'
    }
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tasks</h1>
          <p className="text-gray-600">Manage and track your tasks</p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          New Task
        </Button>
      </div>

      <div className="space-y-4">
        {tasks.map((task) => (
          <Card key={task.id} className={`border-l-4 ${getPriorityColor(task.priority)}`}>
            <CardContent className="p-4">
              <div className="flex items-start space-x-4">
                <button
                  onClick={() => toggleTask(task.id)}
                  className="mt-1"
                >
                  {task.status === 'completed' ? (
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                  ) : (
                    <Circle className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  )}
                </button>
                
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className={`font-medium ${
                      task.status === 'completed' ? 'line-through text-gray-500' : 'text-gray-900'
                    }`}>
                      {task.title}
                    </h3>
                    
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        task.priority === 'high' ? 'bg-red-100 text-red-800' :
                        task.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {task.priority}
                      </span>
                      
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        task.status === 'completed' ? 'bg-green-100 text-green-800' :
                        task.status === 'in-progress' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {task.status.replace('-', ' ')}
                      </span>
                    </div>
                  </div>
                  
                  <p className="text-sm text-gray-600 mt-1">{task.description}</p>
                  
                  <div className="flex items-center justify-between mt-3 text-sm text-gray-500">
                    <span className="bg-gray-100 px-2 py-1 rounded text-xs">
                      {task.project}
                    </span>
                    
                    <div className="flex items-center">
                      <Calendar className="mr-1 h-3 w-3" />
                      {task.dueDate}
                    </div>
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