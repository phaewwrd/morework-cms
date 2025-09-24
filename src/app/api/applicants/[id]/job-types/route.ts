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

interface RouteParams {
  params: Promise<{
    id: string
  }>
}

// Get applicant's job types
export async function GET(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse<ApiResponse>> {
  try {
    const user = await getAuthUserAsync(request)
    if (!user) {
      return createErrorResponse(ERROR_MESSAGES.UNAUTHORIZED, 401, 'UNAUTHORIZED')
    }

    const { id } = await params
    const applicantId = parseInt(id)

    if (isNaN(applicantId)) {
      return createErrorResponse('Invalid applicant ID', 400, 'INVALID_ID')
    }

    const jobTypes = await prisma.applicantsJobType.findMany({
      where: {
        applicantId: applicantId
      },
      include: {
        jobType: true
      }
    })

    return createSuccessResponse(jobTypes)
  } catch (error) {
    return handleApiError(error, 'Applicant Job Types GET')
  }
}

// Add job type to applicant
export async function POST(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse<ApiResponse>> {
  try {
    const user = await getAuthUserAsync(request)
    if (!user) {
      return createErrorResponse(ERROR_MESSAGES.UNAUTHORIZED, 401, 'UNAUTHORIZED')
    }

    const { id } = await params
    const applicantId = parseInt(id)

    if (isNaN(applicantId)) {
      return createErrorResponse('Invalid applicant ID', 400, 'INVALID_ID')
    }

    const body = await request.json()
    const { jobTypeId } = body

    if (!jobTypeId || isNaN(parseInt(jobTypeId))) {
      return createErrorResponse('Valid job type ID is required', 400, 'INVALID_JOB_TYPE_ID')
    }

    // Check if the association already exists
    const existingAssociation = await prisma.applicantsJobType.findFirst({
      where: {
        applicantId: applicantId,
        jobTypeId: parseInt(jobTypeId)
      }
    })

    if (existingAssociation) {
      return createErrorResponse('Job type already associated with this applicant', 409, 'DUPLICATE_ASSOCIATION')
    }

    const newAssociation = await prisma.applicantsJobType.create({
      data: {
        applicantId: applicantId,
        jobTypeId: parseInt(jobTypeId)
      },
      include: {
        jobType: true
      }
    })

    return createSuccessResponse(newAssociation, 'Job type added successfully', 201)
  } catch (error) {
    return handleApiError(error, 'Applicant Job Types POST')
  }
}

// Remove job type from applicant
export async function DELETE(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse<ApiResponse>> {
  try {
    const user = await getAuthUserAsync(request)
    if (!user) {
      return createErrorResponse(ERROR_MESSAGES.UNAUTHORIZED, 401, 'UNAUTHORIZED')
    }

    const { id } = await params
    const applicantId = parseInt(id)

    if (isNaN(applicantId)) {
      return createErrorResponse('Invalid applicant ID', 400, 'INVALID_ID')
    }

    const url = new URL(request.url)
    const jobTypeId = url.searchParams.get('jobTypeId')

    if (!jobTypeId || isNaN(parseInt(jobTypeId))) {
      return createErrorResponse('Valid job type ID is required', 400, 'INVALID_JOB_TYPE_ID')
    }

    await prisma.applicantsJobType.deleteMany({
      where: {
        applicantId: applicantId,
        jobTypeId: parseInt(jobTypeId)
      }
    })

    return createSuccessResponse({}, 'Job type removed successfully')
  } catch (error) {
    return handleApiError(error, 'Applicant Job Types DELETE')
  }
}
