import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthUserAsync } from '@/lib/jwt'

export async function GET(request: NextRequest) {
  try {
    console.log('=== DEBUG INFO ===')
    
    // Check authentication
    const user = await getAuthUserAsync(request)
    console.log('User from JWT:', user)
    
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
    
    console.log('User from DB:', dbUser)
    
    // Check companies
    const allCompanies = await prisma.company.findMany({
      include: {
        user: true
      }
    })
    
    console.log('All companies:', allCompanies)
    
    return NextResponse.json({
      debug: 'success',
      jwtUser: user,
      dbUser: dbUser,
      allCompanies: allCompanies,
      userCompanies: dbUser?.companies || null
    })

  } catch (error) {
    console.error('Debug error:', error)
    
    return NextResponse.json({
      debug: 'error',
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    })
  }
}
