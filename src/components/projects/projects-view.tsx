'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus, Calendar, Users, MoreVertical } from 'lucide-react'

export function ProjectsView() {
  const [projects] = useState([
    {
      id: '1',
      name: 'Website Redesign',
      description: 'Complete overhaul of company website',
      status: 'In Progress',
      dueDate: '2024-02-15',
      progress: 65,
      color: 'bg-blue-500'
    },
    {
      id: '2',
      name: 'Mobile App Development',
      description: 'Native iOS and Android application',
      status: 'Planning',
      dueDate: '2024-03-30',
      progress: 25,
      color: 'bg-green-500'
    },
    {
      id: '3',
      name: 'Marketing Campaign',
      description: 'Q1 digital marketing strategy',
      status: 'Active',
      dueDate: '2024-01-31',
      progress: 80,
      color: 'bg-purple-500'
    }
  ])

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Projects</h1>
          <p className="text-gray-600">Manage your projects and track progress</p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          New Project
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((project) => (
          <Card key={project.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className={`w-4 h-4 rounded-full ${project.color}`}></div>
                <Button variant="ghost" size="sm">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </div>
              <CardTitle className="text-lg">{project.name}</CardTitle>
              <CardDescription>{project.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Progress</span>
                  <span className="font-medium">{project.progress}%</span>
                </div>
                
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${project.color}`}
                    style={{ width: `${project.progress}%` }}
                  ></div>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center text-gray-600">
                    <Calendar className="mr-1 h-3 w-3" />
                    Due {project.dueDate}
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    project.status === 'Active' ? 'bg-green-100 text-green-800' :
                    project.status === 'In Progress' ? 'bg-blue-100 text-blue-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {project.status}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
} 