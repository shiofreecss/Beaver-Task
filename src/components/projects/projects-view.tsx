'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus, Calendar, Users, MoreVertical, Pencil, Trash2, ChevronRight } from 'lucide-react'
import { CreateProjectModal } from '@/components/projects/create-project-modal'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { toast } from "@/components/ui/use-toast"
import { useProjectStore } from '@/store/projects'
import { useTaskStore } from '@/store/tasks'
import { useOrganizationStore } from '@/store/organizations'
import { TasksView } from '@/components/tasks/tasks-view'

interface ProjectsViewProps {
  organizationId?: string
}

export function ProjectsView({ organizationId }: ProjectsViewProps) {
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingProject, setEditingProject] = useState<any>(null)
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null)

  // Get projects, tasks, and organizations from stores
  const projects = useProjectStore((state) => state.projects)
  const addProject = useProjectStore((state) => state.addProject)
  const updateProject = useProjectStore((state) => state.updateProject)
  const deleteProject = useProjectStore((state) => state.deleteProject)
  const tasks = useTaskStore((state) => state.tasks)
  const organizations = useOrganizationStore((state) => state.organizations)

  // Filter projects by organization if organizationId is provided
  const filteredProjects = organizationId 
    ? projects.filter(project => project.organizationId === organizationId)
    : projects

  const handleCreateProject = (projectData: any) => {
    addProject({
      name: projectData.name,
      description: projectData.description,
      status: projectData.status,
      dueDate: projectData.dueDate,
      color: projectData.color,
      progress: 0,
      organizationId: organizationId || projectData.organizationId
    })
    setShowCreateModal(false)
    toast({
      title: "Project created",
      description: `${projectData.name} has been created successfully.`,
    })
  }

  const handleEditProject = (projectData: any) => {
    if (!editingProject) return
    
    updateProject(editingProject.id, {
      name: projectData.name,
      description: projectData.description,
      status: projectData.status,
      dueDate: projectData.dueDate,
      color: projectData.color,
      organizationId: organizationId || projectData.organizationId
    })
    setEditingProject(null)
    toast({
      title: "Project updated",
      description: `${projectData.name} has been updated successfully.`,
    })
  }

  const handleDeleteProject = (projectId: string) => {
    // Check if project has tasks
    const hasTasks = tasks.some(task => task.projectId === projectId)
    
    if (hasTasks) {
      toast({
        title: "Cannot delete project",
        description: "Please remove or reassign all tasks before deleting this project.",
        variant: "destructive"
      })
      return
    }
    
    deleteProject(projectId)
    setSelectedProjectId(null)
    toast({
      title: "Project deleted",
      description: "The project has been deleted successfully.",
    })
  }

  // Get task count for a project
  const getTaskCount = (projectId: string) => {
    return tasks.filter(task => task.projectId === projectId).length
  }

  // Get completion percentage for a project
  const getCompletionPercentage = (projectId: string) => {
    const projectTasks = tasks.filter(task => task.projectId === projectId)
    if (projectTasks.length === 0) return 0
    
    const completedTasks = projectTasks.filter(task => task.status === 'COMPLETED')
    return Math.round((completedTasks.length / projectTasks.length) * 100)
  }

  if (selectedProjectId) {
    const selectedProject = projects.find(project => project.id === selectedProjectId)
    if (!selectedProject) return null

    return (
      <div className="p-6">
        <div className="flex items-center gap-2 mb-6">
          {organizationId && (
            <>
              <Button variant="ghost" onClick={() => setSelectedProjectId(null)}>
                Projects
              </Button>
              <ChevronRight className="h-4 w-4" />
              <span className="font-semibold">{selectedProject.name}</span>
            </>
          )}
        </div>
        <TasksView projectId={selectedProjectId} />
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Projects</h1>
          <p className="text-muted-foreground">Manage your projects and track progress</p>
        </div>
        <Button onClick={() => setShowCreateModal(true)}>
          <Plus className="mr-2 h-4 w-4" />
          New Project
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProjects.map((project) => {
          const completionPercentage = getCompletionPercentage(project.id)
          return (
            <Card 
              key={project.id} 
              className="hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => setSelectedProjectId(project.id)}
            >
              <CardHeader className="flex flex-row items-start justify-between space-y-0">
                <div className="space-y-1">
                  <CardTitle className="text-xl" style={{ color: project.color }}>
                    {project.name}
                  </CardTitle>
                  {project.description && (
                    <CardDescription>{project.description}</CardDescription>
                  )}
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem 
                      onClick={(e) => {
                        e.stopPropagation()
                        setEditingProject(project)
                      }}
                      className="flex items-center"
                    >
                      <Pencil className="mr-2 h-4 w-4" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDeleteProject(project.id)
                      }}
                      className="flex items-center text-red-600"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </CardHeader>

              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>Progress</span>
                      <span>{completionPercentage}%</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-primary" 
                        style={{ width: `${completionPercentage}%` }}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-foreground">{getTaskCount(project.id)}</p>
                      <p className="text-sm text-muted-foreground">Tasks</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-foreground capitalize">
                        {project.status.toLowerCase().replace('_', ' ')}
                      </p>
                      <p className="text-sm text-muted-foreground">Status</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    {project.dueDate && (
                      <div className="flex items-center">
                        <Calendar className="mr-1 h-3 w-3" />
                        <span>Due {new Date(project.dueDate).toLocaleDateString()}</span>
                      </div>
                    )}
                    <div className="flex items-center">
                      <Users className="mr-1 h-3 w-3" />
                      <span>1 Member</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <CreateProjectModal
        open={showCreateModal}
        onOpenChange={setShowCreateModal}
        onSubmit={handleCreateProject}
        organizations={organizations}
        initialData={undefined}
      />

      <CreateProjectModal
        open={!!editingProject}
        onOpenChange={(open) => !open && setEditingProject(null)}
        onSubmit={handleEditProject}
        organizations={organizations}
        initialData={editingProject}
      />
    </div>
  )
} 