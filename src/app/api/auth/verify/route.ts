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

  // สร้าง JWT สำหรับ login session
  const sessionToken = await generateToken({
    userId: user.id.toString(),
    email: user.email,
    role: user.role,
  });

  const res = NextResponse.redirect("/dashboard/companies");
  await setAuthCookie(sessionToken);

  return res;
}
