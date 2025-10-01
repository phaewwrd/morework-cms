// app/api/auth/verify/route.ts
import { prisma } from "@/lib/prisma";
import { generateToken, setAuthCookie, verifyToken } from "@/lib/jwt";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get("token");
  if (!token) return new Response("Missing token", { status: 400 });

  let payload;
  try {
    payload = await verifyToken(token);
  } catch {
    return new Response("Invalid or expired token", { status: 400 });
  }

  const user = await prisma.user.update({
    where: { id: payload.userId },
    data: { emailVerified: true },
  });

  const sessionToken = await generateToken({
    userId: user.id.toString(),
    email: user.email,
    role: user.role,
    emailVerified: true,
  });

  const redirectUrl = new URL("/auth/login", req.url);
  const res = NextResponse.redirect(redirectUrl);

  res.cookies.set("auth_token", sessionToken, {
    httpOnly: true,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24,
  });

  return res;
}
