import { NextRequest, NextResponse } from 'next/server'
import { userRegisterSchema } from '@/lib/validations'
import { hashPassword } from '@/lib/auth'
import { generateToken, setAuthCookie } from '@/lib/jwt'
import { prisma } from '@/lib/prisma'
import { 
  handleApiError, 
  createErrorResponse, 
  createSuccessResponse, 
  ERROR_MESSAGES,
  type ApiResponse 
} from '@/lib/api-errors'

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
      return createErrorResponse(ERROR_MESSAGES.DUPLICATE_EMAIL, 409, 'DUPLICATE_EMAIL')
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
      } as any // Type assertion to work around Prisma type issues
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
    
    return createSuccessResponse(userData, 'User registered successfully', 201)
    
  } catch (error) {
    return handleApiError(error, 'Auth Register')
  }
}
