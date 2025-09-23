import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getAuthUser } from '@/lib/jwt'

// Define protected routes that require authentication
const protectedRoutes = [
  '/moreworks',
  '/companies',
  '/dashboard',
]

// Define API routes that require authentication
const protectedApiRoutes = [
  '/api/applicants',
  '/api/companies',
  '/api/positions',
  '/api/applications',
  '/api/users',
]

// Define public routes that don't require authentication
const publicRoutes = [
  '/',
  '/auth/login',
  '/auth/register',
  '/api/auth/login',
  '/api/auth/register',
  '/api/health',
]

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Get the authenticated user
  const user = getAuthUser(request)
  
  // Check if route is public
  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route))
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route))
  const isProtectedApiRoute = protectedApiRoutes.some(route => pathname.startsWith(route))

  // Handle API routes
  if (pathname.startsWith('/api/')) {
    // If it's a protected API route and user is not authenticated
    if (isProtectedApiRoute && !user) {
      return NextResponse.json(
        { success: false, message: 'Authentication required', error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    // Allow API routes to continue
    return NextResponse.next()
  }

  // Handle authentication routes
  if (pathname.startsWith('/auth/')) {
    // If user is already authenticated, redirect based on role
    if (user) {
      if (user.role === 'company') {
        return NextResponse.redirect(new URL('/companies', request.url))
      } else if (user.role === 'moreworks') {
        return NextResponse.redirect(new URL('/moreworks', request.url))
      }
      // Default redirect for other roles
      return NextResponse.redirect(new URL('/', request.url))
    }
    
    // Allow unauthenticated users to access auth pages
    return NextResponse.next()
  }

  // Handle protected dashboard routes
  if (isProtectedRoute) {
    // If user is not authenticated, redirect to login
    if (!user) {
      const loginUrl = new URL('/auth/login', request.url)
      loginUrl.searchParams.set('redirect', pathname)
      return NextResponse.redirect(loginUrl)
    }

    // Role-based access control for dashboard routes
    if (pathname.startsWith('/moreworks')) {
      if (user.role !== 'moreworks' && user.role !== 'admin') {
        // Redirect to appropriate dashboard based on role
        if (user.role === 'company') {
          return NextResponse.redirect(new URL('/companies', request.url))
        }
        return NextResponse.redirect(new URL('/', request.url))
      }
    }

    if (pathname.startsWith('/companies')) {
      if (user.role !== 'company' && user.role !== 'admin') {
        // Redirect to appropriate dashboard based on role
        if (user.role === 'moreworks') {
          return NextResponse.redirect(new URL('/moreworks', request.url))
        }
        return NextResponse.redirect(new URL('/', request.url))
      }
    }
  }

  // Handle root route - redirect authenticated users to appropriate dashboard
  if (pathname === '/' && user) {
    if (user.role === 'company') {
      return NextResponse.redirect(new URL('/companies', request.url))
    } else if (user.role === 'moreworks') {
      return NextResponse.redirect(new URL('/moreworks', request.url))
    }
  }

  // Allow the request to continue
  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public (public files)
     */
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
}
