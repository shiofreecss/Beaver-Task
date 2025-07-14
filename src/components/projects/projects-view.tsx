'use client'

import { useState, useEffect } from 'react'
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
import { useProjectStore, PROJECT_STATUS_COLORS, PROJECT_STATUS_LABELS } from '@/store/projects'
import { useTaskStore } from '@/store/tasks'
import { useOrganizationStore } from '@/store/organizations'
import { TasksView } from '@/components/tasks/tasks-view'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { getTailwindColor } from '@/lib/utils'
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd'

interface ProjectsViewProps {
  organizationId?: string
}

type ViewMode = 'grid' | 'list' | 'table' | 'kanban'

export function ProjectsView({ organizationId }: ProjectsViewProps) {
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingProject, setEditingProject] = useState<any>(null)
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const [isLoading, setIsLoading] = useState(true)

  // Get projects, tasks, and organizations from stores
  const projects = useProjectStore((state) => state.projects)
  const fetchProjects = useProjectStore((state) => state.fetchProjects)
  const addProject = useProjectStore((state) => state.addProject)
  const updateProject = useProjectStore((state) => state.updateProject)
  const deleteProject = useProjectStore((state) => state.deleteProject)
  const tasks = useTaskStore((state) => state.tasks)
  const organizations = useOrganizationStore((state) => state.organizations)

  useEffect(() => {
    const loadData = async () => {
      try {
        await fetchProjects()
      } catch (error) {
        console.error('Failed to fetch projects:', error)
        toast({
          title: "Error",
          description: "Failed to load projects. Please try again.",
          variant: "destructive"
        })
      } finally {
        setIsLoading(false)
      }
    }
    loadData()
  }, [fetchProjects])

  // Filter projects by organization if organizationId is provided
  const filteredProjects = organizationId 
    ? projects.filter(project => project.organizationId === organizationId)
    : projects

  const handleCreateProject = async (projectData: any) => {
    try {
      await addProject({
        name: projectData.name,
        description: projectData.description,
        status: projectData.status,
        dueDate: projectData.dueDate,
        color: projectData.color,
        organizationId: organizationId || projectData.organizationId
      })
      setShowCreateModal(false)
      toast({
        title: "Project created",
        description: `${projectData.name} has been created successfully.`,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create project. Please try again.",
        variant: "destructive"
      })
    }
  }

  const handleEditProject = async (projectData: any) => {
    if (!editingProject) return
    
    try {
      await updateProject(editingProject.id, {
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
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update project. Please try again.",
        variant: "destructive"
      })
    }
  }

  const handleDeleteProject = async (projectId: string) => {
    try {
      await deleteProject(projectId)
      toast({
        title: "Project deleted",
        description: "The project has been deleted successfully.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete project. Please try again.",
        variant: "destructive"
      })
    }
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
    return PROJECT_STATUS_COLORS[status as keyof typeof PROJECT_STATUS_COLORS] || 'bg-gray-500'
  }

  const getStatusLabel = (status: string) => {
    return PROJECT_STATUS_LABELS[status as keyof typeof PROJECT_STATUS_LABELS] || status
  }

  const handleDragEnd = async (result: any) => {
    console.log('Drag ended:', result)
    if (!result.destination) {
      console.log('No destination provided')
      return
    }

    const projectId = result.draggableId;
    const newStatus = result.destination.droppableId;
    const project = projects.find(p => p.id === projectId);

    if (!project || project.status === newStatus) {
      console.log('Same status or project not found')
      return
    }

    try {
      console.log('Updating project:', { projectId, newStatus })
      await updateProject(projectId, { status: newStatus });
      toast({
        title: "Success",
        description: `Project status changed to ${getStatusLabel(newStatus)}`,
      });
    } catch (error) {
      console.error('Error moving project:', error)
      toast({
        title: "Error",
        description: "Failed to update project status. Please try again.",
        variant: "destructive"
      });
    }
  };

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
                  style={{ backgroundColor: getTailwindColor(project.color) }}
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
                  style={{ backgroundColor: getTailwindColor(project.color) }}
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
                        style={{ backgroundColor: getTailwindColor(project.color) }}
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
    const statuses = ['ACTIVE', 'PLANNING', 'IN_PROGRESS', 'COMPLETED', 'ON_HOLD'];
    
    // Show a message if no projects are available
    if (filteredProjects.length === 0) {
      return (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No projects available.</p>
          <Button 
            onClick={() => setShowCreateModal(true)}
            className="mt-4"
          >
            <Plus className="mr-2 h-4 w-4" />
            Create First Project
          </Button>
        </div>
      )
    }

    return (
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-5 gap-4 overflow-x-auto min-h-[600px]">
          {statuses.map((status) => {
            const columnProjects = filteredProjects.filter(p => p.status === status)
            return (
              <Droppable key={status} droppableId={status}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`rounded-lg border-2 ${snapshot.isDraggingOver ? 'bg-muted/50' : ''}`}
                  >
                    <div className="p-4 rounded-t-lg bg-gray-500">
                      <h3 className="font-semibold text-white flex items-center justify-between">
                        {PROJECT_STATUS_LABELS[status as keyof typeof PROJECT_STATUS_LABELS]}
                        <Badge variant="secondary" className="bg-white/10 text-white">
                          {columnProjects.length}
                        </Badge>
                      </h3>
                    </div>
                    <div className="bg-card p-2 rounded-b-lg min-h-[500px] border border-border">
                      {columnProjects.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground text-sm">
                          No projects in this status
                        </div>
                      ) : (
                        columnProjects.map((project, index) => (
                          <Draggable
                            key={project.id}
                            draggableId={project.id}
                            index={index}
                          >
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                className={`mb-3 ${snapshot.isDragging ? 'rotate-2' : ''}`}
                              >
                                <Card className="cursor-pointer hover:shadow-md transition-shadow">
                                  <CardContent className="p-4">
                                    <div className="flex items-center justify-between">
                                      <div className="flex items-center gap-3">
                                        <div 
                                          className="w-3 h-3 rounded-full" 
                                          style={{ backgroundColor: getTailwindColor(project.color) }}
                                        />
                                        <div>
                                          <h4 className="font-medium">{project.name}</h4>
                                          {project.description && (
                                            <p className="text-sm text-muted-foreground line-clamp-2">{project.description}</p>
                                          )}
                                        </div>
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
                                    <div className="mt-3 space-y-2">
                                      <div className="flex justify-between text-sm">
                                        <span>Progress</span>
                                        <span>{getCompletionPercentage(project.id)}%</span>
                                      </div>
                                      <Progress value={getCompletionPercentage(project.id)} className="h-1.5" />
                                    </div>
                                    {project.dueDate && (
                                      <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                                        <Calendar className="h-4 w-4" />
                                        <span>Due {new Date(project.dueDate).toLocaleDateString()}</span>
                                      </div>
                                    )}
                                  </CardContent>
                                </Card>
                              </div>
                            )}
                          </Draggable>
                        ))
                      )}
                      {provided.placeholder}
                    </div>
                  </div>
                )}
              </Droppable>
            )
          })}
        </div>
      </DragDropContext>
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

      {isLoading ? (
        <div className="text-center py-12">
          <p>Loading projects...</p>
        </div>
      ) : filteredProjects.length === 0 ? (
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
        open={showCreateModal}
        onOpenChange={setShowCreateModal}
        onSubmit={handleCreateProject}
        organizations={organizations}
        organizationId={organizationId}
      />

      {editingProject && (
        <CreateProjectModal
          open={true}
          onOpenChange={(open) => !open && setEditingProject(null)}
          onSubmit={handleEditProject}
          initialData={editingProject}
          organizations={organizations}
          organizationId={organizationId}
        />
      )}
    </div>
  )
} 