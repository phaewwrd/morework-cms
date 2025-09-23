import { NextRequest, NextResponse } from 'next/server'
import { applicantCreateSchema, applicantUpdateSchema, type ApiResponse } from '@/lib/validations'
import { getAuthUserAsync } from '@/lib/jwt'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest): Promise<NextResponse<ApiResponse>> {
  try {
    // Get authenticated user
    const user = await getAuthUserAsync(request)
    if (!user) {
      return NextResponse.json({
        success: false,
        message: 'Authentication required',
        error: 'Please login to access applicants'
      }, { status: 401 })
    }

    const applicants = await prisma.applicant.findMany({
      orderBy: { id: 'desc' },
    })
    
    return NextResponse.json({
      success: true,
      message: 'Applicants retrieved successfully',
      data: applicants
    })
    
  } catch (error) {
    console.error('Get applicants error:', error)
    
    return NextResponse.json({
      success: false,
      message: 'Failed to get applicants',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest): Promise<NextResponse<ApiResponse>> {
  try {
    // Get authenticated user
    const user = await getAuthUserAsync(request)
    if (!user) {
      return NextResponse.json({
        success: false,
        message: 'Authentication required',
        error: 'Please login to create applicant'
      }, { status: 401 })
    }

    const body = await request.json()
    
    // Validate request data
    const validatedData = applicantCreateSchema.parse(body)
    
    // Create applicant
    const applicant = await prisma.applicant.create({
      data: validatedData,
    })
    
    return NextResponse.json({
      success: true,
      message: 'Applicant created successfully',
      data: applicant
    }, { status: 201 })
    
  } catch (error) {
    console.error('Create applicant error:', error)
    
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json({
        success: false,
        message: 'Validation failed',
        error: error.message
      }, { status: 400 })
    }
    
    return NextResponse.json({
      success: false,
      message: 'Applicant creation failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
