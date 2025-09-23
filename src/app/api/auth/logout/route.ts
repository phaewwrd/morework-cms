import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { type ApiResponse } from '@/lib/validations'

export async function POST(): Promise<NextResponse<ApiResponse>> {
  try {
    // Remove the auth cookie
    const cookieStore = await cookies()
    cookieStore.delete('auth-token')
    
    return NextResponse.json({
      success: true,
      message: 'Logged out successfully',
    })
    
  } catch (error) {
    console.error('Logout error:', error)
    
    return NextResponse.json({
      success: false,
      message: 'Logout failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
