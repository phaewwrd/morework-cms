import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getAuthUser } from "@/lib/jwt";

const publicRoutes = [
  "/api/auth/login",
  "/api/auth/register",
  "/auth/login",
  "/auth/register",
];

const authRoutes = ["/auth/login", "/auth/register"];
const protectedRoutes = ["/admin", "/dashboard"];
const protectedApiRoutes = [
  "/api/applicants",
  "/api/companies",
  "/api/positions",
  "/api/applications",
  "/api/users",
];

// ⭐ เปลี่ยนเป็น async function
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  console.log("🚀 Middleware running:", pathname);

  // ⭐ เพิ่ม await
  const user = await getAuthUser(request);
  console.log("👤 User:", user ? `${user.email} (${user.role})` : "null");

  // 1. Check public routes
  const isPublicRoute = publicRoutes.some(
    (route) => pathname === route || pathname.startsWith(route)
  );

  if (isPublicRoute) {
    const isAuthRoute = authRoutes.some((route) => pathname === route);
    if (isAuthRoute && user) {
      const redirectUrl =
        user.role === "admin" ? "/admin/moreworks" : "/dashboard/companies";
      console.log("↩️  Redirect to:", redirectUrl);
      return NextResponse.redirect(new URL(redirectUrl, request.url));
    }

    return NextResponse.next();
  }

  // 2. Check protected API routes
  const isProtectedApiRoute = protectedApiRoutes.some((route) =>
    pathname.startsWith(route)
  );

  if (isProtectedApiRoute) {
    if (!user) {
      console.log("🚫 API 401: No auth");
      return NextResponse.json(
        {
          success: false,
          message: "Authentication required",
          code: "UNAUTHORIZED",
        },
        { status: 401 }
      );
    }
    return NextResponse.next();
  }

  // 3. Check protected routes
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );

  if (isProtectedRoute) {
    if (!user) {
      const loginUrl = new URL("/auth/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      console.log("🔒 Redirect to login");
      return NextResponse.redirect(loginUrl);
    }

    // Role-based access control
    if (pathname.startsWith("/admin") && user.role !== "admin") {
      console.log("🚫 Non-admin accessing /admin");
      const redirectUrl =
        user.role === "company" ? "/dashboard/companies" : "/auth/login";
      return NextResponse.redirect(new URL(redirectUrl, request.url));
    }

    if (pathname.startsWith("/dashboard") && user.role !== "company") {
      console.log("🚫 Non-company accessing /dashboard");
      return NextResponse.redirect(new URL("/auth/login", request.url));
    }

    return NextResponse.next();
  }

  if (user?.verified === false) {
    const verifyUrl = new URL("/auth/verify", request.url);
    verifyUrl.searchParams.set("redirect", pathname);
    console.log("🔒 Redirect to verify");
    return NextResponse.redirect(verifyUrl);
  }

  // 4. Other routes
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.png$|.*\\.jpg$|.*\\.jpeg$|.*\\.svg$).*)",
  ],
};
