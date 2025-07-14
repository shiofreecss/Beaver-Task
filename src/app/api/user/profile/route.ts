import { getServerSession } from 'next-auth'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'
import * as z from 'zod'

const profileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  image: z.string().url('Invalid image URL').optional().or(z.literal('')),
  settings: z.object({
    theme: z.enum(['light', 'dark', 'system']).default('system'),
    emailNotifications: z.boolean().default(true),
    pushNotifications: z.boolean().default(true)
  }).default({
    theme: 'system',
    emailNotifications: true,
    pushNotifications: true
  })
})

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: {
        id: session.user.id as string,
      },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        settings: true,
      },
    })

    if (!user) {
      return new NextResponse('User not found', { status: 404 })
    }

    // Parse settings from JSON string
    const settings = user.settings ? JSON.parse(user.settings) : {
      theme: 'system',
      emailNotifications: true,
      pushNotifications: true
    }

    return NextResponse.json({
      user: {
        ...user,
        settings
      }
    })
  } catch (error) {
    console.error('Error fetching user profile:', error)
    return new NextResponse('Internal error', { status: 500 })
  }
}

export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const body = await req.json()
    const validatedData = profileSchema.parse(body)

    // Check if email is already taken by another user
    if (validatedData.email !== session.user.email) {
      const existingUser = await prisma.user.findUnique({
        where: {
          email: validatedData.email,
        },
      })

      if (existingUser) {
        return new NextResponse('Email already taken', { status: 400 })
      }
    }

    // Update user profile
    const updatedUser = await prisma.user.update({
      where: {
        id: session.user.id as string,
      },
      data: {
        name: validatedData.name,
        email: validatedData.email,
        image: validatedData.image || null,
        settings: JSON.stringify(validatedData.settings),
      },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        settings: true,
      },
    })

    // Parse settings from JSON string
    const settings = updatedUser.settings ? JSON.parse(updatedUser.settings) : {
      theme: 'system',
      emailNotifications: true,
      pushNotifications: true
    }

    return NextResponse.json({
      user: {
        ...updatedUser,
        settings
      }
    })
  } catch (error) {
    console.error('Error updating user profile:', error)
    
    if (error instanceof z.ZodError) {
      return new NextResponse(
        JSON.stringify({ 
          message: 'Invalid request data',
          errors: error.errors 
        }), 
        { status: 422 }
      )
    }

    return new NextResponse('Internal error', { status: 500 })
  }
} 