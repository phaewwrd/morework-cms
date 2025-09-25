import jwt from 'jsonwebtoken'
import { cookies } from 'next/headers'
import { NextRequest } from 'next/server'

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key-change-in-production'
const COOKIE_NAME = 'auth-token'

export interface JWTPayload {
  userId: string
  email: string
  role: string
  companyId?: number
  iat?: number
  exp?: number
}

export class AuthError extends Error {
  constructor(message: string, public statusCode: number = 401) {
    super(message)
    this.name = 'AuthError'
  }
}

/**
 * Generate JWT token for user
 */
export function generateToken(payload: Omit<JWTPayload, 'iat' | 'exp'>): string {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: '7d', // Token expires in 7 days
  })
}

/**
 * Verify JWT token
 */
export function verifyToken(token: string): JWTPayload {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload
    return decoded
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new AuthError('Token expired', 401)
    }
    if (error instanceof jwt.JsonWebTokenError) {
      throw new AuthError('Invalid token', 401)
    }
    throw new AuthError('Token verification failed', 401)
  }
}

/**
 * Set HttpOnly cookie with JWT token
 */
export async function setAuthCookie(token: string) {
  const cookieStore = await cookies()
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60, // 7 days
    path: '/',
  })
}

/**
 * Get JWT token from HttpOnly cookie
 */
export async function getAuthToken(): Promise<string | null> {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get(COOKIE_NAME)
    return token?.value || null
  } catch {
    return null
  }
}

/**
 * Remove auth cookie
 */
export async function clearAuthCookie() {
  const cookieStore = await cookies()
  cookieStore.delete(COOKIE_NAME)
}

/**
 * Get authenticated user from request (synchronous for middleware)
 */
export function getAuthUser(request?: NextRequest): JWTPayload | null {
  try {
    let token: string | null = null

    if (request) {
      // Get token from request cookies (for middleware)
      token = request.cookies.get(COOKIE_NAME)?.value || null
    } else {
      // For API routes, we need to use the async version
      throw new Error('Use getAuthUserAsync for API routes')
    }

    if (!token) {
      return null
    }

    // Verify token - this will throw an error if expired or invalid
    const decoded = verifyToken(token)
    
    // Additional validation - ensure required fields are present
    if (!decoded.userId || !decoded.email || !decoded.role) {
      if (process.env.NODE_ENV === 'development') {
        console.warn('Token missing required fields:', { userId: !!decoded.userId, email: !!decoded.email, role: !!decoded.role })
      }
      return null
    }

    // Check if token is expired (extra safety check)
    if (decoded.exp && decoded.exp < Math.floor(Date.now() / 1000)) {
      if (process.env.NODE_ENV === 'development') {
        console.warn('Token expired:', { exp: decoded.exp, now: Math.floor(Date.now() / 1000) })
      }
      return null
    }

    return decoded
  } catch (error) {
    // Log the error for debugging (remove in production)
    if (process.env.NODE_ENV === 'development') {
      console.warn('Token validation failed:', error instanceof Error ? error.message : error)
    }
    return null
  }
}

/**
 * Get authenticated user from request (async version for API routes)
 */
export async function getAuthUserAsync(request?: NextRequest): Promise<JWTPayload | null> {
  try {
    let token: string | undefined
    
    if (request) {
      // Try to get token from request cookies
      token = request.cookies.get(COOKIE_NAME)?.value
    } else {
      // Fallback to server-side cookies
      const cookieStore = await cookies()
      token = cookieStore.get(COOKIE_NAME)?.value
    }
    
    if (!token) {
      return null
    }
    
    // Verify token - this will throw an error if expired or invalid
    const decoded = verifyToken(token)
    
    // Additional validation - ensure required fields are present
    if (!decoded.userId || !decoded.email || !decoded.role) {
      if (process.env.NODE_ENV === 'development') {
        console.warn('Token missing required fields:', { userId: !!decoded.userId, email: !!decoded.email, role: !!decoded.role })
      }
      return null
    }

    // Check if token is expired (extra safety check)
    if (decoded.exp && decoded.exp < Math.floor(Date.now() / 1000)) {
      if (process.env.NODE_ENV === 'development') {
        console.warn('Token expired:', { exp: decoded.exp, now: Math.floor(Date.now() / 1000) })
      }
      return null
    }

    return decoded
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Error getting authenticated user:', error instanceof Error ? error.message : error)
    }
    return null
  }
}

/**
 * Require authentication - throws error if not authenticated
 */
export function requireAuth(request?: NextRequest): JWTPayload {
  const user = getAuthUser(request)
  if (!user) {
    throw new AuthError('Authentication required', 401)
  }
  return user
}

/**
 * Require authentication (async for API routes)
 */
export async function requireAuthAsync(): Promise<JWTPayload> {
  const user = await getAuthUserAsync()
  if (!user) {
    throw new AuthError('Authentication required', 401)
  }
  return user
}

/**
 * Check if user has required role
 */
export function requireRole(role: string, request?: NextRequest): JWTPayload {
  const user = requireAuth(request)
  if (user.role !== role) {
    throw new AuthError('Insufficient permissions', 403)
  }
  return user
}

/**
 * Check if user has required role (async for API routes)
 */
export async function requireRoleAsync(role: string): Promise<JWTPayload> {
  const user = await requireAuthAsync()
  if (user.role !== role) {
    throw new AuthError('Insufficient permissions', 403)
  }
  return user
}

/**
 * Check if user has any of the required roles
 */
export function requireAnyRole(roles: string[], request?: NextRequest): JWTPayload {
  const user = requireAuth(request)
  if (!roles.includes(user.role)) {
    throw new AuthError('Insufficient permissions', 403)
  }
  return user
}

/**
 * Check if user has any of the required roles (async for API routes)
 */
export async function requireAnyRoleAsync(roles: string[]): Promise<JWTPayload> {
  const user = await requireAuthAsync()
  if (!roles.includes(user.role)) {
    throw new AuthError('Insufficient permissions', 403)
  }
  return user
}
