import { getServerSession } from 'next-auth'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth-convex'
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

    let user = await prisma.user.findUnique({
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

    // If user doesn't exist in Prisma, create them with default settings
    // This handles the case where user was created in Convex but not in Prisma
    if (!user) {
      try {
        user = await prisma.user.create({
          data: {
            id: session.user.id as string,
            name: session.user.name || 'User',
            email: session.user.email || '',
            password: '', // Empty password since they're authenticated via Convex
            image: null,
            settings: JSON.stringify({
              theme: 'system',
              emailNotifications: true,
              pushNotifications: true
            }),
          },
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            settings: true,
          },
        })
      } catch (createError) {
        console.error('Error creating user in Prisma:', createError)
        return new NextResponse('Failed to create user profile', { status: 500 })
      }
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

      if (existingUser && existingUser.id !== session.user.id) {
        return new NextResponse('Email already taken', { status: 400 })
      }
    }

    // First, try to find the user
    let user = await prisma.user.findUnique({
      where: {
        id: session.user.id as string,
      },
    })

    // If user doesn't exist in Prisma, create them
    // This handles the case where user was created in Convex but not in Prisma
    if (!user) {
      try {
        user = await prisma.user.create({
          data: {
            id: session.user.id as string,
            name: validatedData.name,
            email: validatedData.email,
            password: '', // Empty password since they're authenticated via Convex
            image: validatedData.image || null,
            settings: JSON.stringify(validatedData.settings),
          },
        })
      } catch (createError) {
        console.error('Error creating user in Prisma:', createError)
        return new NextResponse('Failed to create user profile', { status: 500 })
      }
    } else {
      // Update existing user
      try {
        user = await prisma.user.update({
          where: {
            id: session.user.id as string,
          },
          data: {
            name: validatedData.name,
            email: validatedData.email,
            image: validatedData.image || null,
            settings: JSON.stringify(validatedData.settings),
          },
        })
      } catch (updateError) {
        console.error('Error updating user in Prisma:', updateError)
        return new NextResponse('Failed to update user profile', { status: 500 })
      }
    }

    // Parse settings from JSON string
    const settings = user.settings ? JSON.parse(user.settings) : {
      theme: 'system',
      emailNotifications: true,
      pushNotifications: true
    }

    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        image: user.image,
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