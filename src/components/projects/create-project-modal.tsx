'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'

interface Project {
  id: string
  name: string
}

interface CreateProjectModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: any) => void
  organizations?: Project[]
  organizationId?: string
  initialData?: {
    name: string
    description: string
    status: string
    dueDate: string
    organizationId: string
    color: string
    website?: string
    categories?: string[]
    documents?: string[]
  }
}

export function CreateProjectModal({ open, onOpenChange, onSubmit, organizations = [], organizationId, initialData }: CreateProjectModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    status: 'ACTIVE',
    dueDate: '',
    organizationId: organizationId || 'none',
    color: '#3B82F6', // Default blue
    website: '',
    categories: [] as string[],
    documents: [] as string[]
  })

  const [newCategory, setNewCategory] = useState('')
  const [newDocument, setNewDocument] = useState('')

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name,
        description: initialData.description || '',
        status: initialData.status,
        dueDate: initialData.dueDate || '',
        organizationId: initialData.organizationId || 'none',
        color: initialData.color,
        website: initialData.website || '',
        categories: initialData.categories || [],
        documents: initialData.documents || []
      })
    } else {
      // Reset form but keep organizationId if provided
      setFormData({ 
        name: '', 
        description: '', 
        status: 'ACTIVE', 
        dueDate: '', 
        organizationId: organizationId || 'none', 
        color: '#3B82F6',
        website: '',
        categories: [],
        documents: []
      })
    }
  }, [initialData, organizationId])

  const colorOptions = [
    { value: '#3B82F6', label: 'Blue' },
    { value: '#22C55E', label: 'Green' },
    { value: '#A855F7', label: 'Purple' },
    { value: '#EF4444', label: 'Red' },
    { value: '#F97316', label: 'Orange' },
    { value: '#06B6D4', label: 'Cyan' }
  ]

  const statusOptions = [
    { value: 'ACTIVE', label: 'Active' },
    { value: 'PLANNING', label: 'Planning' },
    { value: 'IN_PROGRESS', label: 'In Progress' },
    { value: 'ON_HOLD', label: 'On Hold' },
    { value: 'COMPLETED', label: 'Completed' }
  ]

    const handleAddCategory = () => {
    if (newCategory.trim() && !formData.categories.includes(newCategory.trim())) {
      setFormData(prev => ({
        ...prev,
        categories: [...prev.categories, newCategory.trim()]
      }))
      setNewCategory('')
    }
  }

  const handleRemoveCategory = (category: string) => {
    setFormData(prev => ({
      ...prev,
      categories: prev.categories.filter(c => c !== category)
    }))
  }

  const handleAddDocument = () => {
    if (newDocument.trim()) {
      const cleanDocument = newDocument.trim()
        // Remove any existing protocol
        .replace(/^https?:\/\//, '')
        // Remove localhost:3000 if present at the start
        .replace(/^localhost:\d+\//, '');

      // Don't add if it already exists (ignoring protocol)
      const exists = formData.documents.some(doc => 
        doc.replace(/^https?:\/\//, '') === cleanDocument
      );

      if (!exists) {
        setFormData(prev => ({
          ...prev,
          documents: [...prev.documents, cleanDocument]
        }));
        setNewDocument('');
      }
    }
  }

  const handleRemoveDocument = (document: string) => {
    setFormData(prev => ({
      ...prev,
      documents: prev.documents.filter(d => d !== document)
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (formData.name.trim()) {
      const submissionData = {
        ...formData,
        organizationId: formData.organizationId === 'none' ? undefined : formData.organizationId,
        website: formData.website.trim() || undefined,
        categories: formData.categories,
        documents: formData.documents
      }
      onSubmit(submissionData)
      if (!initialData) {
        setFormData({
          name: '',
          description: '',
          status: 'ACTIVE',
          dueDate: '',
          organizationId: 'none',
          color: '#3B82F6',
          website: '',
          categories: [],
          documents: []
        })
      }
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{initialData ? 'Edit Project' : 'Create New Project'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Enter project name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Enter project description"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={formData.status} onValueChange={(value) => setFormData(prev => ({ ...prev, status: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map((status) => (
                    <SelectItem key={status.value} value={status.value}>
                      {status.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="dueDate">Due Date</Label>
              <Input
                id="dueDate"
                type="date"
                value={formData.dueDate}
                onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {organizations.length > 0 && (
              <div className="space-y-2">
                <Label htmlFor="organization">Organization</Label>
                <Select value={formData.organizationId} onValueChange={(value) => setFormData(prev => ({ ...prev, organizationId: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select organization" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No Organization</SelectItem>
                    {organizations.map((org) => (
                      <SelectItem key={org.id} value={org.id}>
                        {org.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="color">Color Theme</Label>
              <Select value={formData.color} onValueChange={(value) => setFormData(prev => ({ ...prev, color: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a color">
                    {formData.color && (
                      <div className="flex items-center">
                        <div className="w-4 h-4 rounded mr-2" style={{ backgroundColor: formData.color }} />
                        {colorOptions.find(c => c.value === formData.color)?.label || 'Custom'}
                      </div>
                    )}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {colorOptions.map((color) => (
                    <SelectItem key={color.value} value={color.value}>
                      <div className="flex items-center">
                        <div className="w-4 h-4 rounded mr-2" style={{ backgroundColor: color.value }} />
                        {color.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="website">Website</Label>
            <Input
              id="website"
              value={formData.website}
              onChange={(e) => {
                const value = e.target.value;
                // Remove any existing protocol
                const cleanValue = value.replace(/^https?:\/\//, '');
                setFormData(prev => ({ ...prev, website: cleanValue }));
              }}
              placeholder="Enter domain (e.g. example.com)"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="categories">Categories</Label>
            <div className="flex gap-2">
              <Input
                id="categories"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                placeholder="Add a category"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    handleAddCategory()
                  }
                }}
              />
              <Button type="button" onClick={handleAddCategory}>Add</Button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {formData.categories.map((category) => (
                <Badge key={category} variant="secondary" className="px-2 py-1">
                  {category}
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="ml-2 h-4 w-4 p-0"
                    onClick={() => handleRemoveCategory(category)}
                  >
                    ×
                  </Button>
                </Badge>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="documents">Documents</Label>
            <div className="flex gap-2">
              <Input
                id="documents"
                value={newDocument}
                onChange={(e) => {
                  const value = e.target.value;
                  // Remove any existing protocol
                  const cleanValue = value.replace(/^https?:\/\//, '');
                  setNewDocument(cleanValue);
                }}
                placeholder="Add a document URL (e.g. docs.example.com/file)"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddDocument();
                  }
                }}
              />
              <Button type="button" onClick={handleAddDocument}>Add</Button>
            </div>
            <div className="flex flex-col gap-2 mt-2">
              {formData.documents.map((document, index) => {
                const displayUrl = document.replace(/^https?:\/\//, '');
                // Truncate URL if it's too long (show start and end)
                const truncatedUrl = displayUrl.length > 50 
                  ? `${displayUrl.slice(0, 42)}...${displayUrl.slice(-15)}`
                  : displayUrl;
                
                // Ensure proper URL formatting
                const fullUrl = document.startsWith('http://') || document.startsWith('https://')
                  ? document
                  : `https://${document}`;
                
                return (
                  <div key={`${document}-${index}`} className="flex items-center justify-between p-2 bg-muted rounded-md">
                    <a 
                      href={fullUrl} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="text-sm text-blue-500 hover:underline truncate"
                      title={displayUrl} // Show full URL on hover
                    >
                      {truncatedUrl}
                    </a>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveDocument(document)}
                      className="ml-2"
                    >
                      ×
                    </Button>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">
              {initialData ? 'Save Changes' : 'Create Project'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
} 