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
    const { address, districtId } = body

    if (!address || !districtId) {
      return createErrorResponse('Address and district ID are required', 400, 'MISSING_FIELDS')
    }

    const newAddress = await prisma.applicantAddress.create({
      data: {
        address,
        districtId: parseInt(districtId),
        applicantId
      },
      include: {
        district: {
          include: {
            province: true
          }
        }
      }
    })

    return createSuccessResponse(newAddress, 'Address created successfully', 201)

  } catch (error) {
    return handleApiError(error, 'Applicant Address POST')
  }
}
