import { NextRequest, NextResponse } from 'next/server'
import { applicantUpdateSchema, type ApiResponse } from '@/lib/validations'
import { getAuthUserAsync } from '@/lib/jwt'
import { prisma } from '@/lib/prisma'

interface RouteParams {
  params: Promise<{
    id: string
  }>
}

export async function GET(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse<ApiResponse>> {
  try {
    // Get authenticated user
    const user = await getAuthUserAsync(request)
    if (!user) {
      return NextResponse.json({
        success: false,
        message: 'Authentication required',
        error: 'Please login to access applicant'
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

    // Check if user is a company and get company-specific data
    if (user.role === 'COMPANY' && user.companyId) {
      // Get all positions for this company
      const positions = await prisma.position.findMany({
        where: {
          companyId: user.companyId
        },
        select: {
          id: true
        }
      })

      const positionIds = positions.map(p => p.id)

      // Get the specific applicant with their applications to this company
      const applicant = await prisma.applicant.findFirst({
        where: {
          id: applicantId,
          positions: {
            some: {
              positionId: {
                in: positionIds
              }
            }
          }
        },
        include: {
          positions: {
            where: {
              positionId: {
                in: positionIds
              }
            },
            include: {
              position: {
                select: {
                  id: true,
                  title: true,
                  jobDescription: true
                }
              }
            },
            orderBy: {
              appliedAt: 'desc'
            }
          },
          workExperiences: {
            orderBy: {
              startDate: 'desc'
            }
          },
          educations: {
            include: {
              educationLevel: true
            },
            orderBy: {
              graduationYear: 'desc'
            }
          },
          documents: {
            where: {
              documentType: {
                in: ['RESUME', 'COVER_LETTER']
              }
            }
          }
        }
      })

      if (!applicant) {
        return NextResponse.json({
          success: false,
          message: 'Applicant not found',
          error: 'No applicant found or not authorized'
        }, { status: 404 })
      }

      // Transform the data to match frontend expectations
      const transformedApplicant = {
        id: applicant.id,
        firstName: applicant.firstName,
        lastName: applicant.lastName,
        email: applicant.email,
        phone: applicant.phone,
        experience: applicant.workExperiences.length > 0 
          ? applicant.workExperiences.reduce((total, exp) => {
              const startYear = new Date(exp.startDate).getFullYear()
              const endYear = exp.endDate ? new Date(exp.endDate).getFullYear() : new Date().getFullYear()
              return total + (endYear - startYear)
            }, 0)
          : 0,
        expectedSalary: null, // This field doesn't exist in the current schema
        skills: applicant.workExperiences.map(exp => exp.description).join('; '),
        education: applicant.educations.map(edu => 
          `${edu.field} at ${edu.institution} (${edu.graduationYear})`
        ).join('; '),
        applications: applicant.positions.map(pos => ({
          id: pos.id,
          status: pos.status,
          appliedAt: pos.appliedAt.toISOString(),
          coverLetter: applicant.documents.find(doc => doc.documentType === 'COVER_LETTER')?.description || null,
          resumeUrl: applicant.documents.find(doc => doc.documentType === 'RESUME')?.filePath || null,
          position: {
            id: pos.position.id,
            title: pos.position.title,
            description: pos.position.jobDescription
          }
        }))
      }

      return NextResponse.json({
        success: true,
        message: 'Applicant retrieved successfully',
        data: transformedApplicant
      })
    }

    // Default behavior for non-company users
    const applicant = await prisma.applicant.findUnique({
      where: { id: applicantId },
    })

    if (!applicant) {
      return NextResponse.json({
        success: false,
        message: 'Applicant not found',
        error: 'No applicant found with the given ID'
      }, { status: 404 })
    }
    
    return NextResponse.json({
      success: true,
      message: 'Applicant retrieved successfully',
      data: applicant
    })
    
  } catch (error) {
    console.error('Get applicant error:', error)
    
    return NextResponse.json({
      success: false,
      message: 'Failed to get applicant',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse<ApiResponse>> {
  try {
    // Get authenticated user
    const user = await getAuthUserAsync(request)
    if (!user) {
      return NextResponse.json({
        success: false,
        message: 'Authentication required',
        error: 'Please login to update applicant'
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
    
    // Validate request data
    const validatedData = applicantUpdateSchema.parse(body)
    
    // Update applicant
    const updatedApplicant = await prisma.applicant.update({
      where: { id: applicantId },
      data: validatedData,
    })
    
    return NextResponse.json({
      success: true,
      message: 'Applicant updated successfully',
      data: updatedApplicant
    })
    
  } catch (error) {
    console.error('Update applicant error:', error)
    
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json({
        success: false,
        message: 'Validation failed',
        error: error.message
      }, { status: 400 })
    }
    
    if (error instanceof Error && error.message.includes('Record to update not found')) {
      return NextResponse.json({
        success: false,
        message: 'Applicant not found',
        error: 'No applicant found with the given ID'
      }, { status: 404 })
    }
    
    return NextResponse.json({
      success: false,
      message: 'Applicant update failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse<ApiResponse>> {
  try {
    // Get authenticated user
    const user = await getAuthUserAsync(request)
    if (!user) {
      return NextResponse.json({
        success: false,
        message: 'Authentication required',
        error: 'Please login to delete applicant'
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
    
    // Delete applicant
    await prisma.applicant.delete({
      where: { id: applicantId }
    })
    
    return NextResponse.json({
      success: true,
      message: 'Applicant deleted successfully'
    })
    
  } catch (error) {
    console.error('Delete applicant error:', error)
    
    if (error instanceof Error && error.message.includes('Record to delete does not exist')) {
      return NextResponse.json({
        success: false,
        message: 'Applicant not found',
        error: 'No applicant found with the given ID'
      }, { status: 404 })
    }
    
    return NextResponse.json({
      success: false,
      message: 'Applicant deletion failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
