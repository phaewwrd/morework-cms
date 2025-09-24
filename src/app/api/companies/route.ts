import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUserAsync } from '@/lib/jwt'

export async function GET(request: NextRequest) {
  try {
    // Get the authenticated user
    const user = await getAuthUserAsync(request)

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Authentication required' },
        { status: 401 }
      )
    }

    // Check if user is an admin
    if (user.role !== 'admin') {
      return NextResponse.json(
        { success: false, message: 'Unauthorized - Admin access required' },
        { status: 403 }
      )
    }

    // Get all companies with their positions and applications
    const companies = await prisma.company.findMany({
      select: {
        id: true,
        title: true,
        address: true,
        city: true,
        country: true,
        email: true,
        contactName: true,
        contactPhone: true,
        userId: true,
        user: {
          select: {
            id: true,
            email: true,
            createdAt: true
          }
        },
        positions: {
          select: {
            id: true,
            title: true,
            status: true,
            applicantPositions: {
              select: {
                id: true,
                status: true,
                appliedAt: true,
                applicant: {
                  select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    email: true
                  }
                }
              }
            }
          }
        }
      },
      orderBy: {
        id: 'desc'
      }
    })

    return NextResponse.json({
      success: true,
      data: companies
    })

  } catch (error) {
    console.error('Error fetching companies:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}
