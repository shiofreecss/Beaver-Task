import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-convex'
import { convexHttp } from '@/lib/convex'
import { api } from '../../../../convex/_generated/api'
import * as z from 'zod'
import { Id } from '../../../../convex/_generated/dataModel'

const projectSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  description: z.string().optional(),
  status: z.enum(['ACTIVE', 'PLANNING', 'IN_PROGRESS', 'ON_HOLD', 'COMPLETED']),
  color: z.string().optional(),
  dueDate: z.string().optional().nullable(),
  organizationId: z.string().optional().nullable(),
  categories: z.array(z.string()).optional().transform((val) => {
    if (!val) return undefined;
    return val; // Return the array as-is, including empty arrays
  }),
  website: z.string().optional().transform((val) => {
    if (!val) return undefined;
    // If it already starts with http:// or https://, return as is
    if (val.startsWith('http://') || val.startsWith('https://')) return val;
    // Otherwise, add https:// prefix
    return `https://${val}`;
  }),
  documents: z.array(z.string()).optional().transform((val) => {
    if (!val) return undefined;
    if (val.length === 0) return []; // Return empty array instead of undefined
    // Transform each document URL
    const transformedDocs = val
      .filter(doc => doc && doc.trim()) // Remove empty strings
      .map(doc => {
        // If it already starts with http:// or https://, return as is
        if (doc.startsWith('http://') || doc.startsWith('https://')) return doc;
        // Otherwise, add https:// prefix
        return `https://${doc}`;
      });
    return transformedDocs.length > 0 ? transformedDocs : [];
  }),
})

// Simple in-memory cache for user IDs (reset on server restart)
const userIdCache = new Map<string, string>()

async function getOrCreateConvexUserId(sessionUserId: string, userName: string | null, userEmail: string | null) {
  // Check cache first
  if (userIdCache.has(sessionUserId)) {
    return userIdCache.get(sessionUserId)!
  }

  // If not in cache, query/create user
  const convexUserId = await convexHttp.mutation(api.users.findOrCreateUser, {
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

    const projects = await convexHttp.query(api.projects.getUserProjects, {
      userId: convexUserId as Id<'users'>
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

    const project = await convexHttp.mutation(api.projects.createProject, {
      ...validatedData,
      dueDate: validatedData.dueDate ? new Date(validatedData.dueDate).getTime() : undefined,
      organizationId: validatedData.organizationId as any,
      userId: convexUserId as Id<'users'>,
      website: validatedData.website,
      categories: validatedData.categories,
      documents: validatedData.documents
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
    const convexUserId = await convexHttp.mutation(api.users.findOrCreateUser, {
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

    const project = await convexHttp.mutation(api.projects.updateProject, {
      projectId: id as any,
      ...validatedData,
      dueDate: validatedData.dueDate ? new Date(validatedData.dueDate).getTime() : undefined,
      organizationId: validatedData.organizationId as any,
      userId: convexUserId,
      website: validatedData.website,
      categories: validatedData.categories,
      documents: validatedData.documents
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
    const convexUserId = await convexHttp.mutation(api.users.findOrCreateUser, {
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

    await convexHttp.mutation(api.projects.deleteProject, {
      projectId: projectId as any,
      userId: convexUserId
    })

    return new NextResponse(null, { status: 204 })
  } catch (error) {
    console.error('Error deleting project:', error)
    if (error instanceof Error && 'message' in error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Failed to delete project'
    }, { status: 500 })
  }
} 
