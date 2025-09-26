import { generateToken, setAuthCookie } from "@/lib/jwt";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get("token");

  if (!token) {
    return new Response("Missing token", { status: 400 });
  }

  // หา token record
  const record = await prisma.verificationToken.findUnique({
    where: { token },
  });

  if (!record || record.expires < new Date()) {
    return new Response("Invalid or expired token", { status: 400 });
  }

  // อัปเดต user เป็น verified
  const user = await prisma.user.update({
    where: { id: record.userId },
    data: { emailVerified: true },
    include: {
      companies: true,
    },
  });

  // ลบ token ออก
  await prisma.verificationToken.delete({
    where: { id: record.id },
  });

  // Generate JWT token with company ID
  const webToken = generateToken({
    userId: user.id.toString(),
    email: user.email,
    role: user.role,
    companyId: user.companies[0].id,
  });
  await setAuthCookie(webToken);

  redirect("/dashboard/companies");
}
