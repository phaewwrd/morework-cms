import { NextRequest, NextResponse } from 'next/server'
import { userRegisterSchema, type ApiResponse } from '@/lib/validations'
import { hashPassword } from '@/lib/auth'
import { generateToken, setAuthCookie } from '@/lib/jwt'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest): Promise<NextResponse<ApiResponse>> {
  try {
    const body = await request.json()
    
    // Validate request data
    const validatedData = userRegisterSchema.parse(body)
    
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email }
    })
    
    if (existingUser) {
      return NextResponse.json({
        success: false,
        message: 'User already exists',
        error: 'A user with this email already exists'
      }, { status: 409 })
    }
    
        // Hash password
    const hashedPassword = await hashPassword(validatedData.password)
    
    // Create user - let Prisma handle auto-increment ID
    const user = await prisma.user.create({
      data: {
        email: validatedData.email,
        emailVerified: false,
        role: validatedData.role || 'company',
        password: hashedPassword,
        image: null,
      }
    })
    
    // Generate JWT token
    const token = generateToken({
      userId: user.id.toString(), // Convert to string for JWT
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
      message: 'User registered successfully',
      data: userData
    }, { status: 201 })
    
  } catch (error) {
    console.error('Registration error:', error)
    
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json({
        success: false,
        message: 'Validation failed',
        error: error.message
      }, { status: 400 })
    }
    
    return NextResponse.json({
      success: false,
      message: 'Registration failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
