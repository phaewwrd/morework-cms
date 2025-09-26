import { NextRequest, NextResponse } from "next/server";
import { applicantUpdateSchema, type ApiResponse } from "@/lib/validations";
import { getAuthUserAsync } from "@/lib/jwt";
import { prisma } from "@/lib/prisma";
import { upsertApplicantData } from "@/hooks/use-applicants";

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

export async function GET(
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
          error: "Please login to access applicant",
        },
        { status: 401 }
      );
    }

    const { id } = await params;
    const applicantId = parseInt(id);

    if (isNaN(applicantId)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid applicant ID",
          error: "Applicant ID must be a number",
        },
        { status: 400 }
      );
    }

    // Check if user is a company and get company-specific data
    if (user.role === "COMPANY" && user.companyId) {
      // Get all positions for this company
      const positions = await prisma.position.findMany({
        where: {
          companyId: user.companyId,
        },
        select: {
          id: true,
        },
      });

      const positionIds = positions.map((p) => p.id);

      // Get the specific applicant with their applications to this company
      const applicant = await prisma.applicant.findFirst({
        where: {
          id: applicantId,
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
          workExperiences: {
            orderBy: {
              startDate: "desc",
            },
          },
          educations: {
            include: {
              educationLevel: true,
            },
            orderBy: {
              graduationYear: "desc",
            },
          },
          documents: {
            where: {
              documentType: {
                in: ["RESUME", "COVER_LETTER"],
              },
            },
          },
        },
      });

      if (!applicant) {
        return NextResponse.json(
          {
            success: false,
            message: "Applicant not found",
            error: "No applicant found or not authorized",
          },
          { status: 404 }
        );
      }

      // Transform the data to match frontend expectations
      //   const transformedApplicant = {
      //     id: applicant.id,
      //     firstName: applicant.firstName,
      //     lastName: applicant.lastName,
      //     email: applicant.email,
      //     phone: applicant.phone,
      //     experience: applicant.workExperiences.length > 0
      //       ? applicant.workExperiences.reduce((total, exp) => {
      //           const startYear = new Date(exp.startDate).getFullYear()
      //           const endYear = exp.endDate ? new Date(exp.endDate).getFullYear() : new Date().getFullYear()
      //           return total + (endYear - startYear)
      //         }, 0)
      //       : 0,
      //     expectedSalary: null, // This field doesn't exist in the current schema
      //     skills: applicant.workExperiences.map(exp => exp.description).join('; '),
      //     education: applicant.educations.map(edu =>
      //       `${edu.field} at ${edu.institution} (${edu.graduationYear})`
      //     ).join('; '),
      //     applications: applicant.positions.map(pos => ({
      //       id: pos.id,
      //       status: pos.status,
      //       appliedAt: pos.appliedAt.toISOString(),
      //       coverLetter: applicant.documents.find(doc => doc.documentType === 'COVER_LETTER')?.description || null,
      //       resumeUrl: applicant.documents.find(doc => doc.documentType === 'RESUME')?.filePath || null,
      //       position: {
      //         id: pos.position.id,
      //         title: pos.position.title,
      //         description: pos.position.jobDescription
      //       }
      //     }))
      //   }

      return NextResponse.json({
        success: true,
        message: "Applicant retrieved successfully",
        data: applicant,
      });
    }

    // Default behavior for admin users - get full applicant data with all relationships
    // Use raw query to handle invalid datetime values
    const applicantResult = (await prisma.$queryRaw`
      SELECT 
        a.*,
        CASE 
          WHEN a.birth_date = '0000-00-00' OR a.birth_date IS NULL THEN '1970-01-01'
          ELSE a.birth_date 
        END as birth_date,
        CASE 
          WHEN a.start_working_date = '0000-00-00' OR a.start_working_date IS NULL THEN '1970-01-01'
          ELSE a.start_working_date 
        END as start_working_date
      FROM applicants a 
      WHERE a.id = ${applicantId}
      LIMIT 1
    `) as any[];

    if (!applicantResult || applicantResult.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Applicant not found",
          error: "No applicant found with the given ID",
        },
        { status: 404 }
      );
    }

    const applicantData = applicantResult[0];

    // Get related data separately to avoid datetime issues
    const [
      addresses,
      educations,
      workExperiencesResult,
      trainings,
      documents,
      positions,
      socialMedia,
      jobTypes,
    ] = await Promise.all([
      // Addresses
      prisma.applicantAddress.findMany({
        where: { applicantId },
        include: {
          district: {
            include: {
              province: true,
            },
          },
        },
      }),
      // Educations
      prisma.applicantEducation.findMany({
        where: { applicantId },
        include: {
          educationLevel: true,
        },
      }),
      // Work Experiences - handle datetime issues
      prisma.$queryRaw`
        SELECT 
          we.*,
          CASE 
            WHEN we.start_date = '0000-00-00' OR we.start_date IS NULL THEN '1970-01-01'
            ELSE we.start_date 
          END as start_date,
          CASE 
            WHEN we.end_date = '0000-00-00' THEN NULL
            ELSE we.end_date 
          END as end_date
        FROM applicant_work_experiences we 
        WHERE we.applicant_id = ${applicantId}
      `,
      // Trainings
      prisma.applicantTraining.findMany({
        where: { applicantId },
      }),
      // Documents
      prisma.applicantDocument.findMany({
        where: { applicantId },
      }),
      // Positions
      prisma.applicantPosition.findMany({
        where: { applicantId },
        include: {
          position: {
            include: {
              company: true,
            },
          },
        },
      }),
      // Social Media
      prisma.socialMedia.findMany({
        where: { applicantId },
      }),
      // Job Types
      prisma.applicantsJobType.findMany({
        where: {
          applicantId: applicantId,
        },
        include: {
          jobType: true,
        },
      }),
    ]);

    // Convert work experiences result to proper array
    const workExperiences = workExperiencesResult as any[];

    // Combine all data
    const applicantWithJobTypes = {
      ...applicantData,
      addresses,
      educations,
      workExperiences,
      trainings,
      documents,
      positions,
      socialMedia,
      jobTypes,
    };

    if (!applicantWithJobTypes) {
      return NextResponse.json(
        {
          success: false,
          message: "Applicant not found",
          error: "No applicant found with the given ID",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Applicant retrieved successfully",
      data: applicantWithJobTypes,
    });
  } catch (error) {
    console.error("Get applicant error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to get applicant",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = await params;

    const applicantId = parseInt(id, 10);
    if (isNaN(applicantId)) {
      return new Response(
        JSON.stringify({ success: false, error: "Invalid applicant ID" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const body = await req.json();
    console.log(body);

    await upsertApplicantData(prisma, applicantId, body);

    return new Response(JSON.stringify({ success: true, data: null }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error(error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

export async function DELETE(
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
          error: "Please login to delete applicant",
        },
        { status: 401 }
      );
    }

    const { id } = await params;
    const applicantId = parseInt(id);

    if (isNaN(applicantId)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid applicant ID",
          error: "Applicant ID must be a number",
        },
        { status: 400 }
      );
    }

    // Delete applicant
    await prisma.applicant.delete({
      where: { id: applicantId },
    });

    return NextResponse.json({
      success: true,
      message: "Applicant deleted successfully",
    });
  } catch (error) {
    console.error("Delete applicant error:", error);

    if (
      error instanceof Error &&
      error.message.includes("Record to delete does not exist")
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Applicant not found",
          error: "No applicant found with the given ID",
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: "Applicant deletion failed",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
