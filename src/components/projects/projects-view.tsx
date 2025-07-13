'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus, Calendar, Users, MoreVertical, Pencil, Trash2, ChevronRight, Grid3X3, List, Table, Columns } from 'lucide-react'
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
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'

interface ProjectsViewProps {
  organizationId?: string
}

type ViewMode = 'grid' | 'list' | 'table' | 'kanban'

export function ProjectsView({ organizationId }: ProjectsViewProps) {
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingProject, setEditingProject] = useState<any>(null)
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<ViewMode>('grid')

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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PLANNING': return 'bg-blue-500'
      case 'IN_PROGRESS': return 'bg-yellow-500'
      case 'COMPLETED': return 'bg-green-500'
      case 'ON_HOLD': return 'bg-gray-500'
      default: return 'bg-gray-500'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'PLANNING': return 'Planning'
      case 'IN_PROGRESS': return 'In Progress'
      case 'COMPLETED': return 'Completed'
      case 'ON_HOLD': return 'On Hold'
      default: return status
    }
  }

  const viewModeButtons = [
    { mode: 'grid' as ViewMode, icon: Grid3X3, label: 'Grid' },
    { mode: 'list' as ViewMode, icon: List, label: 'List' },
    { mode: 'table' as ViewMode, icon: Table, label: 'Table' },
    { mode: 'kanban' as ViewMode, icon: Columns, label: 'Kanban' }
  ]

  const renderGridView = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {filteredProjects.map((project) => (
        <Card key={project.id} className="cursor-pointer hover:shadow-lg transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div 
                  className="w-4 h-4 rounded-full" 
                  style={{ backgroundColor: project.color || '#6B7280' }}
                />
                <CardTitle className="text-lg">{project.name}</CardTitle>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => setEditingProject(project)}>
                    <Pencil className="mr-2 h-4 w-4" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => handleDeleteProject(project.id)}
                    className="text-destructive"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            {project.description && (
              <CardDescription className="mt-2">{project.description}</CardDescription>
            )}
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Badge variant="secondary" className={`${getStatusColor(project.status)} text-white`}>
                  {getStatusLabel(project.status)}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  {getTaskCount(project.id)} tasks
                </span>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Progress</span>
                  <span>{getCompletionPercentage(project.id)}%</span>
                </div>
                <Progress value={getCompletionPercentage(project.id)} className="h-2" />
              </div>
              {project.dueDate && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>Due {new Date(project.dueDate).toLocaleDateString()}</span>
                </div>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedProjectId(project.id)}
                className="w-full"
              >
                <ChevronRight className="h-4 w-4 mr-2" />
                View Tasks
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )

  const renderListView = () => (
    <div className="space-y-3">
      {filteredProjects.map((project) => (
        <Card key={project.id} className="cursor-pointer hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4 flex-1">
                <div 
                  className="w-4 h-4 rounded-full flex-shrink-0" 
                  style={{ backgroundColor: project.color || '#6B7280' }}
                />
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-lg truncate">{project.name}</h3>
                  {project.description && (
                    <p className="text-sm text-muted-foreground truncate">{project.description}</p>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant="secondary" className={`${getStatusColor(project.status)} text-white`}>
                    {getStatusLabel(project.status)}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    {getTaskCount(project.id)} tasks
                  </span>
                  <div className="w-24">
                    <Progress value={getCompletionPercentage(project.id)} className="h-2" />
                  </div>
                  <span className="text-sm font-medium w-8 text-right">
                    {getCompletionPercentage(project.id)}%
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedProjectId(project.id)}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => setEditingProject(project)}>
                      <Pencil className="mr-2 h-4 w-4" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => handleDeleteProject(project.id)}
                      className="text-destructive"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
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
                <th className="text-left p-4 font-semibold">Project</th>
                <th className="text-left p-4 font-semibold">Status</th>
                <th className="text-left p-4 font-semibold">Progress</th>
                <th className="text-left p-4 font-semibold">Tasks</th>
                <th className="text-left p-4 font-semibold">Due Date</th>
                <th className="text-left p-4 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProjects.map((project) => (
                <tr key={project.id} className="border-b hover:bg-muted/50">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-4 h-4 rounded-full" 
                        style={{ backgroundColor: project.color || '#6B7280' }}
                      />
                      <div>
                        <span className="font-medium">{project.name}</span>
                        {project.description && (
                          <p className="text-sm text-muted-foreground truncate max-w-xs">
                            {project.description}
                          </p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <Badge variant="secondary" className={`${getStatusColor(project.status)} text-white`}>
                      {getStatusLabel(project.status)}
                    </Badge>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <Progress value={getCompletionPercentage(project.id)} className="h-2 w-20" />
                      <span className="text-sm font-medium">
                        {getCompletionPercentage(project.id)}%
                      </span>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="text-sm">{getTaskCount(project.id)} tasks</span>
                  </td>
                  <td className="p-4">
                    {project.dueDate ? (
                      <span className="text-sm">
                        {new Date(project.dueDate).toLocaleDateString()}
                      </span>
                    ) : (
                      <span className="text-sm text-muted-foreground">No due date</span>
                    )}
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedProjectId(project.id)}
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem onClick={() => setEditingProject(project)}>
                            <Pencil className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleDeleteProject(project.id)}
                            className="text-destructive"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )

  const renderKanbanView = () => {
    const statusColumns = [
      { key: 'PLANNING', label: 'Planning', color: 'bg-blue-100 border-blue-300' },
      { key: 'IN_PROGRESS', label: 'In Progress', color: 'bg-yellow-100 border-yellow-300' },
      { key: 'COMPLETED', label: 'Completed', color: 'bg-green-100 border-green-300' },
      { key: 'ON_HOLD', label: 'On Hold', color: 'bg-gray-100 border-gray-300' }
    ]

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statusColumns.map((column) => (
          <div key={column.key} className={`rounded-lg border-2 ${column.color} p-4`}>
            <h3 className="font-semibold mb-4 flex items-center justify-between">
              {column.label}
              <Badge variant="secondary">
                {filteredProjects.filter(p => p.status === column.key).length}
              </Badge>
            </h3>
            <div className="space-y-3">
              {filteredProjects
                .filter(project => project.status === column.key)
                .map((project) => (
                  <Card key={project.id} className="cursor-pointer hover:shadow-md transition-shadow">
                    <CardContent className="p-3">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-3 h-3 rounded-full" 
                            style={{ backgroundColor: project.color || '#6B7280' }}
                          />
                          <h4 className="font-medium text-sm truncate">{project.name}</h4>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                              <MoreVertical className="h-3 w-3" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            <DropdownMenuItem onClick={() => setEditingProject(project)}>
                              <Pencil className="mr-2 h-3 w-3" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleDeleteProject(project.id)}
                              className="text-destructive"
                            >
                              <Trash2 className="mr-2 h-3 w-3" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                      {project.description && (
                        <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                          {project.description}
                        </p>
                      )}
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs">
                          <span>{getTaskCount(project.id)} tasks</span>
                          <span>{getCompletionPercentage(project.id)}%</span>
                        </div>
                        <Progress value={getCompletionPercentage(project.id)} className="h-1" />
                        {project.dueDate && (
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Calendar className="h-3 w-3" />
                            <span>{new Date(project.dueDate).toLocaleDateString()}</span>
                          </div>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedProjectId(project.id)}
                          className="w-full h-6 text-xs"
                        >
                          View Tasks
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          </div>
        ))}
      </div>
    )
  }

  const renderCurrentView = () => {
    switch (viewMode) {
      case 'grid':
        return renderGridView()
      case 'list':
        return renderListView()
      case 'table':
        return renderTableView()
      case 'kanban':
        return renderKanbanView()
      default:
        return renderGridView()
    }
  }

  if (selectedProjectId) {
    const selectedProject = filteredProjects.find(project => project.id === selectedProjectId)
    if (!selectedProject) return null

    return (
      <div className="p-6">
        <div className="flex items-center gap-2 mb-6">
          <Button variant="ghost" onClick={() => setSelectedProjectId(null)}>
            {organizationId ? 'Projects' : 'All Projects'}
          </Button>
          <ChevronRight className="h-4 w-4" />
          <span className="font-semibold">{selectedProject.name}</span>
        </div>
        <TasksView projectId={selectedProjectId} />
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {organizationId ? 'Organization Projects' : 'Projects'}
          </h1>
          <p className="text-muted-foreground">
            Manage your projects and track their progress
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
            New Project
          </Button>
        </div>
      </div>

      {filteredProjects.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <div className="mx-auto h-12 w-12 text-muted-foreground mb-4">📁</div>
            <h3 className="text-lg font-semibold mb-2">No projects yet</h3>
            <p className="text-muted-foreground mb-4">
              Create your first project to get started
            </p>
            <Button onClick={() => setShowCreateModal(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Create Project
            </Button>
          </CardContent>
        </Card>
      ) : (
        renderCurrentView()
      )}

      <CreateProjectModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreateProject}
        organizationId={organizationId}
      />

      {editingProject && (
        <CreateProjectModal
          isOpen={true}
          onClose={() => setEditingProject(null)}
          onSubmit={handleEditProject}
          initialData={editingProject}
          organizationId={organizationId}
        />
      )}
    </div>
  )
} 