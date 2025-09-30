import { jwtVerify, SignJWT, type JWTPayload as JoseJWTPayload } from "jose";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

const COOKIE_NAME = "auth-token";

// ✅ เปลี่ยนชื่อ interface เพื่อไม่ให้ชนกับ jose
export interface CustomJWTPayload extends JoseJWTPayload {
  userId: string;
  email: string;
  role: string;
  emailVerified?: boolean;
}

export class AuthError extends Error {
  constructor(message: string, public statusCode: number = 401) {
    super(message);
    this.name = "AuthError";
  }
}

// Helper to get secret as Uint8Array
function getSecretKey(): Uint8Array {
  const secret =
    process.env.JWT_SECRET || "fallback-secret-key-change-in-production";

  if (
    secret === "fallback-secret-key-change-in-production" &&
    process.env.NODE_ENV === "production"
  ) {
    console.error("⚠️ CRITICAL: Using fallback JWT_SECRET in production!");
  }

  return new TextEncoder().encode(secret);
}

/**
 * Generate JWT token for user
 */
export async function generateToken(
  payload: Omit<CustomJWTPayload, "iat" | "exp">
): Promise<string> {
  const secret = getSecretKey();

  const token = await new SignJWT(payload as any)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secret);

  console.log("🎫 Token generated");
  return token;
}

/**
 * Verify JWT token
 */
export async function verifyToken(token: string): Promise<CustomJWTPayload> {
  try {
    const secret = getSecretKey();

    console.log("=== TOKEN DEBUG ===");
    console.log("Token:", token);
    console.log("Token length:", token.length);
    console.log("Token parts:", token.split(".").length);
    console.log("First 50 chars:", token.substring(0, 50));
    console.log("==================");

    const { payload } = await jwtVerify(token, secret);

    console.log("✅ Token verified:", payload);

    return payload as unknown as CustomJWTPayload;
  } catch (error) {
    console.error("❌ Token verification error:", error);
    throw new AuthError("Token verification failed", 401);
  }
}
/**
 * Set HttpOnly cookie with JWT token
 */
export async function setAuthCookie(res: NextResponse, token: string) {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60,
    path: "/",
  });

  console.log("🍪 Cookie set");
}

/**
 * Get JWT token from HttpOnly cookie
 */
export async function getAuthToken(): Promise<string> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(COOKIE_NAME);
    return token?.value || "";
  } catch {
    return "";
  }
}

/**
 * Remove auth cookie
 */
export async function clearAuthCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

/**
 * Get authenticated user from request (ASYNC for middleware)
 */
export async function getAuthUser(
  request?: NextRequest
): Promise<CustomJWTPayload | null> {
  try {
    let token: string | null = null;

    if (request) {
      token = request.cookies.get(COOKIE_NAME)?.value || null;
      console.log("🍪 Token from request:", token ? "EXISTS" : "NULL");
    } else {
      throw new Error("Use getAuthUserAsync for API routes");
    }

    if (!token) {
      return null;
    }

    const decoded = await verifyToken(token);

    // Validate required fields
    if (!decoded.userId || !decoded.email || !decoded.role) {
      if (process.env.NODE_ENV === "development") {
        console.warn("Token missing required fields:", {
          userId: !!decoded.userId,
          email: !!decoded.email,
          role: !!decoded.role,
          emailVerified: !!decoded.emailVerified,
        });
      }
      return null;
    }

    if (decoded.exp && decoded.exp < Math.floor(Date.now() / 1000)) {
      if (process.env.NODE_ENV === "development") {
        console.warn("Token expired:", {
          exp: decoded.exp,
          now: Math.floor(Date.now() / 1000),
        });
      }
      return null;
    }

    return decoded;
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.warn(
        "Token validation failed:",
        error instanceof Error ? error.message : error
      );
    }
    return null;
  }
}

/**
 * Get authenticated user (async version for API routes)
 */
export async function getAuthUserAsync(
  request?: NextRequest
): Promise<CustomJWTPayload | null> {
  try {
    let token: string | undefined;

    if (request) {
      token = request.cookies.get(COOKIE_NAME)?.value;
    } else {
      const cookieStore = await cookies();
      token = cookieStore.get(COOKIE_NAME)?.value;
    }

    if (!token) {
      return null;
    }

    const decoded = await verifyToken(token);

    if (!decoded.userId || !decoded.email || !decoded.role) {
      if (process.env.NODE_ENV === "development") {
        console.warn("Token missing required fields:", {
          userId: !!decoded.userId,
          email: !!decoded.email,
          role: !!decoded.role,
          emailVerified: !!decoded.emailVerified,
          companyId: !!decoded.companyId,
        });
      }
      return null;
    }

    if (decoded.exp && decoded.exp < Math.floor(Date.now() / 1000)) {
      if (process.env.NODE_ENV === "development") {
        console.warn("Token expired:", {
          exp: decoded.exp,
          now: Math.floor(Date.now() / 1000),
        });
      }
      return null;
    }

    return decoded;
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error(
        "Error getting authenticated user:",
        error instanceof Error ? error.message : error
      );
    }
    return null;
  }
}

/**
 * Require authentication
 */
export async function requireAuth(
  request?: NextRequest
): Promise<CustomJWTPayload> {
  const user = await getAuthUser(request);
  if (!user) {
    throw new AuthError("Authentication required", 401);
  }
  return user;
}

/**
 * Require authentication (async for API routes)
 */
export async function requireAuthAsync(): Promise<CustomJWTPayload> {
  const user = await getAuthUserAsync();
  if (!user) {
    throw new AuthError("Authentication required", 401);
  }
  return user;
}

/**
 * Check if user has required role
 */
export async function requireRole(
  role: string,
  request?: NextRequest
): Promise<CustomJWTPayload> {
  const user = await requireAuth(request);
  if (user.role !== role) {
    throw new AuthError("Insufficient permissions", 403);
  }
  return user;
}

/**
 * Check if user has required role (async for API routes)
 */
export async function requireRoleAsync(
  role: string
): Promise<CustomJWTPayload> {
  const user = await requireAuthAsync();
  if (user.role !== role) {
    throw new AuthError("Insufficient permissions", 403);
  }
  return user;
}

/**
 * Check if user has any of the required roles
 */
export async function requireAnyRole(
  roles: string[],
  request?: NextRequest
): Promise<CustomJWTPayload> {
  const user = await requireAuth(request);
  if (!roles.includes(user.role)) {
    throw new AuthError("Insufficient permissions", 403);
  }
  return user;
}

/**
 * Check if user has any of the required roles (async for API routes)
 */
export async function requireAnyRoleAsync(
  roles: string[]
): Promise<CustomJWTPayload> {
  const user = await requireAuthAsync();
  if (!roles.includes(user.role)) {
    throw new AuthError("Insufficient permissions", 403);
  }
  return user;
}
