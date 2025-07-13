import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const notes = await prisma.note.findMany({
      where: {
        userId: session.user.id
      },
      include: {
        project: {
          select: {
            name: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Transform notes to include project name and parse tags
    const transformedNotes = notes.map(note => ({
      ...note,
      tags: note.tags.split(',').map(tag => tag.trim()).filter(Boolean),
      projectName: note.project?.name || null
    }))

    return NextResponse.json(transformedNotes)
  } catch (error) {
    console.error('Error fetching notes:', error)
    return new NextResponse('Internal Error', { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const body = await req.json()
    const { title, content, tags, projectId } = body

    if (!title || !content) {
      return new NextResponse('Title and content are required', { status: 400 })
    }

    const note = await prisma.note.create({
      data: {
        title,
        content,
        tags: Array.isArray(tags) ? tags.join(',') : tags || '',
        projectId: projectId || null,
        userId: session.user.id
      },
      include: {
        project: {
          select: {
            name: true
          }
        }
      }
    })

    return NextResponse.json({
      ...note,
      tags: note.tags.split(',').map(tag => tag.trim()).filter(Boolean),
      projectName: note.project?.name || null
    })
  } catch (error) {
    console.error('Error creating note:', error)
    return new NextResponse('Internal Error', { status: 500 })
  }
}

export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const body = await req.json()
    const { id, title, content, tags, projectId } = body

    if (!id) {
      return new NextResponse('Note ID is required', { status: 400 })
    }

    if (!title || !content) {
      return new NextResponse('Title and content are required', { status: 400 })
    }

    const note = await prisma.note.update({
      where: {
        id,
        userId: session.user.id
      },
      data: {
        title,
        content,
        tags: Array.isArray(tags) ? tags.join(',') : tags || '',
        projectId: projectId || null
      },
      include: {
        project: {
          select: {
            name: true
          }
        }
      }
    })

    return NextResponse.json({
      ...note,
      tags: note.tags.split(',').map(tag => tag.trim()).filter(Boolean),
      projectName: note.project?.name || null
    })
  } catch (error) {
    console.error('Error updating note:', error)
    return new NextResponse('Internal Error', { status: 500 })
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')

    if (!id) {
      return new NextResponse('Note ID is required', { status: 400 })
    }

    await prisma.note.delete({
      where: {
        id,
        userId: session.user.id
      }
    })

    return new NextResponse(null, { status: 204 })
  } catch (error) {
    console.error('Error deleting note:', error)
    return new NextResponse('Internal Error', { status: 500 })
  }
} 