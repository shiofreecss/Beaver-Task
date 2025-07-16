'use client'

import { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus, Building, Users, MoreVertical, Pencil, Trash2, ChevronRight, Grid3X3, List, Table, Globe, FileText, GripVertical } from 'lucide-react'
import { CreateOrganizationModal } from '@/components/organizations/create-organization-modal'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { toast } from "@/components/ui/use-toast"
import { useOrganizationStore } from '@/store/organizations'
import { useProjectStore } from '@/store/projects'
import { ProjectsView } from '@/components/projects/projects-view'
import { Badge } from '@/components/ui/badge'
import { getTailwindColor } from '@/lib/utils'
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd'

type ViewMode = 'grid' | 'list' | 'table'

export function OrganizationsView() {
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingOrg, setEditingOrg] = useState<any>(null)
  const [selectedOrgId, setSelectedOrgId] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const [isLoading, setIsLoading] = useState(true)
  const [localOrganizations, setLocalOrganizations] = useState<any[]>([]) // Local state for optimistic updates
  const [dragTimeoutRef, setDragTimeoutRef] = useState<NodeJS.Timeout | null>(null)

  // Get organizations and projects from stores
  const organizations = useOrganizationStore((state) => state.organizations)
  const fetchOrganizations = useOrganizationStore((state) => state.fetchOrganizations)
  const addOrganization = useOrganizationStore((state) => state.addOrganization)
  const updateOrganization = useOrganizationStore((state) => state.updateOrganization)
  const deleteOrganization = useOrganizationStore((state) => state.deleteOrganization)
  const updateOrganizationOrder = useOrganizationStore((state) => state.updateOrganizationOrder)
  const projects = useProjectStore((state) => state.projects)
  const fetchProjects = useProjectStore((state) => state.fetchProjects)

  // Sync local organizations with store organizations
  useEffect(() => {
    setLocalOrganizations(organizations)
  }, [organizations])

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (dragTimeoutRef) {
        clearTimeout(dragTimeoutRef)
      }
    }
  }, [dragTimeoutRef])

  // Add effect to refresh projects when selected org changes
  useEffect(() => {
    if (selectedOrgId) {
      console.log('🔄 Refreshing projects for organization:', selectedOrgId)
      fetchProjects()
    }
  }, [selectedOrgId, fetchProjects])

  useEffect(() => {
    const loadData = async () => {
      try {
        // Load both organizations and projects so navigation works smoothly
        await Promise.all([fetchOrganizations(), fetchProjects()])
      } catch (error) {
        console.error('Failed to fetch organizations:', error)
        toast({
          title: "Error",
          description: "Failed to load organizations. Please try again.",
          variant: "destructive"
        })
      } finally {
        setIsLoading(false)
      }
    }
    loadData()
  }, [fetchOrganizations, fetchProjects])

  // Debug logging when data is actually loaded
  useEffect(() => {
    if (organizations.length > 0 || projects.length > 0) {
      console.log('🐛 DEBUG - Organizations and Projects data:', {
        organizationsCount: organizations.length,
        projectsCount: projects.length,
        organizations: organizations.map(org => ({
          id: org.id,
          name: org.name,
          projectCount: projects.filter(p => p.organizationId === org.id).length
        })),
        projects: projects.map(p => ({
          id: p.id,
          name: p.name,
          organizationId: p.organizationId
        })),
        projectsByOrganization: organizations.reduce((acc, org) => {
          acc[org.name] = projects.filter(p => p.organizationId === org.id)
          return acc
        }, {} as Record<string, any[]>)
      })
    }
  }, [organizations, projects])

  const handleEditOrganization = async (orgData: any) => {
    if (!editingOrg) return

    try {
      await updateOrganization(editingOrg.id, {
        name: orgData.name,
        description: orgData.description,
        color: orgData.color,
        department: orgData.department,
        categories: orgData.categories,
        website: orgData.website,
        documents: orgData.documents
      })
      setEditingOrg(null)
      toast({
        title: "Organization updated",
        description: `${orgData.name} has been updated successfully.`,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update organization. Please try again.",
        variant: "destructive"
      })
    }
  }

  const handleCreateOrganization = async (orgData: any) => {
    try {
      await addOrganization({
        name: orgData.name,
        description: orgData.description,
        color: orgData.color,
        department: orgData.department,
        categories: orgData.categories,
        website: orgData.website,
        documents: orgData.documents
      })
      setShowCreateModal(false)
      toast({
        title: "Organization created",
        description: `${orgData.name} has been created successfully.`,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create organization. Please try again.",
        variant: "destructive"
      })
    }
  }

  const handleDeleteOrganization = async (orgId: string) => {
    const hasProjects = projects.some(project => project.organizationId === orgId)
    
    if (hasProjects) {
      toast({
        title: "Cannot delete organization",
        description: "Please remove or reassign all projects before deleting this organization.",
        variant: "destructive"
      })
      return
    }
    
    try {
      await deleteOrganization(orgId)
      setSelectedOrgId(null)
      toast({
        title: "Organization deleted",
        description: "The organization has been deleted successfully.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete organization. Please try again.",
        variant: "destructive"
      })
    }
  }

  // Update getProjectCount to always use latest projects data
  const getProjectCount = (orgId: string) => {
    console.log('📊 Calculating project count for org:', orgId, {
      totalProjects: projects.length,
      matchingProjects: projects.filter(project => project.organizationId === orgId).length
    })
    return projects.filter(project => project.organizationId === orgId).length
  }

  // Debug logging for navigation
  const handleProjectNavigation = (orgId: string) => {
    console.log('Organization project navigation clicked:', {
      orgId,
      organization: organizations.find(org => org.id === orgId),
      projectsForOrg: projects.filter(project => project.organizationId === orgId),
      totalProjects: projects.length,
      projectsBreakdown: projects.map(p => ({ id: p.id, name: p.name, orgId: p.organizationId }))
    })
    setSelectedOrgId(orgId)
  }

  const handleDragEnd = async (result: DropResult) => {
    if (!result.destination) return

    const sourceIndex = result.source.index
    const destinationIndex = result.destination.index

    if (sourceIndex === destinationIndex) return

    // Clear any pending drag timeout
    if (dragTimeoutRef) {
      clearTimeout(dragTimeoutRef)
      setDragTimeoutRef(null)
    }

    // Optimistic update: immediately reorder the local state
    const newOrganizations = [...localOrganizations]
    const [movedOrg] = newOrganizations.splice(sourceIndex, 1)
    newOrganizations.splice(destinationIndex, 0, movedOrg)
    
    // Update local state immediately for visual feedback
    setLocalOrganizations(newOrganizations)

    const organization = localOrganizations[sourceIndex]

    // Debounce the API call to avoid rapid-fire requests during multiple drags
    const timeoutId = setTimeout(async () => {
      try {
        await updateOrganizationOrder(organization.id, destinationIndex)
        // Silent success - no toast to avoid UI clutter
      } catch (error) {
        // Revert optimistic update on error
        setLocalOrganizations(organizations)
        toast({
          title: 'Error',
          description: 'Failed to update organization order',
          variant: 'destructive',
        })
      }
    }, 150) // 150ms debounce - enough to feel instant but avoid rapid calls

    setDragTimeoutRef(timeoutId)
  }

  const viewModeButtons = [
    { mode: 'grid' as ViewMode, icon: Grid3X3, label: 'Grid' },
    { mode: 'list' as ViewMode, icon: List, label: 'List' },
    { mode: 'table' as ViewMode, icon: Table, label: 'Table' }
  ]

  // Use localOrganizations instead of organizations for rendering
  const organizationsToRender = localOrganizations

  const renderGridView = () => (
    <DragDropContext onDragEnd={handleDragEnd}>
      <Droppable droppableId="organizations">
        {(provided) => (
          <div 
            ref={provided.innerRef}
            {...provided.droppableProps}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 min-h-[200px] overflow-hidden"
          >
            {localOrganizations.map((org, index) => (
              <Draggable key={org.id} draggableId={org.id} index={index}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    className={`transition-transform ${snapshot.isDragging ? 'scale-[1.02] shadow-lg z-50' : ''}`}
                  >
                    <Card className="cursor-pointer hover:shadow-md transition-shadow">
                      <CardHeader className="pb-3 p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 md:gap-3 min-w-0">
                            <div 
                              className="w-3 h-3 md:w-4 md:h-4 rounded-full flex-shrink-0" 
                              style={{ backgroundColor: getTailwindColor(org.color) }}
                            />
                            <CardTitle className="text-base md:text-lg truncate">{org.name}</CardTitle>
                          </div>
                          <div className="flex items-center gap-1">
                            <div {...provided.dragHandleProps} className="cursor-grab active:cursor-grabbing p-1">
                              <GripVertical className="h-4 w-4 text-muted-foreground" />
                            </div>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" className="flex-shrink-0 h-8 w-8 p-0">
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => setEditingOrg(org)}>
                                  <Pencil className="mr-2 h-4 w-4" />
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  onClick={() => handleDeleteOrganization(org.id)}
                                  className="text-destructive"
                                >
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>
                        {org.description && (
                          <CardDescription className="mt-2 text-sm line-clamp-2">{org.description}</CardDescription>
                        )}
                      </CardHeader>
                      <CardContent className="p-4 pt-0">
                        <div className="space-y-3 md:space-y-4">
                          {org.department && (
                            <div className="flex items-center gap-2 text-xs md:text-sm text-muted-foreground">
                              <Building className="h-3 w-3 md:h-4 md:w-4 flex-shrink-0" />
                              <span className="truncate">{org.department}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-2 text-xs md:text-sm text-muted-foreground">
                            <Users className="h-3 w-3 md:h-4 md:w-4 flex-shrink-0" />
                            <span>{getProjectCount(org.id)} projects</span>
                          </div>
                          {org.website && (
                            <div className="flex items-center gap-2 text-xs md:text-sm text-muted-foreground">
                              <Globe className="h-3 w-3 md:h-4 md:w-4 flex-shrink-0" />
                              <a 
                                href={`https://${org.website}`} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="truncate hover:text-primary"
                              >
                                {org.website}
                              </a>
                            </div>
                          )}
                          {org.documents && org.documents.length > 0 && (
                            <div className="flex items-center gap-2 text-xs md:text-sm text-muted-foreground">
                              <FileText className="h-3 w-3 md:h-4 md:w-4 flex-shrink-0" />
                              <span>{org.documents.length} document{org.documents.length === 1 ? '' : 's'}</span>
                            </div>
                          )}
                          {org.categories && org.categories.length > 0 && (
                            <div className="flex flex-wrap gap-1.5">
                              {org.categories.map((category: string) => (
                                <Badge key={category} variant="secondary" className="text-xs">
                                  {category}
                                </Badge>
                              ))}
                            </div>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedOrgId(org.id)}
                            className="w-full h-8 text-xs md:text-sm"
                          >
                            <ChevronRight className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2" />
                            View Projects
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  )

  const renderListView = () => (
    <DragDropContext onDragEnd={handleDragEnd}>
      <Droppable droppableId="organizations">
        {(provided) => (
          <div 
            ref={provided.innerRef}
            {...provided.droppableProps}
            className="space-y-2 md:space-y-3"
          >
            {localOrganizations.map((org, index) => (
              <Draggable key={org.id} draggableId={org.id} index={index}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    className={`transition-transform ${snapshot.isDragging ? 'scale-[1.02] shadow-lg z-50' : ''}`}
                  >
                    <Card className="cursor-pointer hover:shadow-md transition-shadow">
                      <CardContent className="p-3 md:p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 md:gap-4 flex-1 min-w-0">
                            <div {...provided.dragHandleProps} className="cursor-grab active:cursor-grabbing p-1">
                              <GripVertical className="h-4 w-4 text-muted-foreground" />
                            </div>
                            <div 
                              className="w-3 h-3 md:w-4 md:h-4 rounded-full flex-shrink-0" 
                              style={{ backgroundColor: getTailwindColor(org.color) }}
                            />
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-sm md:text-base truncate">{org.name}</h3>
                              {org.description && (
                                <p className="text-xs md:text-sm text-muted-foreground truncate">{org.description}</p>
                              )}
                            </div>
                            <div className="hidden sm:flex items-center gap-2 md:gap-3">
                              {org.department && (
                                <Badge variant="secondary" className="text-xs">
                                  {org.department}
                                </Badge>
                              )}
                              <span className="text-xs md:text-sm text-muted-foreground whitespace-nowrap">
                                {getProjectCount(org.id)} projects
                              </span>
                              {org.categories && org.categories.length > 0 && (
                                <div className="flex gap-1.5">
                                  {org.categories.slice(0, 2).map((category: string) => (
                                    <Badge key={category} variant="secondary" className="text-xs">
                                      {category}
                                    </Badge>
                                  ))}
                                  {org.categories.length > 2 && (
                                    <Badge variant="secondary" className="text-xs">
                                      +{org.categories.length - 2}
                                    </Badge>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-1 md:gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setSelectedOrgId(org.id)}
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
                                <DropdownMenuItem onClick={() => setEditingOrg(org)}>
                                  <Pencil className="mr-2 h-4 w-4" />
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  onClick={() => handleDeleteOrganization(org.id)}
                                  className="text-destructive"
                                >
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>
                        {/* Mobile-only info */}
                        <div className="sm:hidden mt-3 flex flex-wrap items-center gap-2">
                          {org.department && (
                            <Badge variant="secondary" className="text-xs">
                              {org.department}
                            </Badge>
                          )}
                          <span className="text-xs text-muted-foreground">
                            {getProjectCount(org.id)} projects
                          </span>
                          {org.categories && org.categories.length > 0 && (
                            <div className="flex gap-1.5">
                              {org.categories.slice(0, 2).map((category: string) => (
                                <Badge key={category} variant="secondary" className="text-xs">
                                  {category}
                                </Badge>
                              ))}
                              {org.categories.length > 2 && (
                                <Badge variant="secondary" className="text-xs">
                                  +{org.categories.length - 2}
                                </Badge>
                              )}
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  )

  const renderTableView = () => (
    <DragDropContext onDragEnd={handleDragEnd}>
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px]">
              <thead className="border-b">
                <tr>
                  <th className="text-left p-3 md:p-4 font-semibold text-sm"></th>
                  <th className="text-left p-3 md:p-4 font-semibold text-sm">Organization</th>
                  <th className="text-left p-3 md:p-4 font-semibold text-sm">Department</th>
                  <th className="text-left p-3 md:p-4 font-semibold text-sm">Projects</th>
                  <th className="text-left p-3 md:p-4 font-semibold text-sm hidden md:table-cell">Categories</th>
                  <th className="text-left p-3 md:p-4 font-semibold text-sm">Actions</th>
                </tr>
              </thead>
              <Droppable droppableId="organizations">
                {(provided) => (
                  <tbody
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                  >
                    {localOrganizations.map((org, index) => (
                      <Draggable key={org.id} draggableId={org.id} index={index}>
                        {(provided, snapshot) => (
                          <tr
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            className={`border-b hover:bg-muted/50 transition-colors ${
                              snapshot.isDragging ? 'bg-muted shadow-lg' : ''
                            }`}
                          >
                            <td className="p-3 md:p-4 w-10">
                              <div {...provided.dragHandleProps} className="cursor-grab active:cursor-grabbing">
                                <GripVertical className="h-4 w-4 text-muted-foreground" />
                              </div>
                            </td>
                            <td className="p-3 md:p-4">
                              <div className="flex items-center gap-2 md:gap-3">
                                <div 
                                  className="w-3 h-3 md:w-4 md:h-4 rounded-full flex-shrink-0" 
                                  style={{ backgroundColor: getTailwindColor(org.color) }}
                                />
                                <div className="min-w-0">
                                  <span className="font-medium text-sm md:text-base">{org.name}</span>
                                  {org.description && (
                                    <p className="text-xs md:text-sm text-muted-foreground truncate max-w-[150px] md:max-w-xs">
                                      {org.description}
                                    </p>
                                  )}
                                </div>
                              </div>
                            </td>
                            <td className="p-3 md:p-4">
                              {org.department ? (
                                <Badge variant="secondary" className="text-xs">
                                  {org.department}
                                </Badge>
                              ) : (
                                <span className="text-xs md:text-sm text-muted-foreground">-</span>
                              )}
                            </td>
                            <td className="p-3 md:p-4">
                              <span className="text-xs md:text-sm">{getProjectCount(org.id)} projects</span>
                            </td>
                            <td className="p-3 md:p-4 hidden md:table-cell">
                              {org.categories && org.categories.length > 0 ? (
                                <div className="flex flex-wrap gap-1.5">
                                  {org.categories.slice(0, 3).map((category: string) => (
                                    <Badge key={category} variant="secondary" className="text-xs">
                                      {category}
                                    </Badge>
                                  ))}
                                  {org.categories.length > 3 && (
                                    <Badge variant="secondary" className="text-xs">
                                      +{org.categories.length - 3}
                                    </Badge>
                                  )}
                                </div>
                              ) : (
                                <span className="text-xs md:text-sm text-muted-foreground">No categories</span>
                              )}
                            </td>
                            <td className="p-3 md:p-4">
                              <div className="flex items-center gap-1 md:gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setSelectedOrgId(org.id)}
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
                                    <DropdownMenuItem onClick={() => setEditingOrg(org)}>
                                      <Pencil className="mr-2 h-4 w-4" />
                                      Edit
                                    </DropdownMenuItem>
                                    <DropdownMenuItem 
                                      onClick={() => handleDeleteOrganization(org.id)}
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
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </tbody>
                )}
              </Droppable>
            </table>
          </div>
        </CardContent>
      </Card>
    </DragDropContext>
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

  if (selectedOrgId) {
    const selectedOrg = organizations.find(org => org.id === selectedOrgId)
    if (!selectedOrg) {
      console.warn('🚨 Selected organization not found:', selectedOrgId)
      setSelectedOrgId(null) // Reset if organization not found
      return null
    }

    console.log('🎯 Navigating to organization projects:', {
      selectedOrgId,
      selectedOrg: selectedOrg.name,
      embeddedProjects: selectedOrg.projects?.length || 0
    })

    return (
      <div className="p-4 md:p-6">
        <div className="flex items-center gap-2 mb-4 md:mb-6">
          <Button variant="ghost" onClick={() => setSelectedOrgId(null)} className="text-sm md:text-base">
            Organizations
          </Button>
          <ChevronRight className="h-4 w-4" />
          <span className="font-semibold text-sm md:text-base truncate">{selectedOrg.name}</span>
        </div>
        <ProjectsView organizationId={selectedOrgId} />
      </div>
    )
  }

  return (
    <div className="p-4 md:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 md:mb-6 gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Organizations</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage your organizations and their projects
          </p>
        </div>
        <div className="flex items-center gap-2">
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
            <span className="hidden sm:inline">New Organization</span>
            <span className="sm:hidden">New</span>
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-12">
          <p className="text-sm md:text-base">Loading organizations...</p>
        </div>
      ) : localOrganizations.length === 0 ? (
        <Card className="text-center py-8 md:py-12">
          <CardContent>
            <div className="mx-auto h-8 w-8 md:h-12 md:w-12 text-muted-foreground mb-4">🏢</div>
            <h3 className="text-base md:text-lg font-semibold mb-2">No organizations yet</h3>
            <p className="text-muted-foreground mb-4 text-sm md:text-base">
              Create your first organization to get started
            </p>
            <Button onClick={() => setShowCreateModal(true)} className="text-sm md:text-base">
              <Plus className="mr-2 h-4 w-4" />
              Create Organization
            </Button>
          </CardContent>
        </Card>
      ) : (
        renderCurrentView()
      )}

      <CreateOrganizationModal
        open={showCreateModal}
        onOpenChange={setShowCreateModal}
        onSubmit={handleCreateOrganization}
      />

      {editingOrg && (
        <CreateOrganizationModal
          open={true}
          onOpenChange={(open) => !open && setEditingOrg(null)}
          onSubmit={handleEditOrganization}
          initialData={editingOrg}
        />
      )}
    </div>
  )
} 