'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus, Building, Users, MoreVertical, Pencil, Trash2 } from 'lucide-react'
import { CreateOrganizationModal } from '@/components/organizations/create-organization-modal'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { toast } from "@/components/ui/use-toast"

export function OrganizationsView() {
  const [organizations, setOrganizations] = useState([
    {
      id: '1',
      name: 'Acme Corporation',
      description: 'Main business organization',
      color: 'bg-blue-500',
      projectsCount: 5,
      membersCount: 12,
      createdAt: '2024-01-15'
    },
    {
      id: '2',
      name: 'Personal Projects',
      description: 'Individual side projects and learning',
      color: 'bg-green-500',
      projectsCount: 3,
      membersCount: 1,
      createdAt: '2024-01-10'
    }
  ])

  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingOrg, setEditingOrg] = useState<any>(null)

  const handleCreateOrganization = (orgData: any) => {
    const newOrg = {
      id: Date.now().toString(),
      name: orgData.name,
      description: orgData.description,
      color: orgData.color,
      projectsCount: 0,
      membersCount: 1,
      createdAt: new Date().toISOString().split('T')[0]
    }
    setOrganizations(prev => [...prev, newOrg])
    setShowCreateModal(false)
    toast({
      title: "Organization created",
      description: `${orgData.name} has been created successfully.`,
    })
  }

  const handleEditOrganization = (orgData: any) => {
    setOrganizations(prev => prev.map(org => 
      org.id === editingOrg.id 
        ? { 
            ...org, 
            name: orgData.name, 
            description: orgData.description, 
            color: orgData.color 
          }
        : org
    ))
    setEditingOrg(null)
    toast({
      title: "Organization updated",
      description: `${orgData.name} has been updated successfully.`,
    })
  }

  const handleDeleteOrganization = (orgId: string) => {
    const orgToDelete = organizations.find(org => org.id === orgId)
    if (orgToDelete && orgToDelete.projectsCount > 0) {
      toast({
        title: "Cannot delete organization",
        description: "Please remove or reassign all projects before deleting this organization.",
        variant: "destructive"
      })
      return
    }
    
    setOrganizations(prev => prev.filter(org => org.id !== orgId))
    toast({
      title: "Organization deleted",
      description: "The organization has been deleted successfully.",
    })
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
          <Card key={org.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`w-12 h-12 rounded-lg ${org.color} flex items-center justify-center`}>
                    <Building className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{org.name}</CardTitle>
                    <CardDescription>{org.description}</CardDescription>
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
                      onClick={() => setEditingOrg(org)}
                      className="flex items-center"
                    >
                      <Pencil className="mr-2 h-4 w-4" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => handleDeleteOrganization(org.id)}
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
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-foreground">{org.projectsCount}</p>
                    <p className="text-sm text-muted-foreground">Projects</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-foreground">{org.membersCount}</p>
                    <p className="text-sm text-muted-foreground">Members</p>
                  </div>
                </div>
                
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>Created {org.createdAt}</span>
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