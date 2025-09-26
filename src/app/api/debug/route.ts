import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUserAsync } from '@/lib/jwt'

export async function GET(request: NextRequest) {
  // Debug route disabled in production
  if (process.env.NODE_ENV === 'production' && process.env.ENABLE_DEBUG_ROUTES !== 'true') {
    return NextResponse.json(
      { error: 'Debug routes are disabled in production' },
      { status: 404 }
    )
  }

  try {
    // Check authentication
    const user = await getAuthUserAsync(request)
    
    if (!user) {
      return NextResponse.json({
        debug: 'auth',
        message: 'No user found in JWT token',
        cookies: Array.from(request.cookies),
        authHeader: request.headers.get('authorization')
      })
    }

    // Check if user exists in database
    const dbUser = await prisma.user.findUnique({
      where: { id: user.userId },
      include: {
        companies: true
      }
    })
    
    // Check companies
    const allCompanies = await prisma.company.findMany({
      include: {
        user: true
      }
    })
    
    return NextResponse.json({
      debug: 'success',
      jwtUser: user,
      dbUser: dbUser,
      allCompanies: allCompanies,
      userCompanies: dbUser?.companies || null
    })

  } catch (error) {    
    return NextResponse.json({
      debug: 'error',
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: process.env.NODE_ENV === 'development' ? 
        (error instanceof Error ? error.stack : undefined) : undefined
    })
  }
}
