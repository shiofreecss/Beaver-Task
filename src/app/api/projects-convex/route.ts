import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-convex'
import convex from '@/lib/convex'
import { api } from '../../../../convex/_generated/api'
import * as z from 'zod'

const projectSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  description: z.string().optional(),
  status: z.enum(['ACTIVE', 'PLANNING', 'IN_PROGRESS', 'ON_HOLD', 'COMPLETED']),
  color: z.string().optional(),
  dueDate: z.string().optional().nullable(),
  organizationId: z.string().optional().nullable(),
})

// Simple in-memory cache for user IDs (reset on server restart)
const userIdCache = new Map<string, string>()

async function getOrCreateConvexUserId(sessionUserId: string, userName: string | null, userEmail: string | null) {
  // Check cache first
  if (userIdCache.has(sessionUserId)) {
    return userIdCache.get(sessionUserId)!
  }

  // If not in cache, query/create user
  const convexUserId = await convex.mutation(api.users.findOrCreateUser, {
    id: sessionUserId,
    name: userName || 'Unknown User',
    email: userEmail || '',
  })

  // Cache the result
  userIdCache.set(sessionUserId, convexUserId)
  return convexUserId
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Use cached user lookup
    const convexUserId = await getOrCreateConvexUserId(
      session.user.id,
      session.user.name,
      session.user.email
    )

    const projects = await convex.query(api.projects.getUserProjects, {
      userId: convexUserId
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

    // Use cached user lookup
    const convexUserId = await getOrCreateConvexUserId(
      session.user.id,
      session.user.name,
      session.user.email
    )

    const body = await request.json()
    const validatedData = projectSchema.parse(body)

    const project = await convex.mutation(api.projects.createProject, {
      ...validatedData,
      dueDate: validatedData.dueDate ? new Date(validatedData.dueDate).getTime() : undefined,
      organizationId: validatedData.organizationId as any,
      userId: convexUserId
    })

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

    // Ensure user exists in Convex database
    const convexUserId = await convex.mutation(api.users.findOrCreateUser, {
      id: session.user.id,
      name: session.user.name || 'Unknown User',
      email: session.user.email || '',
    })

    const body = await request.json()
    const { id, ...updateData } = body
    const validatedData = projectSchema.parse(updateData)

    if (!id) {
      return NextResponse.json({ error: 'Project ID is required' }, { status: 400 })
    }

    const project = await convex.mutation(api.projects.updateProject, {
      projectId: id as any,
      ...validatedData,
      dueDate: validatedData.dueDate ? new Date(validatedData.dueDate).getTime() : undefined,
      organizationId: validatedData.organizationId as any,
      userId: convexUserId
    })

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

    // Ensure user exists in Convex database
    const convexUserId = await convex.mutation(api.users.findOrCreateUser, {
      id: session.user.id,
      name: session.user.name || 'Unknown User',
      email: session.user.email || '',
    })

    // Get project ID from request body
    const body = await request.json()
    const { projectId } = body

    if (!projectId) {
      return NextResponse.json({ error: 'Project ID is required' }, { status: 400 })
    }

    console.log('Deleting project:', { projectId, userId: convexUserId })

    await convex.mutation(api.projects.deleteProject, {
      projectId: projectId as any,
      userId: convexUserId
    })

    return new NextResponse(null, { status: 204 })
  } catch (error) {
    console.error('Error deleting project:', error)
    if (error instanceof ConvexError) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Failed to delete project'
    }, { status: 500 })
  }
} 