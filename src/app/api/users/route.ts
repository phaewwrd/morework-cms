import { NextRequest, NextResponse } from 'next/server'
import { userUpdateSchema, type ApiResponse } from '@/lib/validations'
import { prisma } from '@/lib/prisma'

export async function GET(): Promise<NextResponse<ApiResponse>> {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        role: true,
        emailVerified: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            companies: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })
    
    return NextResponse.json({
      success: true,
      message: 'Users retrieved successfully',
      data: users
    })
    
  } catch (error) {
    console.error('Get users error:', error)
    
    return NextResponse.json({
      success: false,
      message: 'Failed to retrieve users',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest): Promise<NextResponse<ApiResponse>> {
  try {
    // This would typically be used for admin user creation
    // For now, redirect to register endpoint
    return NextResponse.json({
      success: false,
      message: 'Use /api/auth/register for user registration',
      error: 'Invalid endpoint'
    }, { status: 405 })
    
  } catch (error) {
    return NextResponse.json({
      success: false,
      message: 'Operation failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// Get user by ID
export async function PUT(request: NextRequest): Promise<NextResponse<ApiResponse>> {
  try {
    const url = new URL(request.url)
    const userId = url.searchParams.get('id')
    
    if (!userId) {
      return NextResponse.json({
        success: false,
        message: 'User ID is required',
        error: 'Missing user ID parameter'
      }, { status: 400 })
    }
    
    const body = await request.json()
    const validatedData = userUpdateSchema.parse(body)
    
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: validatedData,
      select: {
        id: true,
        email: true,
        role: true,
        emailVerified: true,
        createdAt: true,
        updatedAt: true,
      }
    })
    
    return NextResponse.json({
      success: true,
      message: 'User updated successfully',
      data: updatedUser
    })
    
  } catch (error) {
    console.error('Update user error:', error)
    
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json({
        success: false,
        message: 'Validation failed',
        error: error.message
      }, { status: 400 })
    }
    
    return NextResponse.json({
      success: false,
      message: 'Failed to update user',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
