import * as React from "react";

interface EmailTemplateProps {
  verifyUrl: string;
}

export function EmailTemplate({ verifyUrl }: EmailTemplateProps) {
  return (
    <div className="bg-gray-100 p-8 font-sans">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-800 text-center">
          Verify your email
        </h2>
        <p className="text-gray-600 text-sm mt-4 text-center">
          Thanks for signing up! Please confirm your email address by clicking
          the button below.
        </p>

        <div className="text-center mt-6">
          <a
            href={verifyUrl}
            className="inline-block px-6 py-3 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition"
          >
            Verify Email
          </a>
        </div>

        <p className="text-gray-500 text-xs mt-6 text-center">
          If the button above doesn’t work, copy and paste this link into your
          browser:
        </p>
        <p className="text-blue-600 text-xs mt-2 break-all text-center">
          <a href={verifyUrl}>{verifyUrl}</a>
        </p>
        <p className="text-gray-400 text-xs mt-4 text-center">
          This link will expire in 30 minutes for security reasons.
        </p>
      </div>
    </div>
  );
}
