'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus, Building, Users, MoreVertical, Pencil, Trash2, ChevronRight, Grid3X3, List, Table } from 'lucide-react'
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

type ViewMode = 'grid' | 'list' | 'table'

export function OrganizationsView() {
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingOrg, setEditingOrg] = useState<any>(null)
  const [selectedOrgId, setSelectedOrgId] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<ViewMode>('grid')

  // Get organizations and projects from stores
  const organizations = useOrganizationStore((state) => state.organizations)
  const addOrganization = useOrganizationStore((state) => state.addOrganization)
  const updateOrganization = useOrganizationStore((state) => state.updateOrganization)
  const deleteOrganization = useOrganizationStore((state) => state.deleteOrganization)
  const projects = useProjectStore((state) => state.projects)

  const handleCreateOrganization = (orgData: any) => {
    addOrganization({
      name: orgData.name,
      description: orgData.description,
      color: orgData.color
    })
    setShowCreateModal(false)
    toast({
      title: "Organization created",
      description: `${orgData.name} has been created successfully.`,
    })
  }

  const handleEditOrganization = (orgData: any) => {
    if (!editingOrg) return

    updateOrganization(editingOrg.id, {
      name: orgData.name,
      description: orgData.description,
      color: orgData.color
    })
    setEditingOrg(null)
    toast({
      title: "Organization updated",
      description: `${orgData.name} has been updated successfully.`,
    })
  }

  const handleDeleteOrganization = (orgId: string) => {
    const hasProjects = projects.some(project => project.organizationId === orgId)
    
    if (hasProjects) {
      toast({
        title: "Cannot delete organization",
        description: "Please remove or reassign all projects before deleting this organization.",
        variant: "destructive"
      })
      return
    }
    
    deleteOrganization(orgId)
    setSelectedOrgId(null)
    toast({
      title: "Organization deleted",
      description: "The organization has been deleted successfully.",
    })
  }

  // Get project count for an organization
  const getProjectCount = (orgId: string) => {
    return projects.filter(project => project.organizationId === orgId).length
  }

  const viewModeButtons = [
    { mode: 'grid' as ViewMode, icon: Grid3X3, label: 'Grid' },
    { mode: 'list' as ViewMode, icon: List, label: 'List' },
    { mode: 'table' as ViewMode, icon: Table, label: 'Table' }
  ]

  const renderGridView = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {organizations.map((org) => (
        <Card key={org.id} className="cursor-pointer hover:shadow-lg transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div 
                  className="w-4 h-4 rounded-full" 
                  style={{ backgroundColor: org.color || '#6B7280' }}
                />
                <CardTitle className="text-lg">{org.name}</CardTitle>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
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
            {org.description && (
              <CardDescription className="mt-2">{org.description}</CardDescription>
            )}
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Building className="h-4 w-4" />
                <span>{getProjectCount(org.id)} projects</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedOrgId(org.id)}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )

  const renderListView = () => (
    <div className="space-y-3">
      {organizations.map((org) => (
        <Card key={org.id} className="cursor-pointer hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4 flex-1">
                <div 
                  className="w-4 h-4 rounded-full flex-shrink-0" 
                  style={{ backgroundColor: org.color || '#6B7280' }}
                />
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-lg truncate">{org.name}</h3>
                  {org.description && (
                    <p className="text-sm text-muted-foreground truncate">{org.description}</p>
                  )}
                </div>
                <Badge variant="secondary" className="flex items-center gap-1">
                  <Building className="h-3 w-3" />
                  {getProjectCount(org.id)} projects
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedOrgId(org.id)}
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
                <th className="text-left p-4 font-semibold">Organization</th>
                <th className="text-left p-4 font-semibold">Description</th>
                <th className="text-left p-4 font-semibold">Projects</th>
                <th className="text-left p-4 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {organizations.map((org) => (
                <tr key={org.id} className="border-b hover:bg-muted/50">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-4 h-4 rounded-full" 
                        style={{ backgroundColor: org.color || '#6B7280' }}
                      />
                      <span className="font-medium">{org.name}</span>
                    </div>
                  </td>
                  <td className="p-4 text-muted-foreground max-w-xs">
                    <span className="truncate block">{org.description || 'No description'}</span>
                  </td>
                  <td className="p-4">
                    <Badge variant="secondary" className="flex items-center gap-1 w-fit">
                      <Building className="h-3 w-3" />
                      {getProjectCount(org.id)}
                    </Badge>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedOrgId(org.id)}
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
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
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
    if (!selectedOrg) return null

    return (
      <div className="p-6">
        <div className="flex items-center gap-2 mb-6">
          <Button variant="ghost" onClick={() => setSelectedOrgId(null)}>
            Organizations
          </Button>
          <ChevronRight className="h-4 w-4" />
          <span className="font-semibold">{selectedOrg.name}</span>
        </div>
        <ProjectsView organizationId={selectedOrgId} />
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Organizations</h1>
          <p className="text-muted-foreground">
            Manage your organizations and their projects
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
            New Organization
          </Button>
        </div>
      </div>

      {organizations.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <Building className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No organizations yet</h3>
            <p className="text-muted-foreground mb-4">
              Create your first organization to get started
            </p>
            <Button onClick={() => setShowCreateModal(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Create Organization
            </Button>
          </CardContent>
        </Card>
      ) : (
        renderCurrentView()
      )}

      <CreateOrganizationModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreateOrganization}
      />

      {editingOrg && (
        <CreateOrganizationModal
          isOpen={true}
          onClose={() => setEditingOrg(null)}
          onSubmit={handleEditOrganization}
          initialData={editingOrg}
        />
      )}
    </div>
  )
} 