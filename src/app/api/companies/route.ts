import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUserAsync } from "@/lib/jwt";
import {
  handleApiError,
  createErrorResponse,
  createSuccessResponse,
  ERROR_MESSAGES,
  type ApiResponse,
} from "@/lib/api-errors";

export async function GET(
  request: NextRequest
): Promise<NextResponse<ApiResponse>> {
  try {
    // Get the authenticated user
    const user = await getAuthUserAsync(request);

    if (!user) {
      return createErrorResponse(
        ERROR_MESSAGES.UNAUTHORIZED,
        401,
        "UNAUTHORIZED"
      );
    }

    // Check if user is an admin
    if (user.role !== "admin") {
      return createErrorResponse(ERROR_MESSAGES.FORBIDDEN, 403, "FORBIDDEN");
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
            createdAt: true,
          },
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
                    email: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: {
        id: "desc",
      },
    });

    return createSuccessResponse(companies);
  } catch (error) {
    return handleApiError(error, "Companies GET");
  }
}
