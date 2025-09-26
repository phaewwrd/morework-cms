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
  
  // Get the authenticated user
  const user = getAuthUser(request)
  
  // Check route types
  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route))
  const isAuthRoute = authRoutes.some(route => pathname.startsWith(route))
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route))
  const isProtectedApiRoute = protectedApiRoutes.some(route => pathname.startsWith(route))

  // Handle protected API routes
  if (isProtectedApiRoute && !user) {
    return NextResponse.json(
      { 
        success: false, 
        message: 'Authentication required',
        code: 'UNAUTHORIZED'
      },
      { status: 401 }
    )
  }
  
  // Handle auth routes - redirect authenticated users to appropriate dashboard
  if (isAuthRoute && user) {
    const redirectUrl = user.role === 'admin' ? '/admin/companies' : '/dashboard'
    return NextResponse.redirect(new URL(redirectUrl, request.url))
  }
  
  // Handle other public routes - redirect authenticated users to appropriate dashboard
  if (isPublicRoute && user && (pathname === '/auth/login' || pathname === '/auth/register')) {
    const redirectUrl = user.role === 'admin' ? '/admin/companies' : '/dashboard/companies'
    return NextResponse.redirect(new URL(redirectUrl, request.url))
  }
  
  // Handle protected routes
  if (isProtectedRoute) {
    // If user is not authenticated, redirect to login
    if (!user) {
      const loginUrl = new URL('/auth/login', request.url)
      loginUrl.searchParams.set('redirect', pathname)
      return NextResponse.redirect(loginUrl)
    }

    // Role-based access control
    if (pathname.startsWith('/admin')) {
      if (user.role !== 'admin') {
        // Non-admin users trying to access admin routes
        const redirectUrl = user.role === 'company' ? '/dashboard/companies' : '/auth/login'
        return NextResponse.redirect(new URL(redirectUrl, request.url))
      }
    }

    if (pathname.startsWith('/dashboard')) {
      if (user.role !== 'company' ) {
        // Unauthorized users trying to access dashboard
        return NextResponse.redirect(new URL('/auth/login', request.url))
      }
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