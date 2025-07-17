import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-convex'
import { convexHttp } from '@/lib/convex'
import { api } from '../../../../convex/_generated/api'
import * as z from 'zod'

const noteSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  content: z.string(),
  tags: z.union([z.string(), z.array(z.string())]).transform((val) => {
    if (Array.isArray(val)) {
      return val.join(',');
    }
    return val;
  }),
  projectId: z.string().optional().nullable(),
  taskId: z.string().optional().nullable(),
})

export async function GET() {
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

    const notes = await convexHttp.query(api.notes.getUserNotes, {
      userId: convexUserId
    })

    return NextResponse.json(notes)
  } catch (error) {
    console.error('Error fetching notes:', error)
    return NextResponse.json({ error: 'Failed to fetch notes' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
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
    const validatedData = noteSchema.parse(body)

    const note = await convexHttp.mutation(api.notes.createNote, {
      ...validatedData,
      projectId: validatedData.projectId ? (validatedData.projectId as any) : undefined,
      taskId: validatedData.taskId ? (validatedData.taskId as any) : undefined,
      userId: convexUserId
    })

    return NextResponse.json(note)
  } catch (error) {
    console.error('Error creating note:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid request data', details: error.errors }, { status: 422 })
    }
    return NextResponse.json({ error: 'Failed to create note' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    console.log('PUT /api/notes-convex called')
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      console.log('No session or user ID')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('Session user:', session.user)

    // Ensure user exists in Convex database
    const convexUserId = await convexHttp.mutation(api.users.findOrCreateUser, {
      id: session.user.id,
      name: session.user.name || 'Unknown User',
      email: session.user.email || '',
    })

    console.log('Convex user ID:', convexUserId)

    const body = await request.json()
    console.log('Request body:', body)
    const { id, ...updateData } = body
    const validatedData = noteSchema.parse(updateData)
    console.log('Validated data:', validatedData)

    if (!id) {
      return NextResponse.json({ error: 'Note ID is required' }, { status: 400 })
    }

    console.log('Calling Convex updateNote with:', {
      noteId: id,
      ...validatedData,
      projectId: validatedData.projectId ? (validatedData.projectId as any) : undefined,
      taskId: validatedData.taskId ? (validatedData.taskId as any) : undefined,
      userId: convexUserId
    })

    const note = await convexHttp.mutation(api.notes.updateNote, {
      noteId: id as any,
      ...validatedData,
      projectId: validatedData.projectId ? (validatedData.projectId as any) : undefined,
      taskId: validatedData.taskId ? (validatedData.taskId as any) : undefined,
      userId: convexUserId
    })

    console.log('Note updated successfully:', note)
    return NextResponse.json(note)
  } catch (error) {
    console.error('Error updating note:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid request data', details: error.errors }, { status: 422 })
    }
    return NextResponse.json({ error: 'Failed to update note' }, { status: 500 })
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

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Note ID is required' }, { status: 400 })
    }

    await convexHttp.mutation(api.notes.deleteNote, {
      noteId: id as any,
      userId: convexUserId
    })

    return new NextResponse(null, { status: 204 })
  } catch (error) {
    console.error('Error deleting note:', error)
    return NextResponse.json({ error: 'Failed to delete note' }, { status: 500 })
  }
} 