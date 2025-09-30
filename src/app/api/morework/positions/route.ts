import { createErrorResponse, ERROR_MESSAGES } from "@/lib/api-errors";
import { getAuthUserAsync } from "@/lib/jwt";
import { prisma } from "@/lib/prisma";
import { ApiResponse } from "@/lib/validations";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest
): Promise<NextResponse<ApiResponse>> {
  try {
    // Get authenticated user
    const user = await getAuthUserAsync(request);
    if (!user) {
      return createErrorResponse(
        ERROR_MESSAGES.UNAUTHORIZED,
        401,
        "UNAUTHORIZED"
      );
    }

    const positions = await prisma.position.findMany();

    return NextResponse.json({
      success: true,
      message: "Positions retrieved successfully",
      data: positions,
    });
  } catch (error) {
    console.error("Get positions error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to get positions",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
