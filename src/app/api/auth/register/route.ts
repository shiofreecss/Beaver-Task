import { NextResponse } from 'next/server'
import { hash } from 'bcrypt'
import { convexHttp } from '@/lib/convex'
import { api } from '../../../../../convex/_generated/api'
import * as z from 'zod'

const userSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  name: z.string().min(1, 'Name is required'),
  role: z.enum(['ADMIN', 'MANAGER', 'MEMBER']).optional().default('MEMBER'),
})

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { email, password, name, role } = userSchema.parse(body)

    // Hash password
    const hashedPassword = await hash(password, 10)

    // Create user in Convex
    const userId = await convexHttp.mutation(api.users.createUser, {
      email,
      password: hashedPassword,
      name,
      role,
    })

    return NextResponse.json(
      { message: 'User created successfully', userId },
      { status: 201 }
    )
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', issues: error.issues },
        { status: 422 }
      )
    }

    // Handle Convex ConvexError for duplicate email
    if (error instanceof Error && error.message.includes('already exists')) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 409 }
      )
    }

    console.error('Registration error:', error)
    return NextResponse.json(
      { error: 'Something went wrong' },
      { status: 500 }
    )
  }
} 