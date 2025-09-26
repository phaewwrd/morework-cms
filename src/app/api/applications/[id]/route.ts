import { NextRequest, NextResponse } from "next/server";
import { type ApiResponse } from "@/lib/validations";
import { getAuthUserAsync } from "@/lib/jwt";
import { prisma } from "@/lib/prisma";

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

export async function PATCH(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse<ApiResponse>> {
  try {
    // Get authenticated user
    const user = await getAuthUserAsync(request);
    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "Authentication required",
          error: "Please login to update application",
        },
        { status: 401 }
      );
    }

    const { id } = await params;
    const applicationId = parseInt(id);

    if (isNaN(applicationId)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid application ID",
          error: "Application ID must be a number",
        },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { status } = body;

    if (!status || !["PENDING", "ACCEPTED", "REJECTED"].includes(status)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid status",
          error: "Status must be PENDING, ACCEPTED, or REJECTED",
        },
        { status: 400 }
      );
    }

    // Update application status
    const updatedApplication = await prisma.applicantPosition.update({
      where: { id: applicationId },
      data: { status },
      include: {
        applicant: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        position: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: "Application status updated successfully",
      data: updatedApplication,
    });
  } catch (error) {
    console.error("Update application error:", error);

    if (
      error instanceof Error &&
      error.message.includes("Record to update not found")
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Application not found",
          error: "No application found with the given ID",
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: "Application update failed",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
