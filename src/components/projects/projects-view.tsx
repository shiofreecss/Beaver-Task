'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus, Calendar, Users, MoreVertical, Pencil, Trash2, ChevronRight, Grid3X3, List, Table, Columns, Filter, Globe, FileText } from 'lucide-react'
import { CreateProjectModal } from '@/components/projects/create-project-modal'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
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
  const [selectedOrganizationFilter, setSelectedOrganizationFilter] = useState<string>('all')

  // Get projects, tasks, and organizations from stores
  const projects = useProjectStore((state) => state.projects)
  const fetchProjects = useProjectStore((state) => state.fetchProjects)
  const addProject = useProjectStore((state) => state.addProject)
  const updateProject = useProjectStore((state) => state.updateProject)
  const deleteProject = useProjectStore((state) => state.deleteProject)
  const tasks = useTaskStore((state) => state.tasks)
  const organizations = useOrganizationStore((state) => state.organizations)
  const fetchOrganizations = useOrganizationStore((state) => state.fetchOrganizations)

  useEffect(() => {
    const loadData = async () => {
      try {
        // If we're in an organization view, we only need projects
        // Organizations should already be loaded from the parent component
        if (organizationId) {
          console.log('Loading projects for organization:', organizationId)
          await fetchProjects()
        } else {
          // Only in general projects view do we need both
          console.log('Loading all projects and organizations')
          await Promise.all([fetchProjects(), fetchOrganizations()])
        }
      } catch (error) {
        console.error('Failed to fetch data:', error)
        toast({
          title: "Error",
          description: "Failed to load data. Please try again.",
          variant: "destructive"
        })
      } finally {
        setIsLoading(false)
      }
    }
    loadData()
  }, [fetchProjects, fetchOrganizations, organizationId])

  // Filter projects by organization if organizationId is provided
  // Also apply organization filter if selectedOrganizationFilter is set
  const filteredProjects = projects.filter(project => {
    // If we're in a specific organization view, filter by that organization
    if (organizationId && project.organizationId !== organizationId) return false
    
    // If we're in the general projects view and an organization filter is selected
    if (!organizationId && selectedOrganizationFilter !== 'all') {
      if (selectedOrganizationFilter === 'no-organization') {
        return !project.organizationId || project.organizationId === null
      } else {
        return project.organizationId === selectedOrganizationFilter
      }
    }
    
    return true
  })

  // Debug logging for organization navigation
  useEffect(() => {
    if (organizationId) {
      console.log('🐛 DEBUG - ProjectsView for Organization:', {
        organizationId,
        organization: organizations.find(org => org.id === organizationId),
        totalProjects: projects.length,
        filteredProjects: filteredProjects.length,
        organizationProjects: projects.filter(p => p.organizationId === organizationId),
        allProjectsOrganizationIds: projects.map(p => ({ id: p.id, name: p.name, orgId: p.organizationId })),
        filterLogic: {
          'exact match': projects.filter(p => p.organizationId === organizationId).length,
          'null/undefined projects': projects.filter(p => !p.organizationId || p.organizationId === null).length
        }
      })
    }
  }, [organizationId, projects, filteredProjects, organizations])

  const handleCreateProject = async (projectData: any) => {
    try {
      await addProject({
        name: projectData.name,
        description: projectData.description,
        status: projectData.status,
        dueDate: projectData.dueDate,
        color: projectData.color,
        organizationId: organizationId || projectData.organizationId,
        website: projectData.website,
        categories: projectData.categories,
        documents: projectData.documents
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
        organizationId: organizationId || projectData.organizationId,
        website: projectData.website,
        categories: projectData.categories,
        documents: projectData.documents
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
      console.log('Attempting to delete project:', projectId)
      await deleteProject(projectId)
      toast({
        title: "Project deleted",
        description: "The project has been deleted successfully.",
      })
    } catch (error) {
      console.error('Project deletion error:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete project. Please try again.",
        variant: "destructive"
      })
    }
  }

  const handleMoveProject = async (projectId: string, newOrgId: string) => {
    try {
      await updateProject(projectId, { organizationId: newOrgId })
      // Refresh projects data to update counts
      await fetchProjects()
      toast({
        title: "Project moved",
        description: "Project has been moved to the new organization."
      })
    } catch (error) {
      console.error('Failed to move project:', error)
      toast({
        title: "Error",
        description: "Failed to move project. Please try again.",
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
      console.error('Error details:', error instanceof Error ? error.message : error)
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
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
      {filteredProjects.map((project) => (
        <Card key={project.id} className="cursor-pointer hover:shadow-lg transition-shadow">
          <CardHeader className="pb-3 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 md:gap-3 min-w-0">
                <div 
                  className="w-3 h-3 md:w-4 md:h-4 rounded-full flex-shrink-0" 
                  style={{ backgroundColor: getTailwindColor(project.color) }}
                />
                <CardTitle className="text-base md:text-lg truncate">{project.name}</CardTitle>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="flex-shrink-0 h-8 w-8 p-0">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
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
              <CardDescription className="mt-2 text-sm line-clamp-2">{project.description}</CardDescription>
            )}
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="space-y-3 md:space-y-4">
              <div className="flex items-center justify-between">
                <Badge variant="secondary" className={`${getStatusColor(project.status)} text-white text-xs`}>
                  {getStatusLabel(project.status)}
                </Badge>
                <span className="text-xs md:text-sm text-muted-foreground">
                  {getTaskCount(project.id)} tasks
                </span>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-xs md:text-sm">
                  <span>Progress</span>
                  <span>{getCompletionPercentage(project.id)}%</span>
                </div>
                <Progress value={getCompletionPercentage(project.id)} className="h-1.5 md:h-2" />
              </div>
              {project.dueDate && (
                <div className="flex items-center gap-2 text-xs md:text-sm text-muted-foreground">
                  <Calendar className="h-3 w-3 md:h-4 md:w-4 flex-shrink-0" />
                  <span className="truncate">Due {new Date(project.dueDate).toLocaleDateString()}</span>
                </div>
              )}
              {project.website && (
                <div className="flex items-center gap-2 text-xs md:text-sm text-muted-foreground">
                  <Globe className="h-3 w-3 md:h-4 md:w-4 flex-shrink-0" />
                  <a 
                    href={`https://${project.website}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="truncate hover:text-primary"
                  >
                    {project.website}
                  </a>
                </div>
              )}
              {project.documents && project.documents.length > 0 && (
                <div className="flex items-center gap-2 text-xs md:text-sm text-muted-foreground">
                  <FileText className="h-3 w-3 md:h-4 md:w-4 flex-shrink-0" />
                  <span>{project.documents.length} document{project.documents.length === 1 ? '' : 's'}</span>
                </div>
              )}
              {project.categories && project.categories.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {project.categories.map((category: string) => (
                    <Badge key={category} variant="secondary" className="text-xs">
                      {category}
                    </Badge>
                  ))}
                </div>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedProjectId(project.id)}
                className="w-full h-8 text-xs md:text-sm"
              >
                <ChevronRight className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2" />
                View Tasks
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )

  const renderListView = () => (
    <div className="space-y-2 md:space-y-3">
      {filteredProjects.map((project) => (
        <Card key={project.id} className="cursor-pointer hover:shadow-md transition-shadow">
          <CardContent className="p-3 md:p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 md:gap-4 flex-1 min-w-0">
                <div 
                  className="w-3 h-3 md:w-4 md:h-4 rounded-full flex-shrink-0" 
                  style={{ backgroundColor: getTailwindColor(project.color) }}
                />
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-sm md:text-lg truncate">{project.name}</h3>
                  {project.description && (
                    <p className="text-xs md:text-sm text-muted-foreground truncate">{project.description}</p>
                  )}
                </div>
                <div className="hidden sm:flex items-center gap-2 md:gap-3">
                  <Badge variant="secondary" className={`${getStatusColor(project.status)} text-white text-xs`}>
                    {getStatusLabel(project.status)}
                  </Badge>
                  <span className="text-xs md:text-sm text-muted-foreground whitespace-nowrap">
                    {getTaskCount(project.id)} tasks
                  </span>
                  <div className="w-16 md:w-24">
                    <Progress value={getCompletionPercentage(project.id)} className="h-1.5 md:h-2" />
                  </div>
                  <span className="text-xs md:text-sm font-medium w-6 md:w-8 text-right">
                    {getCompletionPercentage(project.id)}%
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-1 md:gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedProjectId(project.id)}
                  className="h-8 w-8 p-0"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
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
            {/* Mobile-only status and progress info */}
            <div className="sm:hidden mt-3 flex items-center justify-between">
              <Badge variant="secondary" className={`${getStatusColor(project.status)} text-white text-xs`}>
                {getStatusLabel(project.status)}
              </Badge>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">
                  {getTaskCount(project.id)} tasks
                </span>
                <div className="w-16">
                  <Progress value={getCompletionPercentage(project.id)} className="h-1.5" />
                </div>
                <span className="text-xs font-medium">
                  {getCompletionPercentage(project.id)}%
                </span>
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
          <table className="w-full min-w-[600px]">
            <thead className="border-b">
              <tr>
                <th className="text-left p-3 md:p-4 font-semibold text-sm">Project</th>
                <th className="text-left p-3 md:p-4 font-semibold text-sm">Status</th>
                <th className="text-left p-3 md:p-4 font-semibold text-sm">Progress</th>
                <th className="text-left p-3 md:p-4 font-semibold text-sm">Tasks</th>
                <th className="text-left p-3 md:p-4 font-semibold text-sm hidden md:table-cell">Due Date</th>
                <th className="text-left p-3 md:p-4 font-semibold text-sm">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProjects.map((project) => (
                <tr key={project.id} className="border-b hover:bg-muted/50">
                  <td className="p-3 md:p-4">
                    <div className="flex items-center gap-2 md:gap-3">
                      <div 
                        className="w-3 h-3 md:w-4 md:h-4 rounded-full flex-shrink-0" 
                        style={{ backgroundColor: getTailwindColor(project.color) }}
                      />
                      <div className="min-w-0">
                        <span className="font-medium text-sm md:text-base">{project.name}</span>
                        {project.description && (
                          <p className="text-xs md:text-sm text-muted-foreground truncate max-w-[150px] md:max-w-xs">
                            {project.description}
                          </p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="p-3 md:p-4">
                    <Badge variant="secondary" className={`${getStatusColor(project.status)} text-white text-xs`}>
                      {getStatusLabel(project.status)}
                    </Badge>
                  </td>
                  <td className="p-3 md:p-4">
                    <div className="flex items-center gap-2">
                      <Progress value={getCompletionPercentage(project.id)} className="h-1.5 md:h-2 w-12 md:w-20" />
                      <span className="text-xs md:text-sm font-medium">
                        {getCompletionPercentage(project.id)}%
                      </span>
                    </div>
                  </td>
                  <td className="p-3 md:p-4">
                    <span className="text-xs md:text-sm">{getTaskCount(project.id)} tasks</span>
                  </td>
                  <td className="p-3 md:p-4 hidden md:table-cell">
                    {project.dueDate ? (
                      <span className="text-sm">
                        {new Date(project.dueDate).toLocaleDateString()}
                      </span>
                    ) : (
                      <span className="text-sm text-muted-foreground">No due date</span>
                    )}
                  </td>
                  <td className="p-3 md:p-4">
                    <div className="flex items-center gap-1 md:gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedProjectId(project.id)}
                        className="h-8 w-8 p-0"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
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
        <div className="kanban-container">
          {statuses.map((status) => {
            const columnProjects = filteredProjects.filter(p => p.status === status)
            return (
              <Droppable key={status} droppableId={status}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`kanban-column ${snapshot.isDraggingOver ? 'bg-muted/50' : ''}`}
                  >
                    <div className={`p-3 rounded-t-lg ${getStatusColor(status)}`}>
                      <h3 className="font-semibold text-white text-base flex items-center justify-between">
                        <span className="truncate pr-2">
                          {PROJECT_STATUS_LABELS[status as keyof typeof PROJECT_STATUS_LABELS]}
                        </span>
                        <Badge variant="secondary" className="bg-white/10 text-white text-xs">
                          {columnProjects.length}
                        </Badge>
                      </h3>
                    </div>
                    <div className="bg-card p-3 rounded-b-lg border border-border" style={{ minHeight: 'auto' }}>
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
                                <Card className="cursor-pointer hover:shadow-lg transition-shadow">
                                  <CardContent className="p-4">
                                    <div className="flex items-start justify-between mb-3">
                                      <div className="flex items-start gap-2 min-w-0 flex-1">
                                        <div 
                                          className="w-3 h-3 rounded-full flex-shrink-0 mt-1" 
                                          style={{ backgroundColor: getTailwindColor(project.color) }}
                                        />
                                        <div className="min-w-0 flex-1">
                                          <h4 className="font-medium text-sm truncate">{project.name}</h4>
                                          {project.description && (
                                            <p className="text-xs text-muted-foreground line-clamp-2 mt-1">{project.description}</p>
                                          )}
                                        </div>
                                      </div>
                                      <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                          <Button variant="ghost" size="sm" className="h-7 w-7 p-0 flex-shrink-0">
                                            <MoreVertical className="h-4 w-4" />
                                          </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
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
                                    <div className="space-y-2">
                                      <div className="flex items-center justify-between text-xs">
                                        <span className="text-muted-foreground">{getTaskCount(project.id)} tasks</span>
                                        <span className="font-medium">{getCompletionPercentage(project.id)}%</span>
                                      </div>
                                      <Progress value={getCompletionPercentage(project.id)} className="h-2" />
                                    </div>
                                    {project.dueDate && (
                                      <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
                                        <Calendar className="h-3 w-3 flex-shrink-0" />
                                        <span className="truncate">Due {new Date(project.dueDate).toLocaleDateString()}</span>
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
      <div className="p-4 md:p-6">
        <div className="flex items-center gap-2 mb-4 md:mb-6">
          <Button variant="ghost" onClick={() => setSelectedProjectId(null)} className="text-sm md:text-base">
            {organizationId ? 'Projects' : 'All Projects'}
          </Button>
          <ChevronRight className="h-4 w-4" />
          <span className="font-semibold text-sm md:text-base truncate">{selectedProject.name}</span>
        </div>
        <TasksView projectId={selectedProjectId} />
      </div>
    )
  }

  return (
    <div className="p-4 md:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 md:mb-6 gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
            {organizationId ? 'Organization Projects' : 'Projects'}
          </h1>
          {organizationId && (
            <p className="text-sm text-muted-foreground mt-1">
              Showing projects for selected organization
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          {/* Organization Filter - only show in general projects view */}
          {!organizationId && (
            <Select value={selectedOrganizationFilter} onValueChange={setSelectedOrganizationFilter}>
              <SelectTrigger className="w-48">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter by organization" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Organizations</SelectItem>
                <SelectItem value="no-organization">No Organization</SelectItem>
                {organizations.map((organization) => (
                  <SelectItem key={organization.id} value={organization.id}>
                    {organization.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          
          {/* View Mode Toggle */}
          <div className="flex rounded-lg border p-0.5 md:p-1">
            {viewModeButtons.map(({ mode, icon: Icon, label }) => (
              <Button
                key={mode}
                variant={viewMode === mode ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode(mode)}
                className="h-7 md:h-8 px-2 md:px-3"
              >
                <Icon className="h-3 w-3 md:h-4 md:w-4" />
                <span className="sr-only">{label}</span>
              </Button>
            ))}
          </div>
          <Button onClick={() => setShowCreateModal(true)} className="text-sm md:text-base">
            <Plus className="mr-1 md:mr-2 h-4 w-4" />
            <span className="hidden sm:inline">New Project</span>
            <span className="sm:hidden">New</span>
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-12">
          <p className="text-sm md:text-base">Loading projects...</p>
        </div>
      ) : filteredProjects.length === 0 ? (
        <Card className="text-center py-8 md:py-12">
          <CardContent>
            <div className="mx-auto h-8 w-8 md:h-12 md:w-12 text-muted-foreground mb-4">📁</div>
            <h3 className="text-base md:text-lg font-semibold mb-2">
              {organizationId ? 'No projects in this organization yet' : 'No projects yet'}
            </h3>
            <p className="text-muted-foreground mb-4 text-sm md:text-base">
              {organizationId 
                ? 'Create your first project for this organization to get started'
                : 'Create your first project to get started'
              }
            </p>
            <Button onClick={() => setShowCreateModal(true)} className="text-sm md:text-base">
              <Plus className="mr-2 h-4 w-4" />
              Create Project
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div>
          {organizationId && (
            <div className="mb-4 p-3 bg-muted/50 rounded-lg">
              <p className="text-sm text-muted-foreground">
                Showing {filteredProjects.length} project{filteredProjects.length === 1 ? '' : 's'} 
                {organizations.find(org => org.id === organizationId)?.name && 
                  ` for "${organizations.find(org => org.id === organizationId)?.name}"`
                }
              </p>
            </div>
          )}
          {renderCurrentView()}
        </div>
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