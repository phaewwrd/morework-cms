import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { 
  handleApiError, 
  createSuccessResponse,
  type ApiResponse 
} from '@/lib/api-errors'

export async function POST(): Promise<NextResponse<ApiResponse>> {
  try {
    // Remove the auth cookie
    const cookieStore = await cookies()
    cookieStore.delete('auth-token')
    
    return createSuccessResponse({}, 'Logged out successfully')
    
  } catch (error) {
    return handleApiError(error, 'Auth Logout')
  }
}
