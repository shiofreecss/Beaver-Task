import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

// Custom middleware to handle security issues
function securityMiddleware(request: Request) {
  const url = new URL(request.url)
  
  // Check for credentials in URL parameters (security risk)
  const email = url.searchParams.get('email')
  const password = url.searchParams.get('password')
  
  if (email || password) {
    // Log security warning
    console.warn('SECURITY WARNING: Credentials detected in URL parameters:', {
      path: url.pathname,
      hasEmail: !!email,
      hasPassword: !!password,
      userAgent: request.headers.get('user-agent'),
      referer: request.headers.get('referer'),
      timestamp: new Date().toISOString()
    })
    
    // Clean the URL by removing credentials
    url.searchParams.delete('email')
    url.searchParams.delete('password')
    
    // Redirect to clean URL
    return NextResponse.redirect(url)
  }
  
  return null // Continue with other middleware
}

export default withAuth(
  // `withAuth` augments your `Request` with the user's token.
  function middleware(req) {
    // First check for security issues
    const securityResponse = securityMiddleware(req)
    if (securityResponse) {
      return securityResponse
    }
    
    console.log(req.nextUrl.pathname)
    console.log(req.nextauth.token)
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token
    },
  }
)

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - login (login page)
     * - register (register page)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|login|register).*)",
  ],
} 