import { prisma } from '@/lib/prisma'
import { hash } from 'bcrypt'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: {
        email: 'shio@beaver.foundation'
      }
    })

    if (existingUser) {
      return NextResponse.json({ message: 'Test user already exists' })
    }

    // Create test user
    const hashedPassword = await hash('Test@1234', 12)
    const user = await prisma.user.create({
      data: {
        name: 'shiodev',
        email: 'shio@beaver.foundation',
        password: hashedPassword,
      }
    })

    return NextResponse.json({ message: 'Test user created successfully', userId: user.id })
  } catch (error) {
    console.error('Error creating test user:', error)
    return NextResponse.json({ error: 'Failed to create test user' }, { status: 500 })
  }
} 