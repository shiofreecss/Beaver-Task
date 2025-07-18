import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-convex'
// import { prisma } from '@/lib/prisma'
import * as z from 'zod'

const organizationSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  description: z.string().optional(),
  color: z.string().optional(),
})

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    // All code using 'prisma' is commented out below
    // const organizations = await prisma.organization.findMany({
    //   where: {
    //     userId: session.user.id as string
    //   },
    //   include: {
    //     projects: {
    //       select: {
    //         id: true,
    //         name: true,
    //         status: true
    //       }
    //     }
    //   },
    //   orderBy: {
    //     createdAt: 'desc'
    //   }
    // })

    return NextResponse.json([]) // Return empty array as prisma is commented out
  } catch (error) {
    console.error('Error fetching organizations:', error)
    return new NextResponse('Internal Error', { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    console.log('Session:', session)
    
    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    console.log('User ID from session:', session.user.id)

    const body = await req.json()
    console.log('Request body:', body)
    
    const validatedData = organizationSchema.parse(body)
    console.log('Validated data:', validatedData)

    // Verify that the user exists
    // const user = await prisma.user.findUnique({
    //   where: {
    //     id: session.user.id as string
    //   }
    // })
    // console.log('Found user:', user)

    // if (!user) {
    //   return new NextResponse('User not found', { status: 404 })
    // }

    // const organization = await prisma.organization.create({
    //   data: {
    //     ...validatedData,
    //     userId: user.id
    //   },
    //   include: {
    //     projects: true
    //   }
    // })

    return NextResponse.json({ message: 'Organization creation is disabled' }) // Return a placeholder as prisma is commented out
  } catch (error) {
    console.error('Error creating organization:', error)
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
    const validatedData = organizationSchema.parse(updateData)

    if (!id) {
      return new NextResponse('Organization ID is required', { status: 400 })
    }

    // const organization = await prisma.organization.update({
    //   where: {
    //     id,
    //     userId: session.user.id as string
    //   },
    //   data: validatedData,
    //   include: {
    //     projects: true
    //   }
    // })

    return NextResponse.json({ message: 'Organization update is disabled' }) // Return a placeholder as prisma is commented out
  } catch (error) {
    console.error('Error updating organization:', error)
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
      return new NextResponse('Organization ID is required', { status: 400 })
    }

    // await prisma.organization.delete({
    //   where: {
    //     id,
    //     userId: session.user.id as string
    //   }
    // })

    return new NextResponse(null, { status: 204 })
  } catch (error) {
    console.error('Error deleting organization:', error)
    return new NextResponse('Internal Error', { status: 500 })
  }
} 