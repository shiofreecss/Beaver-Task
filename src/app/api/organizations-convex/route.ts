import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-convex'
import { convexHttp } from '@/lib/convex'
import { api } from '../../../../convex/_generated/api'
import * as z from 'zod'
import { Id } from '../../../../convex/_generated/dataModel'

const organizationSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  description: z.string().optional(),
  color: z.string().optional(),
  department: z.string().optional(),
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
  order: z.number().optional(),
})

// Simple in-memory cache for user IDs (reset on server restart)
const userIdCache = new Map<string, Id<'users'>>()

async function getOrCreateConvexUserId(sessionUserId: string, userName: string | null, userEmail: string | null): Promise<Id<'users'>> {
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

    const organizations = await convexHttp.query(api.organizations.getUserOrganizations, {
      userId: convexUserId
    })

    return NextResponse.json(organizations)
  } catch (error) {
    console.error('Error fetching organizations:', error)
    return NextResponse.json({ error: 'Failed to fetch organizations' }, { status: 500 })
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
    const validatedData = organizationSchema.parse(body)

    const organization = await convexHttp.mutation(api.organizations.createOrganization, {
      ...validatedData,
      userId: convexUserId,
      department: validatedData.department,
      categories: validatedData.categories,
      website: validatedData.website,
      documents: validatedData.documents
    })

    return NextResponse.json(organization)
  } catch (error) {
    console.error('Error creating organization:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid request data', details: error.errors }, { status: 422 })
    }
    return NextResponse.json({ error: 'Failed to create organization' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
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
    const { id, ...updateData } = body
    
    if (!id) {
      return NextResponse.json({ error: 'Organization ID is required' }, { status: 400 })
    }

    const validatedData = organizationSchema.parse(updateData)

    const organization = await convexHttp.mutation(api.organizations.updateOrganization, {
      id: id,
      ...validatedData,
      userId: convexUserId,
      department: validatedData.department,
      categories: validatedData.categories,
      website: validatedData.website,
      documents: validatedData.documents
    })

    return NextResponse.json(organization)
  } catch (error) {
    console.error('Error updating organization:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid request data', details: error.errors }, { status: 422 })
    }
    return NextResponse.json({ error: 'Failed to update organization' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
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

    const url = new URL(request.url)
    const id = url.searchParams.get('id')
    
    if (!id) {
      return NextResponse.json({ error: 'Organization ID is required' }, { status: 400 })
    }

    await convexHttp.mutation(api.organizations.deleteOrganization, { 
      id: id as Id<'organizations'>,
      userId: convexUserId
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting organization:', error)
    return NextResponse.json({ error: 'Failed to delete organization' }, { status: 500 })
  }
} 