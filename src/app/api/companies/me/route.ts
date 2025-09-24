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

    // Check if user is a company user
    if (user.role !== 'company') {
      return NextResponse.json(
        { success: false, message: 'Unauthorized - Company access required' },
        { status: 403 }
      )
    }

    // Get the user's company
    const company = await prisma.company.findFirst({
      where: {
        userId: user.userId
      },
      select: {
        id: true,
        title: true,
        address: true,
        city: true,
        country: true,
        email: true,
        contactName: true,
        contactPhone: true
      }
    })

    if (!company) {
      return NextResponse.json(
        { success: false, message: 'Company not found for this user' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: company
    })

  } catch (error) {
    console.error('Error fetching user company:', error)
    
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}
