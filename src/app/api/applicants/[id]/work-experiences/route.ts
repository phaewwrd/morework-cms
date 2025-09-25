import { NextRequest, NextResponse } from 'next/server'
import { getAuthUserAsync } from '@/lib/jwt'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

interface RouteParams {
  params: Promise<{
    id: string
  }>
}

const workExperienceUpdateSchema = z.object({
  workExperiences: z.array(z.object({
    id: z.number().optional(),
    position: z.string().min(1, 'Position is required'),
    company: z.string().min(1, 'Company is required'),
    startDate: z.string().refine((date) => !isNaN(Date.parse(date)), 'Invalid start date'),
    endDate: z.string().refine((date) => !isNaN(Date.parse(date)), 'Invalid end date').optional().nullable(),
    currentPosition: z.boolean().default(false),
    description: z.string().optional(),
  }))
})

// Update applicant work experiences
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
        error: 'Please login to update work experiences'
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
    const validatedData = workExperienceUpdateSchema.parse(body)

    // Delete existing work experiences
    await prisma.applicantWorkExperience.deleteMany({
      where: { applicantId }
    })

    // Create new work experiences
    await prisma.applicantWorkExperience.createMany({
      data: validatedData.workExperiences.map(exp => ({
        applicantId,
        position: exp.position,
        company: exp.company,
        startDate: new Date(exp.startDate),
        endDate: exp.endDate ? new Date(exp.endDate) : null,
        currentPosition: exp.currentPosition,
        description: exp.description || ''
      }))
    })

    // Fetch the updated work experiences
    const updatedWorkExperiences = await prisma.applicantWorkExperience.findMany({
      where: { applicantId },
      orderBy: { startDate: 'desc' }
    })

    return NextResponse.json({
      success: true,
      message: 'Work experiences updated successfully',
      data: updatedWorkExperiences
    })

  } catch (error) {
    console.error('Update work experiences error:', error)

    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json({
        success: false,
        message: 'Validation failed',
        error: error.message
      }, { status: 400 })
    }

    return NextResponse.json({
      success: false,
      message: 'Failed to update work experiences',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
