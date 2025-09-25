import { NextRequest, NextResponse } from 'next/server'
import { getAuthUserAsync } from '@/lib/jwt'
import { prisma } from '@/lib/prisma'
import { 
  handleApiError, 
  createErrorResponse, 
  createSuccessResponse, 
  ERROR_MESSAGES,
  type ApiResponse 
} from '@/lib/api-errors'

// Get all job types
export async function GET(request: NextRequest): Promise<NextResponse<ApiResponse>> {
  try {
    const user = await getAuthUserAsync(request)
    if (!user) {
      return createErrorResponse(ERROR_MESSAGES.UNAUTHORIZED, 401, 'UNAUTHORIZED')
    }

    const jobTypes = await prisma.jobType.findMany({
      orderBy: {
        title: 'asc'
      }
    })

    return createSuccessResponse(jobTypes)
  } catch (error) {
    return handleApiError(error, 'Job Types GET')
  }
}

// Create a new job type (admin only)
export async function POST(request: NextRequest): Promise<NextResponse<ApiResponse>> {
  try {
    const user = await getAuthUserAsync(request)
    if (!user) {
      return createErrorResponse(ERROR_MESSAGES.UNAUTHORIZED, 401, 'UNAUTHORIZED')
    }

    if (user.role !== 'admin') {
      return createErrorResponse(ERROR_MESSAGES.FORBIDDEN, 403, 'FORBIDDEN')
    }

    const body = await request.json()
    const { title } = body

    if (!title || typeof title !== 'string' || title.trim().length === 0) {
      return createErrorResponse('Job type title is required', 400, 'MISSING_TITLE')
    }

    const jobType = await prisma.jobType.create({
      data: {
        title: title.trim()
      }
    })

    return createSuccessResponse(jobType, 'Job type created successfully', 201)
  } catch (error) {
    return handleApiError(error, 'Job Types POST')
  }
}
