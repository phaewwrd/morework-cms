import { EmailTemplate } from "@/components/EmailTemplate";
import { sendVerificationEmail } from "@/lib/email";
import { getAuthUser, getAuthUserAsync } from "@/lib/jwt";
import { prisma } from "@/lib/prisma";
import { randomUUID } from "crypto";
import { NextRequest } from "next/server";
import { Resend } from "resend";

// const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUserAsync(request);

    if (!user?.userId || !user?.email) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.log(user.userId);

    const verifyToken = randomUUID();

    await prisma.verificationToken.create({
      data: {
        token: verifyToken,
        userId: user.userId,
        expires: new Date(Date.now() + 1000 * 60 * 30), // 30 นาที
      },
    });

    await sendVerificationEmail(user.email, verifyToken);

    // const { data, error } = await resend.emails.send({
    //   from: "onboarding@resend.dev",
    //   to: [user?.email ?? ""],
    //   subject: "Verify your email",
    //   react: EmailTemplate({ verifyUrl }),
    // });

    // if (error) {
    //   console.log("route error1", error);
    //   return Response.json({ error }, { status: 500 });
    // }

    // return Response.json(data);

    return Response.json({
      success: true,
      message: "Verification email sent",
    });
  } catch (error) {
    console.log("route error2", error);
    return Response.json({ error }, { status: 500 });
  }
}
