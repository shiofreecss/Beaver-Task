'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus, Calendar, Users, MoreVertical, Pencil, Trash2 } from 'lucide-react'
import { CreateProjectModal } from '@/components/projects/create-project-modal'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { toast } from "@/components/ui/use-toast"

export function ProjectsView() {
  const [projects, setProjects] = useState([
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

  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingProject, setEditingProject] = useState<any>(null)

  const mockOrganizations = [
    { id: '1', name: 'Acme Corporation' },
    { id: '2', name: 'Personal Projects' }
  ]

  const handleCreateProject = (projectData: any) => {
    const newProject = {
      id: Date.now().toString(),
      name: projectData.name,
      description: projectData.description,
      status: projectData.status,
      dueDate: projectData.dueDate,
      progress: 0,
      color: projectData.color
    }
    setProjects(prev => [...prev, newProject])
    setShowCreateModal(false)
    toast({
      title: "Project created",
      description: `${projectData.name} has been created successfully.`,
    })
  }

  const handleEditProject = (projectData: any) => {
    setProjects(prev => prev.map(project => 
      project.id === editingProject.id 
        ? { 
            ...project, 
            name: projectData.name,
            description: projectData.description,
            status: projectData.status,
            dueDate: projectData.dueDate,
            color: projectData.color
          }
        : project
    ))
    setEditingProject(null)
    toast({
      title: "Project updated",
      description: `${projectData.name} has been updated successfully.`,
    })
  }

  const handleDeleteProject = (projectId: string) => {
    const projectToDelete = projects.find(project => project.id === projectId)
    if (!projectToDelete) return

    // Check if project has tasks or notes before deletion
    // This would need to be replaced with actual data check
    const hasDependencies = false
    
    if (hasDependencies) {
      toast({
        title: "Cannot delete project",
        description: "Please remove all tasks and notes from this project before deleting.",
        variant: "destructive"
      })
      return
    }
    
    setProjects(prev => prev.filter(project => project.id !== projectId))
    toast({
      title: "Project deleted",
      description: "The project has been deleted successfully.",
    })
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Projects</h1>
          <p className="text-gray-600">Manage your projects and track progress</p>
        </div>
        <Button onClick={() => setShowCreateModal(true)}>
          <Plus className="mr-2 h-4 w-4" />
          New Project
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((project) => (
          <Card key={project.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`w-12 h-12 rounded-lg ${project.color} flex items-center justify-center`}>
                    <Calendar className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{project.name}</CardTitle>
                    <CardDescription>{project.description}</CardDescription>
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
                      onClick={() => setEditingProject(project)}
                      className="flex items-center"
                    >
                      <Pencil className="mr-2 h-4 w-4" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => handleDeleteProject(project.id)}
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
                <div>
                  <div className="flex justify-between text-sm text-gray-600 mb-1">
                    <span>Progress</span>
                    <span>{project.progress}%</span>
                  </div>
                  <div className="w-full h-2 bg-gray-200 rounded-full">
                    <div
                      className={`h-full rounded-full ${project.color}`}
                      style={{ width: `${project.progress}%` }}
                    />
                  </div>
                </div>
                
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <div className="flex items-center">
                    <Calendar className="mr-1 h-3 w-3" />
                    <span>Due {project.dueDate}</span>
                  </div>
                  <div className="flex items-center">
                    <Users className="mr-1 h-3 w-3" />
                    <span>{project.status}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <CreateProjectModal
        open={showCreateModal}
        onOpenChange={setShowCreateModal}
        onSubmit={handleCreateProject}
        organizations={mockOrganizations}
      />

      <CreateProjectModal
        open={!!editingProject}
        onOpenChange={(open) => !open && setEditingProject(null)}
        onSubmit={handleEditProject}
        organizations={mockOrganizations}
        initialData={editingProject}
      />
    </div>
  )
} 