import { EmailTemplate } from "@/components/EmailTemplate";
import { sendVerificationEmail } from "@/lib/email";
import { generateToken, getAuthUser, getAuthUserAsync } from "@/lib/jwt";
import { prisma } from "@/lib/prisma";
import { randomUUID } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

// const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
  console.log("🔥 API ROUTE HIT - /api/auth/send");

  try {
    const user = await getAuthUserAsync(request);
    console.log("🔥 Auth user:", user);

    if (!user?.userId || !user?.email) {
      return NextResponse.json(
        {
          success: false,
          error: "Unauthorized",
        },
        { status: 401 }
      );
    }

    const verifyToken = await generateToken({
      userId: user.userId,
      email: user.email,
      role: user.role,
      emailVerified: user.emailVerified,
    });

    const insertedToken = await prisma.verificationToken.create({
      data: {
        token: verifyToken,
        user: {
          connect: { id: user.userId },
        },
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 ชั่วโมง
      },
    });

    if (!insertedToken) {
      return NextResponse.json(
        {
          success: false,
          error: "Failed to create verification token",
        },
        { status: 500 }
      );
    }

    console.log("🔥 Verification token created:", insertedToken);

    try {
      await sendVerificationEmail(user.email, verifyToken);
    } catch (emailError) {
      console.error("Email sending failed:", emailError);
      return NextResponse.json(
        {
          success: false,
          error:
            "Failed to send verification email. Please check email configuration.",
          details:
            emailError instanceof Error
              ? emailError.message
              : "Unknown email error",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Email sent successfully",
    });
  } catch (error) {
    console.error("Route error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
