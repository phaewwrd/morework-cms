import { upsertApplicantData } from "@/hooks/use-applicants";
import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { provider, session_id } = body;

    let applicantId: number | null = null;
    if (provider && session_id) {
      const socialMedia = await prisma.socialMedia.findFirst({
        where: {
          provider: provider,
          sessionId: session_id,
        },
      });

      if (socialMedia) {
        applicantId = socialMedia.applicantId;
      }
    }

    await upsertApplicantData(prisma, applicantId, body);

    return NextResponse.json({ success: true, data: null });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
