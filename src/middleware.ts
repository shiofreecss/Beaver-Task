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
    
    // Only log in development to avoid Netlify function logs spam
    if (process.env.NODE_ENV === 'development') {
      console.log(req.nextUrl.pathname)
      console.log(req.nextauth.token)
    }
    
    // For authenticated users, continue to the requested page
    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl
        
        // Allow access to public pages without authentication
        if (pathname.startsWith('/login') ||
            pathname.startsWith('/register') ||
            pathname.startsWith('/presentation') ||
            pathname.startsWith('/privacy') ||
            pathname.startsWith('/terms') ||
            pathname.startsWith('/reset-password')) {
          return true
        }
        
        // For all other pages, require authentication
        return !!token
      }
    },
    pages: {
      signIn: '/login',
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
     * - .netlify (Netlify functions)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|\\.netlify).*)",
  ],
}