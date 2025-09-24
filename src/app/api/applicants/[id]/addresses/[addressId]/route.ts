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
    addressId: string
  }>
}

export async function PUT(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse<ApiResponse>> {
  try {
    const user = await getAuthUserAsync(request)
    if (!user) {
      return createErrorResponse(ERROR_MESSAGES.UNAUTHORIZED, 401, 'UNAUTHORIZED')
    }

    const { id, addressId } = await params
    const applicantId = parseInt(id)
    const addressIdNum = parseInt(addressId)

    if (isNaN(applicantId) || isNaN(addressIdNum)) {
      return createErrorResponse('Invalid ID format', 400, 'INVALID_ID')
    }

    const body = await request.json()
    const { address, districtId } = body

    if (!address || !districtId) {
      return createErrorResponse('Address and district ID are required', 400, 'MISSING_FIELDS')
    }

    const updatedAddress = await prisma.applicantAddress.update({
      where: {
        id: addressIdNum,
        applicantId: applicantId
      },
      data: {
        address,
        districtId: parseInt(districtId)
      },
      include: {
        district: {
          include: {
            province: true
          }
        }
      }
    })

    return createSuccessResponse(updatedAddress, 'Address updated successfully')

  } catch (error) {
    return handleApiError(error, 'Applicant Address PUT')
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse<ApiResponse>> {
  try {
    const user = await getAuthUserAsync(request)
    if (!user) {
      return createErrorResponse(ERROR_MESSAGES.UNAUTHORIZED, 401, 'UNAUTHORIZED')
    }

    const { id, addressId } = await params
    const applicantId = parseInt(id)
    const addressIdNum = parseInt(addressId)

    if (isNaN(applicantId) || isNaN(addressIdNum)) {
      return createErrorResponse('Invalid ID format', 400, 'INVALID_ID')
    }

    await prisma.applicantAddress.delete({
      where: {
        id: addressIdNum,
        applicantId: applicantId
      }
    })

    return createSuccessResponse({}, 'Address deleted successfully')

  } catch (error) {
    return handleApiError(error, 'Applicant Address DELETE')
  }
}
