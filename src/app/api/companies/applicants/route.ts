import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    // Get the authorization header
    const authHeader = request.headers.get('authorization')
    const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : request.cookies.get('token')?.value

    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Access token required' },
        { status: 401 }
      )
    }

    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { 
      id: number
      email: string
      role: string
      companyId?: number
    }

    // Check if user is a company
    if (decoded.role !== 'COMPANY') {
      return NextResponse.json(
        { success: false, message: 'Unauthorized - Company access required' },
        { status: 403 }
      )
    }

    if (!decoded.companyId) {
      return NextResponse.json(
        { success: false, message: 'Company ID not found' },
        { status: 400 }
      )
    }

    // Get all positions for this company
    const positions = await prisma.position.findMany({
      where: {
        companyId: decoded.companyId
      },
      select: {
        id: true
      }
    })

    const positionIds = positions.map(p => p.id)

    if (positionIds.length === 0) {
      return NextResponse.json({
        success: true,
        data: []
      })
    }

    // Get all applicants who have applied to this company's positions
    const applicants = await prisma.applicant.findMany({
      where: {
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
        }
      },
      orderBy: {
        id: 'desc'
      }
    })

    // Transform the data to match frontend expectations
    const transformedApplicants = applicants.map(applicant => ({
      id: applicant.id,
      firstName: applicant.firstName,
      lastName: applicant.lastName,
      email: applicant.email,
      phone: applicant.phone,
      experience: 0, // Will need to calculate from work experience if available
      expectedSalary: null, // This field doesn't exist in the current schema
      applications: applicant.positions.map(pos => ({
        id: pos.id,
        status: pos.status,
        appliedAt: pos.appliedAt.toISOString(),
        position: {
          id: pos.position.id,
          title: pos.position.title
        }
      }))
    }))

    return NextResponse.json({
      success: true,
      data: transformedApplicants
    })

  } catch (error) {
    console.error('Error fetching company applicants:', error)
    
    if (error instanceof jwt.JsonWebTokenError) {
      return NextResponse.json(
        { success: false, message: 'Invalid token' },
        { status: 401 }
      )
    }

    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}
