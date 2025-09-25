import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getAuthUser } from '@/lib/jwt'

// Define protected routes that require authentication
const protectedRoutes = [
  '/admin',
  '/dashboard',
]

// Define API routes that require authentication
const protectedApiRoutes = [
  '/api/applicants',
  '/api/companies',
  '/api/positions',
  '/api/applications',
  '/api/users',
  '/api/auth/me',
  '/api/auth/logout',
  '/api/job-types',
]

// Define public routes that don't require authentication
const publicRoutes = [
  '/',
  '/auth/register',
  '/api/auth/login',
  '/api/auth/register',
]

// Define auth routes that should redirect authenticated users
const authRoutes = [
  '/auth/login',
]

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Check if this is a request for static assets or Next.js internals
  if (
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/favicon.ico') ||
    pathname.startsWith('/public/') ||
    pathname.includes('.')
  ) {
    return NextResponse.next()
  }
  
  // Get the authenticated user - this validates the token
  const user = getAuthUser(request)
  
  // Check route types
  const isPublicRoute = publicRoutes.some(route => pathname === route || pathname.startsWith(route))
  const isAuthRoute = authRoutes.some(route => pathname === route || pathname.startsWith(route))
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route))
  const isProtectedApiRoute = protectedApiRoutes.some(route => pathname.startsWith(route))



  // Handle protected API routes
  if (isProtectedApiRoute) {
    if (!user) {
      if (process.env.NODE_ENV === 'development') {
        console.log(`[MIDDLEWARE] Blocking API access - No valid token for ${pathname}`)
      }
      return NextResponse.json(
        { 
          success: false, 
          message: 'Authentication required',
          error: 'Please login to access this resource',
          code: 'UNAUTHORIZED'
        },
        { status: 401 }
      )
    }
    
    // API route is protected and user is authenticated, continue
    const loginUrl = new URL('/auth/login', request.url)
      loginUrl.searchParams.set('redirect', pathname)
      return NextResponse.redirect(loginUrl)
  }
  
  // Handle auth routes - redirect authenticated users to appropriate dashboard
  if (isAuthRoute) {
    if (user) {
      const redirectUrl = user.role === 'admin' ? '/admin/companies' : '/dashboard'
      if (process.env.NODE_ENV === 'development') {
        console.log(`[MIDDLEWARE] Redirecting authenticated user from ${pathname} to ${redirectUrl}`)
      }
      return NextResponse.redirect(new URL(redirectUrl, request.url))
    }
    // User not authenticated, allow access to auth pages
    return NextResponse.next()
  }
  
  // Handle home page - redirect authenticated users to appropriate dashboard
  if (pathname === '/' && user) {
    const redirectUrl = user.role === 'admin' ? '/admin/companies' : '/dashboard'
    if (process.env.NODE_ENV === 'development') {
      console.log(`[MIDDLEWARE] Redirecting authenticated user from home to ${redirectUrl}`)
    }
    return NextResponse.redirect(new URL(redirectUrl, request.url))
  }
  
  // Handle public routes
  if (isPublicRoute) {
    return NextResponse.next()
  }
  
  // Handle protected routes
  if (isProtectedRoute) {
    // If user is not authenticated or token is invalid, redirect to login
    if (!user) {
      if (process.env.NODE_ENV === 'development') {
        console.log(`[MIDDLEWARE] Blocking access - No valid token for ${pathname}`)
      }
      const loginUrl = new URL('/auth/login', request.url)
      loginUrl.searchParams.set('redirect', pathname)
      return NextResponse.redirect(loginUrl)
    }

    // Role-based access control
    if (pathname.startsWith('/admin')) {
      if (user.role !== 'admin') {
        if (process.env.NODE_ENV === 'development') {
          console.log(`[MIDDLEWARE] Blocking admin access - User role: ${user.role} for ${pathname}`)
        }
        // Non-admin users trying to access admin routes
        const redirectUrl = user.role === 'company' ? '/dashboard/companies' : '/auth/login'
        return NextResponse.redirect(new URL(redirectUrl, request.url))
      }
    }

    if (pathname.startsWith('/dashboard')) {
      if (user.role !== 'company') {
        if (process.env.NODE_ENV === 'development') {
          console.log(`[MIDDLEWARE] Blocking dashboard access - User role: ${user.role} for ${pathname}`)
        }
        // Non-company users trying to access dashboard
        return NextResponse.redirect(new URL('/auth/login', request.url))
      }
    }
    
    // User is authenticated and has correct role, continue
    return NextResponse.next()
  }

  // For any other routes not explicitly handled, require authentication
  if (!user) {
    if (process.env.NODE_ENV === 'development') {
      console.log(`[MIDDLEWARE] Blocking unhandled route - No valid token for ${pathname}`)
    }
    const loginUrl = new URL('/auth/login', request.url)
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
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