import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { event, details, userAgent, ip, timestamp } = body

    // Log security event
    console.warn('SECURITY EVENT:', {
      event,
      details,
      userAgent,
      ip: ip || request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip'),
      timestamp: timestamp || new Date().toISOString(),
      path: request.url,
      method: request.method,
    })

    // In production, you might want to send this to a security monitoring service
    // like Sentry, LogRocket, or a custom security dashboard

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error logging security event:', error)
    return NextResponse.json({ success: false }, { status: 500 })
  }
} 