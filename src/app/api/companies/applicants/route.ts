import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken as validateToken } from "@/lib/jwt";

export async function GET(request: NextRequest) {
  try {
    // Get the authentication token from cookies
    const authToken = request.cookies.get("auth-token")?.value;

    if (!authToken) {
      console.log("ERROR: No auth token found");
      return NextResponse.json(
        { success: false, message: "Authentication required" },
        { status: 401 }
      );
    }

    // Verify the token and get user information
    let user;
    try {
      user = await validateToken(authToken);
      console.log("User authenticated:", {
        userId: user.userId,
        role: user.role,
        companyId: user.companyId,
      });
    } catch (error) {
      console.log("Token validation error:", error);
      return NextResponse.json(
        { success: false, message: "Invalid or expired token" },
        { status: 401 }
      );
    }

    if (!user) {
      return NextResponse.json(
        { success: false, message: "Authentication required" },
        { status: 401 }
      );
    }

    // Check if user is a company
    if (user.role !== "company") {
      console.log("ERROR: User role is not company:", user.role);
      return NextResponse.json(
        { success: false, message: "Unauthorized - Company access required" },
        { status: 403 }
      );
    }

    // Find the company associated with this user
    let companyId: number | undefined = user.companyId as number | undefined;

    if (!companyId) {
      console.log("CompanyId not in token, looking up by userId...");
      const company = await prisma.company.findFirst({
        where: {
          userId: user.userId,
        },
        select: {
          id: true,
        },
      });

      if (!company) {
        console.log("ERROR: No company found for user:", user.userId);
        return NextResponse.json(
          { success: false, message: "Company not found for this user" },
          { status: 400 }
        );
      }

      companyId = company.id;
      console.log("Found company ID:", companyId);
    }

    // Get all positions for this company
    console.log("Getting positions for company:", companyId);
    const positions = await prisma.position.findMany({
      where: {
        companyId: companyId,
      },
      select: {
        id: true,
      },
    });

    const positionIds = positions.map((p) => p.id);
    console.log(
      "Found positions:",
      positionIds.length,
      "positions:",
      positionIds
    );

    if (positionIds.length === 0) {
      console.log("No positions found, returning empty array");
      return NextResponse.json({
        success: true,
        data: [],
      });
    }

    // Get all applicants who have applied to this company's positions
    const applicants = await prisma.applicant.findMany({
      where: {
        positions: {
          some: {
            positionId: {
              in: positionIds,
            },
          },
        },
      },
      include: {
        positions: {
          where: {
            positionId: {
              in: positionIds,
            },
          },
          include: {
            position: {
              select: {
                id: true,
                title: true,
                jobDescription: true,
              },
            },
          },
          orderBy: {
            appliedAt: "desc",
          },
        },
      },
      orderBy: {
        id: "desc",
      },
    });

    // Transform the data to match frontend expectations
    console.log("Found applicants:", applicants.length);
    const transformedApplicants = applicants.map((applicant) => ({
      id: applicant.id,
      firstName: applicant.firstName,
      lastName: applicant.lastName,
      email: applicant.email,
      phone: applicant.phone,
      experience: 0, // Will need to calculate from work experience if available
      expectedSalary: null, // This field doesn't exist in the current schema
      applications: applicant.positions.map((pos) => ({
        id: pos.id,
        status: pos.status,
        appliedAt: pos.appliedAt.toISOString(),
        position: {
          id: pos.position.id,
          title: pos.position.title,
        },
      })),
    }));

    console.log(
      "Returning transformed applicants:",
      transformedApplicants.length
    );
    console.log("=== COMPANY APPLICANTS ROUTE END ===");

    return NextResponse.json({
      success: true,
      data: transformedApplicants,
    });
  } catch (error) {
    console.error("ERROR in company applicants route:", error);
    console.error(
      "Error stack:",
      error instanceof Error ? error.stack : "No stack trace"
    );

    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
