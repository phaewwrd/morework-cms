// lib/email.ts
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_SERVER_HOST,
  port: Number(process.env.EMAIL_SERVER_PORT),
  secure: Number(process.env.EMAIL_SERVER_PORT) === 465, // port 465 ต้อง secure=true
  auth: {
    user: process.env.EMAIL_SERVER_USER,
    pass: process.env.EMAIL_SERVER_PASSWORD,
  },
});

interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export async function sendEmail(options: SendEmailOptions) {
  try {
    // ตรวจสอบค่าที่จำเป็น
    if (!process.env.EMAIL_SERVER_USER || !process.env.EMAIL_SERVER_PASSWORD) {
      throw new Error(
        "Email configuration is missing. Please check EMAIL_SERVER_USER and EMAIL_SERVER_PASSWORD environment variables."
      );
    }

    if (!process.env.EMAIL_FROM) {
      throw new Error(
        "Sender email is missing. Please set EMAIL_FROM in your environment variables."
      );
    }

    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM, // ต้องเป็นอีเมลจริง เช่น no-reply@yourdomain.com
      to: options.to,
      subject: options.subject,
      text: options.text,
      html: options.html,
    });

    console.log("Email sent:", info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("Email error:", error);
    if (error instanceof Error) {
      throw new Error(`Email sending failed: ${error.message}`);
    } else {
      throw new Error("Email sending failed: Unknown error");
    }
  }
}

// ส่ง verification email
export async function sendVerificationEmail(email: string, token: string) {
  if (!process.env.NEXT_PUBLIC_APP_URL) {
    throw new Error("NEXT_PUBLIC_APP_URL is not set in environment variables.");
  }

  const verifyLink = `${process.env.NEXT_PUBLIC_APP_URL}/auth/verify/email?token=${token}`;

  return sendEmail({
    to: email,
    subject: "Verify your email address",
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px;">
        <h2>Verify Your Email</h2>
        <p>Click the button below to verify your email:</p>
        <a href="${verifyLink}" style="padding:12px 24px;background:#007bff;color:#fff;text-decoration:none;border-radius:5px;">Verify Email</a>
        <p>Or copy this link:</p>
        <p style="color:#666; word-break: break-word;">${verifyLink}</p>
      </div>
    `,
    text: `Verify your email: ${verifyLink}`,
  });
}
