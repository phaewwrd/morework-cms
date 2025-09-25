import { NextResponse, type NextRequest } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const companyTitle = searchParams.get("company");
  const positionTitle = searchParams.get("position");

  try {
    const positions = await prisma.position.findMany({
      where: {
        company: {
          title: {
            contains: companyTitle || "",
          },
        },
        title: {
          contains: positionTitle || "",
        },
      },
      include: {
        company: true,
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        positions: positions.map((position) => ({
          id: position.id,
          title: position.title,
          company: {
            id: position.company.id,
            title: position.company.title,
          },
        })),
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: (error as Error).message,
      },
      { status: 500 }
    );
  }
}
