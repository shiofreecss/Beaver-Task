import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import * as z from 'zod'

const projectSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  description: z.string().optional(),
  status: z.enum(['ACTIVE', 'PLANNING', 'ON_HOLD', 'COMPLETED']).default('ACTIVE'),
  color: z.string().optional(),
  dueDate: z.string().optional().nullable(),
  organizationId: z.string().optional().nullable(),
})

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const projects = await prisma.project.findMany({
      where: {
        userId: session.user.id
      },
      include: {
        organization: {
          select: {
            id: true,
            name: true
          }
        },
        tasks: {
          select: {
            id: true,
            title: true,
            status: true,
            completed: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(projects)
  } catch (error) {
    console.error('Error fetching projects:', error)
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
    const validatedData = projectSchema.parse(body)

    const project = await prisma.project.create({
      data: {
        ...validatedData,
        dueDate: validatedData.dueDate ? new Date(validatedData.dueDate) : null,
        userId: session.user.id
      },
      include: {
        organization: {
          select: {
            id: true,
            name: true
          }
        }
      }
    })

    return NextResponse.json(project)
  } catch (error) {
    console.error('Error creating project:', error)
    if (error instanceof z.ZodError) {
      return new NextResponse('Invalid request data', { status: 422 })
    }
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
    const { id, ...updateData } = body
    const validatedData = projectSchema.parse(updateData)

    if (!id) {
      return new NextResponse('Project ID is required', { status: 400 })
    }

    const project = await prisma.project.update({
      where: {
        id,
        userId: session.user.id
      },
      data: {
        ...validatedData,
        dueDate: validatedData.dueDate ? new Date(validatedData.dueDate) : null
      },
      include: {
        organization: {
          select: {
            id: true,
            name: true
          }
        }
      }
    })

    return NextResponse.json(project)
  } catch (error) {
    console.error('Error updating project:', error)
    if (error instanceof z.ZodError) {
      return new NextResponse('Invalid request data', { status: 422 })
    }
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
      return new NextResponse('Project ID is required', { status: 400 })
    }

    await prisma.project.delete({
      where: {
        id,
        userId: session.user.id
      }
    })

    return new NextResponse(null, { status: 204 })
  } catch (error) {
    console.error('Error deleting project:', error)
    return new NextResponse('Internal Error', { status: 500 })
  }
} 