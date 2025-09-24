import { NextRequest, NextResponse } from 'next/server'
import { applicantCreateSchema, applicantUpdateSchema } from '@/lib/validations'
import { getAuthUserAsync } from '@/lib/jwt'
import { prisma } from '@/lib/prisma'
import { 
  handleApiError, 
  createErrorResponse, 
  createSuccessResponse, 
  ERROR_MESSAGES,
  type ApiResponse 
} from '@/lib/api-errors'

export async function GET(request: NextRequest): Promise<NextResponse<ApiResponse>> {
  try {
    // Get authenticated user
    const user = await getAuthUserAsync(request)
    if (!user) {
      return createErrorResponse(ERROR_MESSAGES.UNAUTHORIZED, 401, 'UNAUTHORIZED')
    }

    const applicants = await prisma.applicant.findMany({
      orderBy: { id: 'desc' },
      include: {
        positions: {
          include: {
            position: {
              select: {
                id: true,
                title: true,
                status: true,
                company: {
                  select: {
                    title: true
                  }
                }
              }
            }
          }
        }
      }
    })
    
    // Transform the data to include positions in the expected format
    const transformedApplicants = applicants.map(applicant => ({
      ...applicant,
      positions: applicant.positions.map(ap => ({
        id: ap.position.id,
        title: ap.position.title,
        status: ap.position.status,
        applicationStatus: ap.status,
        company: ap.position.company
      }))
    }))
    
    return createSuccessResponse(transformedApplicants, 'Applicants retrieved successfully')
    
  } catch (error) {
    return handleApiError(error, 'Applicants GET')
  }
}

export async function POST(request: NextRequest): Promise<NextResponse<ApiResponse>> {
  try {
    // Get authenticated user
    const user = await getAuthUserAsync(request)
    if (!user) {
      return createErrorResponse(ERROR_MESSAGES.UNAUTHORIZED, 401, 'UNAUTHORIZED')
    }

    const body = await request.json()
    
    // Validate request data
    const validatedData = applicantCreateSchema.parse(body)
    
    // Create applicant
    const applicant = await prisma.applicant.create({
      data: validatedData,
    })
    
    return createSuccessResponse(applicant, 'Applicant created successfully', 201)
    
  } catch (error) {
    return handleApiError(error, 'Applicants POST')
  }
}
