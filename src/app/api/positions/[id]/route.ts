import { NextRequest, NextResponse } from 'next/server'
import { positionUpdateSchema, type ApiResponse } from '@/lib/validations'
import { getAuthUserAsync } from '@/lib/jwt'
import { prisma } from '@/lib/prisma'

interface RouteParams {
  params: Promise<{
    id: string
  }>
}

export async function GET(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse<ApiResponse>> {
  try {
    // Get authenticated user
    const user = await getAuthUserAsync(request)
    if (!user) {
      return NextResponse.json({
        success: false,
        message: 'Authentication required',
        error: 'Please login to access position'
      }, { status: 401 })
    }

    const { id } = await params
    const positionId = parseInt(id)

    if (isNaN(positionId)) {
      return NextResponse.json({
        success: false,
        message: 'Invalid position ID',
        error: 'Position ID must be a number'
      }, { status: 400 })
    }

    const position = await prisma.position.findUnique({
      where: { id: positionId },
      include: {
        company: {
          select: {
            id: true,
            title: true,
            city: true,
            country: true,
          },
        },
        applicantPositions: {
          select: {
            id: true,
            status: true,
            appliedAt: true,
            applicant: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
    })

    if (!position) {
      return NextResponse.json({
        success: false,
        message: 'Position not found',
        error: 'No position found with the given ID'
      }, { status: 404 })
    }
    
    return NextResponse.json({
      success: true,
      message: 'Position retrieved successfully',
      data: position
    })
    
  } catch (error) {
    console.error('Get position error:', error)
    
    return NextResponse.json({
      success: false,
      message: 'Failed to get position',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse<ApiResponse>> {
  try {
    // Get authenticated user
    const user = await getAuthUserAsync(request)
    if (!user || user.role !== 'company') {
      return NextResponse.json({
        success: false,
        message: 'Unauthorized',
        error: 'Only companies can update positions'
      }, { status: 403 })
    }

    const { id } = await params
    const positionId = parseInt(id)

    if (isNaN(positionId)) {
      return NextResponse.json({
        success: false,
        message: 'Invalid position ID',
        error: 'Position ID must be a number'
      }, { status: 400 })
    }

    const body = await request.json()
    
    // Validate request data
    const validatedData = positionUpdateSchema.parse(body)
    
    // Check if position belongs to user's company
    const position = await prisma.position.findUnique({
      where: { id: positionId },
      include: {
        company: {
          select: {
            userId: true,
          },
        },
      },
    })

    if (!position) {
      return NextResponse.json({
        success: false,
        message: 'Position not found',
        error: 'No position found with the given ID'
      }, { status: 404 })
    }

    if (position.company.userId !== user.userId) {
      return NextResponse.json({
        success: false,
        message: 'Unauthorized',
        error: 'You can only update positions from your own company'
      }, { status: 403 })
    }
    
    // Update position
    const updatedPosition = await prisma.position.update({
      where: { id: positionId },
      data: validatedData,
      include: {
        company: {
          select: {
            id: true,
            title: true,
            city: true,
            country: true,
          },
        },
      },
    })
    
    return NextResponse.json({
      success: true,
      message: 'Position updated successfully',
      data: updatedPosition
    })
    
  } catch (error) {
    console.error('Update position error:', error)
    
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json({
        success: false,
        message: 'Validation failed',
        error: error.message
      }, { status: 400 })
    }
    
    if (error instanceof Error && error.message.includes('Record to update not found')) {
      return NextResponse.json({
        success: false,
        message: 'Position not found',
        error: 'No position found with the given ID'
      }, { status: 404 })
    }
    
    return NextResponse.json({
      success: false,
      message: 'Position update failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse<ApiResponse>> {
  try {
    // Get authenticated user
    const user = await getAuthUserAsync(request)
    if (!user || user.role !== 'company') {
      return NextResponse.json({
        success: false,
        message: 'Unauthorized',
        error: 'Only companies can delete positions'
      }, { status: 403 })
    }

    const { id } = await params
    const positionId = parseInt(id)

    if (isNaN(positionId)) {
      return NextResponse.json({
        success: false,
        message: 'Invalid position ID',
        error: 'Position ID must be a number'
      }, { status: 400 })
    }

    // Check if position belongs to user's company
    const position = await prisma.position.findUnique({
      where: { id: positionId },
      include: {
        company: {
          select: {
            userId: true,
          },
        },
      },
    })

    if (!position) {
      return NextResponse.json({
        success: false,
        message: 'Position not found',
        error: 'No position found with the given ID'
      }, { status: 404 })
    }

    if (position.company.userId !== user.userId) {
      return NextResponse.json({
        success: false,
        message: 'Unauthorized',
        error: 'You can only delete positions from your own company'
      }, { status: 403 })
    }
    
    // Delete position
    await prisma.position.delete({
      where: { id: positionId }
    })
    
    return NextResponse.json({
      success: true,
      message: 'Position deleted successfully'
    })
    
  } catch (error) {
    console.error('Delete position error:', error)
    
    if (error instanceof Error && error.message.includes('Record to delete does not exist')) {
      return NextResponse.json({
        success: false,
        message: 'Position not found',
        error: 'No position found with the given ID'
      }, { status: 404 })
    }
    
    return NextResponse.json({
      success: false,
      message: 'Position deletion failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
