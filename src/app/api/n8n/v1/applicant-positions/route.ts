
import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { provider, session_id, position_id } = body;

    if (!session_id || !position_id) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields' },
        { status: 400 }
      );
    }

    const socialMedia = await prisma.socialMedia.findFirst({
      where: {
        provider : provider || 'facebook',
        sessionId: session_id,
      },
    });

    if (!socialMedia) {
      return NextResponse.json(
        { success: false, message: 'Applicant not found' },
        { status: 404 }
      );
    }

    const position = await prisma.position.findFirst({
      where: {
        id: position_id,
      },
    });

    if (!position) {
      return NextResponse.json(
        { success: false, message: 'Position not found' },
        { status: 404 }
      );
    }

    const applicantPosition = await prisma.applicantPosition.upsert({
      where: {
        applicantId_positionId: {
          applicantId: socialMedia.applicantId,
          positionId: position_id,
        },
      },
      update: {},
      create: {
        applicantId: socialMedia.applicantId,
        positionId: position_id,
      },
    });

    return NextResponse.json({ success: true, data: null });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
