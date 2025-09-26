import { NextRequest, NextResponse } from "next/server";
import { positionCreateSchema, positionUpdateSchema } from "@/lib/validations";
import { getAuthUserAsync } from "@/lib/jwt";
import { prisma } from "@/lib/prisma";
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
    // Get authenticated user
    const user = await getAuthUserAsync(request);
    if (!user) {
      return createErrorResponse(
        ERROR_MESSAGES.UNAUTHORIZED,
        401,
        "UNAUTHORIZED"
      );
    }

    // Find the user's company
    const userCompany = await prisma.company.findFirst({
      where: {
        userId: user.userId,
      },
      select: {
        id: true,
      },
    });

    if (!userCompany) {
      return createErrorResponse(
        ERROR_MESSAGES.NOT_FOUND,
        404,
        "COMPANY_NOT_FOUND"
      );
    }

    // Get positions only for the user's company
    const positions = await prisma.position.findMany({
      where: {
        companyId: userCompany.id,
      },
      orderBy: { id: "desc" },
      include: {
        company: {
          select: {
            id: true,
            title: true,
            city: true,
            country: true,
          },
        },
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
              },
            },
          },
        },
      },
    });

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

export async function POST(
  request: NextRequest
): Promise<NextResponse<ApiResponse>> {
  try {
    // Get authenticated user
    const user = await getAuthUserAsync(request);
    if (!user || user.role !== "company") {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized",
          error: "Only companies can create positions",
        },
        { status: 403 }
      );
    }

    const body = await request.json();

    // Validate request data
    const validatedData = positionCreateSchema.parse(body);

    // Find user's company
    const company = await prisma.company.findUnique({
      where: { userId: user.userId },
    });

    if (!company) {
      return NextResponse.json(
        {
          success: false,
          message: "Company not found",
          error: "User must have a company to create positions",
        },
        { status: 400 }
      );
    }

    // Create position
    const position = await prisma.position.create({
      data: {
        ...validatedData,
        companyId: company.id,
        status: "PENDING",
      },
      include: {
        company: {
          select: {
            id: true,
            title: true,
            city: true,
            country: true,
          },
        },
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Position created successfully",
        data: position,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create position error:", error);

    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json(
        {
          success: false,
          message: "Validation failed",
          error: error.message,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: "Position creation failed",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
