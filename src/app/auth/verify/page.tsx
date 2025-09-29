"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAuth, useVerifyEmail } from "@/hooks/use-auth";
import { useState } from "react";

export default function VerifyEmailPage() {
  const { data: user } = useAuth();
  const verifyEmail = useVerifyEmail();
  const [sending, setSending] = useState<boolean>(false);

  const handleSendEmail = async () => {
    setSending(true);
    verifyEmail.mutate(undefined, {
      onSuccess: () => {
        console.log("Send email success");
      },
      onError: (error) => {
        console.log("Send email error", error);
      },
    });
    setSending(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl text-center">
            Verify your email
          </CardTitle>
          {/* <CardDescription className="text-center">
            We’ve sent a verification link to your email. Please check your
            inbox to continue.
          </CardDescription> */}
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            type="button"
            className="w-full"
            onClick={handleSendEmail}
            disabled={sending}
          >
            {sending ? "Sending..." : "Send verification email"}
          </Button>
          <p className="text-xs text-center text-gray-500">
            Didn’t receive it? Check your spam folder or request a new link.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
