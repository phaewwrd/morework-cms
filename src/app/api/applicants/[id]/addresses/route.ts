import { NextRequest, NextResponse } from 'next/server'
import { getAuthUserAsync } from '@/lib/jwt'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

interface RouteParams {
  params: Promise<{
    id: string
  }>
}

const addressUpdateSchema = z.object({
  addresses: z.array(z.object({
    id: z.number().optional(),
    address: z.string().min(1, 'Address is required'),
    districtId: z.number().int().positive('Invalid district ID'),
  }))
})

// Update applicant addresses
export async function PUT(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse> {
  try {
    const user = await getAuthUserAsync(request)
    if (!user) {
      return NextResponse.json({
        success: false,
        message: 'Authentication required',
        error: 'Please login to update addresses'
      }, { status: 401 })
    }

    const { id } = await params
    const applicantId = parseInt(id)

    if (isNaN(applicantId)) {
      return NextResponse.json({
        success: false,
        message: 'Invalid applicant ID',
        error: 'Applicant ID must be a number'
      }, { status: 400 })
    }

    const body = await request.json()
    const validatedData = addressUpdateSchema.parse(body)

    // Delete existing addresses
    await prisma.applicantAddress.deleteMany({
      where: { applicantId }
    })

    // Create new addresses
    const createdAddresses = await prisma.applicantAddress.createMany({
      data: validatedData.addresses.map(addr => ({
        applicantId,
        address: addr.address,
        districtId: addr.districtId
      }))
    })

    // Fetch the updated addresses with related data
    const updatedAddresses = await prisma.applicantAddress.findMany({
      where: { applicantId },
      include: {
        district: {
          include: {
            province: true
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Addresses updated successfully',
      data: updatedAddresses
    })

  } catch (error) {
    console.error('Update addresses error:', error)

    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json({
        success: false,
        message: 'Validation failed',
        error: error.message
      }, { status: 400 })
    }

    return NextResponse.json({
      success: false,
      message: 'Failed to update addresses',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
