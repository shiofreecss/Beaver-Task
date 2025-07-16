import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-convex'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const columns = await prisma.kanbanColumn.findMany({
      where: {
        OR: [
          {
            projectId: null // Global columns
          },
          {
            project: {
              userId: session.user.id as string
            }
          }
        ]
      },
      orderBy: {
        order: 'asc'
      }
    })

    return NextResponse.json(columns)
  } catch (error) {
    console.error('Error fetching columns:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const body = await request.json()
    const { name, color, order, projectId } = body

    if (!name || !color || typeof order !== 'number') {
      return new NextResponse('Missing required fields', { status: 400 })
    }

    // If projectId is provided, verify the project exists and belongs to the user
    if (projectId) {
      const project = await prisma.project.findUnique({
        where: {
          id: projectId,
        },
        include: {
          organization: true
        }
      })

      if (!project) {
        return new NextResponse('Project not found', { status: 404 })
      }

      if (project.organization && project.organization.userId !== session.user.id as string) {
        return new NextResponse('Unauthorized', { status: 401 })
      } else if (!project.organization && project.userId !== session.user.id as string) {
        return new NextResponse('Unauthorized', { status: 401 })
      }
    }

    const column = await prisma.kanbanColumn.create({
      data: {
        name,
        color,
        order,
        projectId
      }
    })

    return NextResponse.json(column)
  } catch (error) {
    console.error('Error creating column:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
} 