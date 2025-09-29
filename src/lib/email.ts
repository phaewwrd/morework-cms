// lib/email.ts
import nodemailer from "nodemailer";

// สร้าง transporter
const transporter = nodemailer.createTransport({
  service: "gmail", // หรือ smtp.gmail.com
  auth: {
    user: process.env.EMAIL_USER, // อีเมล Gmail ของคุณ
    pass: process.env.EMAIL_PASSWORD, // App Password (ไม่ใช่รหัสปกติ)
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
    const info = await transporter.sendMail({
      from: `"Your App Name" <${process.env.EMAIL_USER}>`,
      to: options.to,
      subject: options.subject,
      text: options.text,
      html: options.html,
    });

    console.log("Email sent:", info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("Email error:", error);
    throw error;
  }
}

// ส่ง verification email
export async function sendVerificationEmail(email: string, token: string) {
  const verifyLink = `${process.env.NEXT_PUBLIC_APP_URL}/auth/verify?token=${token}`;

  return sendEmail({
    to: email,
    subject: "Verify your email address",
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px;">
        <h2>Verify Your Email</h2>
        <p>Click the button below to verify your email address:</p>
        <a href="${verifyLink}" 
           style="display: inline-block; padding: 12px 24px; background-color: #007bff; 
                  color: white; text-decoration: none; border-radius: 5px; margin: 20px 0;">
          Verify Email
        </a>
        <p>Or copy this link:</p>
        <p style="color: #666; word-break: break-all;">${verifyLink}</p>
        <p style="color: #999; font-size: 12px; margin-top: 20px;">
          This link will expire in 24 hours.
        </p>
      </div>
    `,
    text: `Verify your email: ${verifyLink}`,
  });
}
