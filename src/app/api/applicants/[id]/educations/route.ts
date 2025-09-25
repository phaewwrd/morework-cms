import { NextRequest, NextResponse } from 'next/server'
import { getAuthUserAsync } from '@/lib/jwt'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

interface RouteParams {
  params: Promise<{
    id: string
  }>
}

const educationUpdateSchema = z.object({
  educations: z.array(z.object({
    id: z.number().optional(),
    field: z.string().min(1, 'Field is required'),
    institution: z.string().min(1, 'Institution is required'),
    educationlevelId: z.number().int().positive('Invalid education level ID'),
    graduationYear: z.number().int().min(1900).max(2100),
    gpa: z.number().min(0).max(4).optional(),
  }))
})

// Update applicant educations
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
        error: 'Please login to update educations'
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
    const validatedData = educationUpdateSchema.parse(body)

    // Delete existing educations
    await prisma.applicantEducation.deleteMany({
      where: { applicantId }
    })

    // Create new educations
    await prisma.applicantEducation.createMany({
      data: validatedData.educations.map(edu => ({
        applicantId,
        field: edu.field,
        institution: edu.institution,
        educationlevelId: edu.educationlevelId,
        graduationYear: edu.graduationYear,
        gpa: edu.gpa || 0
      }))
    })

    // Fetch the updated educations with related data
    const updatedEducations = await prisma.applicantEducation.findMany({
      where: { applicantId },
      include: {
        educationLevel: true
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Educations updated successfully',
      data: updatedEducations
    })

  } catch (error) {
    console.error('Update educations error:', error)

    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json({
        success: false,
        message: 'Validation failed',
        error: error.message
      }, { status: 400 })
    }

    return NextResponse.json({
      success: false,
      message: 'Failed to update educations',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
