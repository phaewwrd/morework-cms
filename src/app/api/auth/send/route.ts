import { EmailTemplate } from "@/components/EmailTemplate";
import { getAuthUser } from "@/lib/jwt";
import { prisma } from "@/lib/prisma";
import { randomUUID } from "crypto";
import { NextRequest } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
  try {
    const user = getAuthUser(request);
    if (!user?.userId || !user?.email) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const verifyToken = randomUUID();

    await prisma.verificationToken.create({
      data: {
        token: verifyToken,
        userId: user.userId,
        expires: new Date(Date.now() + 1000 * 60 * 30), // 30 นาที
      },
    });

    const verifyUrl = `${process.env.DOMAIN_URL}/api/auth/verify?token=${verifyToken}`;

    const { data, error } = await resend.emails.send({
      from: "onboarding@resend.dev",
      to: [user?.email ?? ""],
      subject: "Verify your email",
      react: EmailTemplate({ verifyUrl }),
    });

    if (error) {
      console.log("route error1", error);
      return Response.json({ error }, { status: 500 });
    }

    return Response.json(data);
  } catch (error) {
    console.log("route error2", error);
    return Response.json({ error }, { status: 500 });
  }
}
