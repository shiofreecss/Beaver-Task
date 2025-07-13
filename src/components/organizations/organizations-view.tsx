'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus, Building, Users, MoreVertical, Pencil, Trash2, ChevronRight } from 'lucide-react'
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

export function OrganizationsView() {
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingOrg, setEditingOrg] = useState<any>(null)
  const [selectedOrgId, setSelectedOrgId] = useState<string | null>(null)

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
    // Check if organization has projects
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
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Organizations</h1>
          <p className="text-muted-foreground">Manage your organizations and teams</p>
        </div>
        <Button onClick={() => setShowCreateModal(true)}>
          <Plus className="mr-2 h-4 w-4" />
          New Organization
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {organizations.map((org) => (
          <Card 
            key={org.id} 
            className="hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => setSelectedOrgId(org.id)}
          >
            <CardHeader className="flex flex-row items-start justify-between space-y-0">
              <div className="space-y-1">
                <CardTitle className="text-xl flex items-center gap-2">
                  <Building className="h-5 w-5" style={{ color: org.color }} />
                  {org.name}
                </CardTitle>
                {org.description && (
                  <CardDescription>{org.description}</CardDescription>
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
                      setEditingOrg(org)
                    }}
                    className="flex items-center"
                  >
                    <Pencil className="mr-2 h-4 w-4" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={(e) => {
                      e.stopPropagation()
                      handleDeleteOrganization(org.id)
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
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-foreground">{getProjectCount(org.id)}</p>
                    <p className="text-sm text-muted-foreground">Projects</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-foreground">1</p>
                    <p className="text-sm text-muted-foreground">Members</p>
                  </div>
                </div>
                
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>Created {new Date(org.createdAt).toLocaleDateString()}</span>
                  <div className="flex items-center">
                    <Users className="mr-1 h-3 w-3" />
                    Active
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <CreateOrganizationModal
        open={showCreateModal}
        onOpenChange={setShowCreateModal}
        onSubmit={handleCreateOrganization}
      />

      <CreateOrganizationModal
        open={!!editingOrg}
        onOpenChange={(open) => !open && setEditingOrg(null)}
        onSubmit={handleEditOrganization}
        initialData={editingOrg}
      />
    </div>
  )
} 