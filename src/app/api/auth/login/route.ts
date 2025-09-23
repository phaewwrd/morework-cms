import { NextRequest, NextResponse } from 'next/server'
import { userLoginSchema, type ApiResponse } from '@/lib/validations'
import { generateToken, setAuthCookie } from '@/lib/jwt'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function POST(request: NextRequest): Promise<NextResponse<ApiResponse>> {
  try {
    const body = await request.json()
    
    // Validate request data
    const validatedData = userLoginSchema.parse(body)
    
    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: validatedData.email },
      select: {
        id: true,
        email: true,
        role: true,
        emailVerified: true,
        password: true,
        createdAt: true,
      }
    })
    
    if (!user) {
      return NextResponse.json({
        success: false,
        message: 'Invalid credentials',
        error: 'No user found with this email'
      }, { status: 401 })
    }
    
    // Check if user has a password (for password-based authentication)
    if (!user.password) {
      return NextResponse.json({
        success: false,
        message: 'Please use OAuth to login',
        error: 'This account uses OAuth authentication'
      }, { status: 400 })
    }
    
    // Verify password
    const isValidPassword = await bcrypt.compare(validatedData.password, user.password)
    
    if (!isValidPassword) {
      return NextResponse.json({
        success: false,
        message: 'Invalid credentials',
        error: 'Password is incorrect'
      }, { status: 401 })
    }
    
    // Generate JWT token
    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    })
    
    // Set HttpOnly cookie
    await setAuthCookie(token)
    
    // Return user data (excluding sensitive info)
    const userData = {
      id: user.id,
      email: user.email,
      role: user.role,
      emailVerified: user.emailVerified,
      createdAt: user.createdAt,
    }
    
    return NextResponse.json({
      success: true,
      message: 'Login successful',
      data: userData
    })
    
  } catch (error) {
    console.error('Login error:', error)
    
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json({
        success: false,
        message: 'Validation failed',
        error: error.message
      }, { status: 400 })
    }
    
    return NextResponse.json({
      success: false,
      message: 'Login failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
