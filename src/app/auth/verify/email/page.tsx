"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function VerifyEmailTokenPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading"
  );

  useEffect(() => {
    if (!token) {
      setStatus("error");
      return;
    }

    const verifyToken = async () => {
      try {
        const res = await fetch(`/api/auth/verify?token=${token}`, {
          method: "GET",
        });
        if (!res.ok) throw new Error("Invalid or expired token");

        setStatus("success");

        // redirect ไป login หลัง verify สำเร็จ
        setTimeout(() => {
          router.push("/auth/login");
        }, 1500);
      } catch (err) {
        console.error(err);
        setStatus("error");
      }
    };

    verifyToken();
  }, [token, router]);

  // กรณี resend email
  const handleResendEmail = async () => {
    try {
      const res = await fetch("/api/auth/send", { method: "POST" });
      const data = await res.json();
      if (res.ok && data.success) {
        alert("Verification email sent!");
      } else {
        throw new Error(data?.error || "Failed to send email");
      }
    } catch (err) {
      console.error(err);
      alert(err instanceof Error ? err.message : "Failed to send email");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl text-center">
            {status === "loading"
              ? "Verifying your email..."
              : status === "success"
              ? "Email Verified!"
              : "Verify your email"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-center">
          {status === "error" && (
            <>
              <p className="text-gray-500 text-sm">
                Invalid or expired token. You can request a new verification
                link.
              </p>
              <Button onClick={handleResendEmail} className="mt-2">
                Resend verification email
              </Button>
            </>
          )}
          {status === "success" && (
            <p className="text-green-600 text-sm">
              Your email has been verified! Redirecting to login...
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
