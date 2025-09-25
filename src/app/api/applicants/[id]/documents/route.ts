import { NextRequest, NextResponse } from 'next/server'
import { getAuthUserAsync } from '@/lib/jwt'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

interface RouteParams {
  params: Promise<{
    id: string
  }>
}

const DocumentTypeEnum = z.enum(['RESUME', 'COVER_LETTER', 'TRANSCRIPT', 'PORTFOLIO', 'CERTIFICATE', 'OTHER'])

const documentUpdateSchema = z.object({
  documents: z.array(z.object({
    id: z.number().optional(),
    description: z.string().min(1, 'Description is required'),
    documentType: DocumentTypeEnum,
    filePath: z.string().min(1, 'File path is required'),
  }))
})

// Update applicant documents
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
        error: 'Please login to update documents'
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
    const validatedData = documentUpdateSchema.parse(body)

    // Delete existing documents
    await prisma.applicantDocument.deleteMany({
      where: { applicantId }
    })

    // Create new documents
    await prisma.applicantDocument.createMany({
      data: validatedData.documents.map(doc => ({
        applicantId,
        description: doc.description,
        documentType: doc.documentType,
        filePath: doc.filePath
      }))
    })

    // Fetch the updated documents
    const updatedDocuments = await prisma.applicantDocument.findMany({
      where: { applicantId }
    })

    return NextResponse.json({
      success: true,
      message: 'Documents updated successfully',
      data: updatedDocuments
    })

  } catch (error) {
    console.error('Update documents error:', error)

    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json({
        success: false,
        message: 'Validation failed',
        error: error.message
      }, { status: 400 })
    }

    return NextResponse.json({
      success: false,
      message: 'Failed to update documents',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
