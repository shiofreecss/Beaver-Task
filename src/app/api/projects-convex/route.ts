import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-convex'
import { convexHttp } from '@/lib/convex'
import { api } from '../../../../convex/_generated/api'
import * as z from 'zod'

const projectSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  status: z.enum(['ACTIVE', 'COMPLETED', 'ON_HOLD', 'CANCELLED']).default('ACTIVE'),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).default('MEDIUM'),
  dueDate: z.string().optional().nullable(),
  organizationId: z.string().optional().nullable(),
  color: z.string().optional(),
  categories: z.array(z.string()).optional(),
  website: z.string().optional(),
  documents: z.array(z.string()).optional(),
})

const projectUpdateSchema = z.object({
  name: z.string().min(1, 'Name is required').optional(),
  description: z.string().optional(),
  status: z.enum(['ACTIVE', 'COMPLETED', 'ON_HOLD', 'CANCELLED']).optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).optional(),
  dueDate: z.string().optional().nullable(),
  organizationId: z.string().optional().nullable(),
  color: z.string().optional(),
  categories: z.array(z.string()).optional(),
  website: z.string().optional(),
  documents: z.array(z.string()).optional(),
})

// Cache for user IDs to avoid repeated lookups
const userCache = new Map<string, string>()

async function getConvexUserId(sessionUserId: string, userName: string, userEmail: string): Promise<string> {
  // Check cache first
  if (userCache.has(sessionUserId)) {
    return userCache.get(sessionUserId)!
  }

  // Create or find user in Convex
  const convexUserId = await convexHttp.mutation(api.users.findOrCreateUser, {
    id: sessionUserId,
    name: userName || 'Unknown User',
    email: userEmail || '',
  })

  // Cache the result
  userCache.set(sessionUserId, convexUserId)
  return convexUserId
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const projects = await convexHttp.query(api.projects.getUserProjects, {
      userId: session.user.id as any
    })

    return NextResponse.json(projects)
  } catch (error) {
    console.error('Error fetching projects:', error)
    return NextResponse.json({ error: 'Failed to fetch projects' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const convexUserId = await getConvexUserId(
      session.user.id,
      session.user.name || 'Unknown User',
      session.user.email || ''
    )

    const body = await request.json()
    const validatedData = projectSchema.parse(body)

    // Prepare clean data for Convex
    const convexData: any = {
      name: validatedData.name,
      userId: convexUserId as any
    }

    // Only add fields that have actual values
    if (validatedData.description !== undefined) convexData.description = validatedData.description
    if (validatedData.status !== undefined) convexData.status = validatedData.status
    if (validatedData.priority !== undefined) convexData.priority = validatedData.priority
    if (validatedData.dueDate !== undefined && validatedData.dueDate !== null) {
      convexData.dueDate = new Date(validatedData.dueDate).getTime()
    }
    if (validatedData.organizationId !== undefined && validatedData.organizationId !== null && validatedData.organizationId !== '') {
      convexData.organizationId = validatedData.organizationId as any
    }
    if (validatedData.color !== undefined) convexData.color = validatedData.color
    if (validatedData.categories !== undefined) convexData.categories = validatedData.categories
    if (validatedData.website !== undefined) convexData.website = validatedData.website
    if (validatedData.documents !== undefined) convexData.documents = validatedData.documents

    const project = await convexHttp.mutation(api.projects.createProject, convexData)

    return NextResponse.json(project)
  } catch (error) {
    console.error('Error creating project:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid request data', details: error.errors }, { status: 422 })
    }
    return NextResponse.json({ error: 'Failed to create project' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const convexUserId = await getConvexUserId(
      session.user.id,
      session.user.name || 'Unknown User',
      session.user.email || ''
    )

    const body = await request.json()
    const { id, ...updateData } = body

    if (!id) {
      return NextResponse.json({ error: 'Project ID is required' }, { status: 400 })
    }

    const validatedData = projectUpdateSchema.parse(updateData)

    // Prepare clean data for Convex
    const convexData: any = {
      projectId: id as any,
      userId: convexUserId as any
    }

    // Only add fields that have actual values
    if (validatedData.name !== undefined) convexData.name = validatedData.name
    if (validatedData.description !== undefined) convexData.description = validatedData.description
    if (validatedData.status !== undefined) convexData.status = validatedData.status
    if (validatedData.priority !== undefined) convexData.priority = validatedData.priority
    if (validatedData.dueDate !== undefined && validatedData.dueDate !== null) {
      convexData.dueDate = new Date(validatedData.dueDate).getTime()
    }
    if (validatedData.organizationId !== undefined && validatedData.organizationId !== null && validatedData.organizationId !== '') {
      convexData.organizationId = validatedData.organizationId as any
    }
    if (validatedData.color !== undefined) convexData.color = validatedData.color
    if (validatedData.categories !== undefined) convexData.categories = validatedData.categories
    if (validatedData.website !== undefined) convexData.website = validatedData.website
    if (validatedData.documents !== undefined) convexData.documents = validatedData.documents

    const project = await convexHttp.mutation(api.projects.updateProject, convexData)

    return NextResponse.json(project)
  } catch (error) {
    console.error('Error updating project:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid request data', details: error.errors }, { status: 422 })
    }
    return NextResponse.json({ error: 'Failed to update project' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const convexUserId = await getConvexUserId(
      session.user.id,
      session.user.name || 'Unknown User',
      session.user.email || ''
    )

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Project ID is required' }, { status: 400 })
    }

    // Validate that the ID looks like a valid Convex ID
    if (!id.match(/^[a-zA-Z0-9_-]+$/)) {
      return NextResponse.json({ error: 'Invalid project ID format' }, { status: 400 })
    }

    try {
      await convexHttp.mutation(api.projects.deleteProject, {
        projectId: id as any,
        userId: convexUserId as any
      })

      return new NextResponse(null, { status: 204 })
    } catch (convexError: any) {
      console.error('Convex error during project deletion:', convexError)
      
      // Handle specific Convex errors
      if (convexError.data === 'Project not found or unauthorized') {
        return NextResponse.json({ 
          error: 'Project not found or you do not have permission to delete it' 
        }, { status: 404 })
      }
      
      // Re-throw other Convex errors
      throw convexError
    }
  } catch (error) {
    console.error('Error deleting project:', error)
    
    // Return more specific error messages
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    
    return NextResponse.json({ error: 'Failed to delete project' }, { status: 500 })
  }
} 
