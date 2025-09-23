import { NextRequest, NextResponse } from 'next/server'
import { getAuthUserAsync } from '@/lib/jwt'
import { type ApiResponse } from '@/lib/validations'

export async function GET(request: NextRequest): Promise<NextResponse<ApiResponse>> {
  try {
    // Get authenticated user
    const user = await getAuthUserAsync(request)
    
    if (!user) {
      return NextResponse.json({
        success: false,
        message: 'Unauthorized',
        error: 'No valid authentication token found'
      }, { status: 401 })
    }
    
    return NextResponse.json({
      success: true,
      message: 'User retrieved successfully',
      data: user
    })
    
  } catch (error) {
    console.error('Get user error:', error)
    
    return NextResponse.json({
      success: false,
      message: 'Failed to get user',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
