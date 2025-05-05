import { NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'

// Define protected routes that require authentication
const protectedRoutes = [
  '/profile',
  '/bookmarks',
  '/settings',
]

// Define API routes that require authentication
const protectedApiRoutes = [
  '/api/bookmarks',
  '/api/ratings',
  '/api/comments',
  '/api/user',
]

export async function middleware(request) {
  const { pathname } = request.nextUrl

  // Check if it's an API route
  const isApiRoute = pathname.startsWith('/api/')
  
  // Check if the route requires protection
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route))
  const isProtectedApiRoute = protectedApiRoutes.some(route => pathname.startsWith(route))

  if (!isProtectedRoute && !isProtectedApiRoute) {
    return NextResponse.next()
  }

  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET
  })

  // Redirect to login if accessing protected page without auth
  if (!token && isProtectedRoute) {
    const url = new URL('/login', request.url)
    url.searchParams.set('callbackUrl', encodeURI(pathname))
    return NextResponse.redirect(url)
  }

  // Return 401 if accessing protected API without auth
  if (!token && isProtectedApiRoute) {
    return new NextResponse(
      JSON.stringify({ error: 'Authentication required' }),
      {
        status: 401,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    )
  }

  // Add user info to headers for API routes
  if (token && isApiRoute) {
    const requestHeaders = new Headers(request.headers)
    requestHeaders.set('x-user-id', token.id)
    requestHeaders.set('x-user-role', token.role || 'user')

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    })
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
  ],
} 