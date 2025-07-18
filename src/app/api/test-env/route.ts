import { NextResponse } from 'next/server'

export async function GET() {
  const envVars = {
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET ? 'Set' : 'Missing',
    NEXTAUTH_URL: process.env.NEXTAUTH_URL || 'Missing',
    NEXT_PUBLIC_CONVEX_URL: process.env.NEXT_PUBLIC_CONVEX_URL || 'Missing',
    CONVEX_URL: process.env.CONVEX_URL || 'Missing',
    NODE_ENV: process.env.NODE_ENV || 'Missing',
    NETLIFY: process.env.NETLIFY || 'Missing'
  }

  return NextResponse.json({
    message: 'Environment variables test',
    environment: envVars,
    timestamp: new Date().toISOString()
  })
} 