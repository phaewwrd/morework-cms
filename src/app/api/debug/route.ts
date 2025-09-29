import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/jwt";

export async function GET(request: NextRequest) {
  // Debug route disabled in production
  if (
    process.env.NODE_ENV === "production" &&
    process.env.ENABLE_DEBUG_ROUTES !== "true"
  ) {
    return NextResponse.json(
      { error: "Debug routes are disabled in production" },
      { status: 404 }
    );
  }

  try {
    // Check authentication
    const authToken = request.cookies.get("auth-token")?.value;

    if (!authToken) {
      return NextResponse.json({
        debug: "auth",
        message: "No auth token found in cookies",
        cookies: Array.from(request.cookies),
        authHeader: request.headers.get("authorization"),
      });
    }

    // Verify the token and get user information
    let user;
    try {
      user = verifyToken(authToken);
    } catch (error) {
      return NextResponse.json({
        debug: "auth",
        message: "Token verification failed",
        error: error instanceof Error ? error.message : "Unknown error",
        cookies: Array.from(request.cookies),
      });
    }

    // Check if user exists in database
    const dbUser = await prisma.user.findUnique({
      where: { id: (await user).userId },
      include: {
        companies: true,
      },
    });

    // Check companies
    const allCompanies = await prisma.company.findMany({
      include: {
        user: true,
      },
    });

    return NextResponse.json({
      debug: "success",
      jwtUser: user,
      dbUser: dbUser,
      allCompanies: allCompanies,
      userCompanies: dbUser?.companies || null,
    });
  } catch (error) {
    return NextResponse.json({
      debug: "error",
      error: error instanceof Error ? error.message : "Unknown error",
      stack:
        process.env.NODE_ENV === "development"
          ? error instanceof Error
            ? error.stack
            : undefined
          : undefined,
    });
  }
}
