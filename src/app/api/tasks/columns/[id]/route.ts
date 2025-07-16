import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-convex'
import { prisma } from '@/lib/prisma'

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const body = await request.json()
    const { name, color, order } = body

    // Verify the column exists
    const existingColumn = await prisma.kanbanColumn.findUnique({
      where: { id: params.id },
      include: {
        project: {
          include: {
            organization: true
          }
        }
      }
    })

    if (!existingColumn) {
      return new NextResponse('Column not found', { status: 404 })
    }

    // If the column belongs to a project, verify ownership
    if (existingColumn.project?.organization && existingColumn.project.organization.userId !== session.user.id as string) {
      return new NextResponse('Unauthorized', { status: 401 })
    } else if (existingColumn.project && !existingColumn.project.organization && existingColumn.project.userId !== session.user.id as string) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const column = await prisma.kanbanColumn.update({
      where: { id: params.id },
      data: {
        ...(name && { name }),
        ...(color && { color }),
        ...(typeof order === 'number' && { order })
      }
    })

    return NextResponse.json(column)
  } catch (error) {
    console.error('Error updating column:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    // Verify the column exists
    const existingColumn = await prisma.kanbanColumn.findUnique({
      where: { id: params.id },
      include: {
        project: {
          include: {
            organization: true
          }
        }
      }
    })

    if (!existingColumn) {
      return new NextResponse('Column not found', { status: 404 })
    }

    // If the column belongs to a project, verify ownership
    if (existingColumn.project?.organization && existingColumn.project.organization.userId !== session.user.id as string) {
      return new NextResponse('Unauthorized', { status: 401 })
    } else if (existingColumn.project && !existingColumn.project.organization && existingColumn.project.userId !== session.user.id as string) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    await prisma.kanbanColumn.delete({
      where: { id: params.id }
    })

    return new NextResponse(null, { status: 204 })
  } catch (error) {
    console.error('Error deleting column:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
} 