'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus, Search, Tag, Calendar } from 'lucide-react'

export function NotesView() {
  const [notes] = useState([
    {
      id: '1',
      title: 'Meeting Notes - Project Kickoff',
      content: 'Discussed project timeline, deliverables, and team roles. Key decisions: Use React for frontend, deploy on Vercel...',
      tags: ['meeting', 'project', 'planning'],
      createdAt: '2024-01-18',
      project: 'Website Redesign'
    },
    {
      id: '2',
      title: 'Research Findings',
      content: 'Competitor analysis reveals that most apps in our space lack proper user onboarding. Opportunity to differentiate...',
      tags: ['research', 'competitors', 'analysis'],
      createdAt: '2024-01-17',
      project: 'Mobile App Development'
    },
    {
      id: '3',
      title: 'Design Ideas',
      content: 'Color scheme ideas: Primary blue (#2563eb), secondary green (#059669). Typography: Inter for headers, system fonts for body...',
      tags: ['design', 'ui', 'colors'],
      createdAt: '2024-01-16',
      project: 'Website Redesign'
    },
    {
      id: '4',
      title: 'Technical Requirements',
      content: 'API must support real-time updates, offline functionality, and data synchronization. Consider using WebSockets...',
      tags: ['technical', 'api', 'requirements'],
      createdAt: '2024-01-15',
      project: 'Mobile App Development'
    }
  ])

  const getTagColor = (tag: string) => {
    const colors = {
      'meeting': 'bg-blue-100 text-blue-800',
      'project': 'bg-green-100 text-green-800',
      'planning': 'bg-purple-100 text-purple-800',
      'research': 'bg-orange-100 text-orange-800',
      'design': 'bg-pink-100 text-pink-800',
      'technical': 'bg-gray-100 text-gray-800'
    }
    return colors[tag as keyof typeof colors] || 'bg-gray-100 text-gray-800'
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Notes</h1>
          <p className="text-gray-600">Capture and organize your thoughts</p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          New Note
        </Button>
      </div>

      {/* Search and Filter */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <input
            type="text"
            placeholder="Search notes..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Notes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {notes.map((note) => (
          <Card key={note.id} className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <CardTitle className="text-lg line-clamp-2">{note.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                {note.content}
              </p>
              
              <div className="space-y-3">
                {/* Tags */}
                <div className="flex flex-wrap gap-1">
                  {note.tags.map((tag, index) => (
                    <span
                      key={index}
                      className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${getTagColor(tag)}`}
                    >
                      <Tag className="mr-1 h-2 w-2" />
                      {tag}
                    </span>
                  ))}
                </div>
                
                {/* Metadata */}
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span className="bg-gray-100 px-2 py-1 rounded">
                    {note.project}
                  </span>
                  <div className="flex items-center">
                    <Calendar className="mr-1 h-3 w-3" />
                    {note.createdAt}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
} 