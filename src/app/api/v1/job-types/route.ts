import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  try {
    const jobTypes = await prisma.jobType.findMany();
    const resData = {
      "success" : true,
      "data" : {
          "job_types": jobTypes.map(jobType => ({
          id: jobType.id,
          title: jobType.title
        })),
      }
    };
    return NextResponse.json(resData);
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch job types",
      },
      { status: 500 }
    );
  }
}
