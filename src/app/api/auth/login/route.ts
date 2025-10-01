import { NextRequest, NextResponse } from "next/server";
import { userLoginSchema } from "@/lib/validations";
import { generateToken, setAuthCookie } from "@/lib/jwt";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import {
  handleApiError,
  createErrorResponse,
  createSuccessResponse,
  ERROR_MESSAGES,
  type ApiResponse,
} from "@/lib/api-errors";

export async function POST(
  request: NextRequest
): Promise<NextResponse<ApiResponse>> {
  try {
    const body = await request.json();

    // Validate request data
    const validatedData = userLoginSchema.parse(body);

    // Find user by email - use include to get all fields including password
    const user = (await prisma.user.findUnique({
      where: { email: validatedData.email },
      include: {
        companies: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    })) as any; // Type assertion to work around Prisma type issues

    if (!user) {
      return createErrorResponse(
        ERROR_MESSAGES.INVALID_CREDENTIALS,
        401,
        "INVALID_CREDENTIALS"
      );
    }

    // Check if user has a password (for password-based authentication)
    if (!user.password) {
      return createErrorResponse(
        "This account uses social login. Please sign in with your social provider.",
        400,
        "OAUTH_ACCOUNT"
      );
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(
      validatedData.password,
      user.password
    );

    if (!isValidPassword) {
      return createErrorResponse(
        ERROR_MESSAGES.INVALID_CREDENTIALS,
        401,
        "INVALID_CREDENTIALS"
      );
    }

    // Get the user's company ID (if they are a company user)
    const companyId =
      user.companies.length > 0 ? user.companies[0].id : undefined;

    // Generate JWT token with company ID
    const token = await generateToken({
      userId: user.id.toString(), // Convert to string for JWT
      email: user.email,
      role: user.role,
      emailVerified: user.emailVerified,
      companyId: companyId,
    });

    const res = NextResponse.json({ success: true });

    // Set HttpOnly cookie
    await setAuthCookie(res, token);

    // Return user data (excluding sensitive info)
    const userData = {
      id: user.id,
      email: user.email,
      role: user.role,
      emailVerified: user.emailVerified,
      createdAt: user.createdAt,
    };

    return createSuccessResponse(userData, "Login successful");
  } catch (error) {
    return handleApiError(error, "Auth Login");
  }
}
