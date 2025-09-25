import { NextRequest, NextResponse } from 'next/server'
import { getAuthUserAsync } from '@/lib/jwt'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

interface RouteParams {
  params: Promise<{
    id: string
  }>
}

const trainingUpdateSchema = z.object({
  trainings: z.array(z.object({
    id: z.number().optional(),
    title: z.string().min(1, 'Title is required'),
    trainingYear: z.number().int().min(1900).max(2100),
    description: z.string().optional(),
  }))
})

// Update applicant trainings
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
        error: 'Please login to update trainings'
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
    const validatedData = trainingUpdateSchema.parse(body)

    // Delete existing trainings
    await prisma.applicantTraining.deleteMany({
      where: { applicantId }
    })

    // Create new trainings
    await prisma.applicantTraining.createMany({
      data: validatedData.trainings.map(training => ({
        applicantId,
        title: training.title,
        trainingYear: training.trainingYear,
        description: training.description || ''
      }))
    })

    // Fetch the updated trainings
    const updatedTrainings = await prisma.applicantTraining.findMany({
      where: { applicantId },
      orderBy: { trainingYear: 'desc' }
    })

    return NextResponse.json({
      success: true,
      message: 'Trainings updated successfully',
      data: updatedTrainings
    })

  } catch (error) {
    console.error('Update trainings error:', error)

    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json({
        success: false,
        message: 'Validation failed',
        error: error.message
      }, { status: 400 })
    }

    return NextResponse.json({
      success: false,
      message: 'Failed to update trainings',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
