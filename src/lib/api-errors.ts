import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { ZodError } from "zod";

export interface ApiErrorResponse {
  success: false;
  message: string;
  code?: string;
}

export interface ApiSuccessResponse<T = any> {
  success: true;
  data: T;
  message?: string;
}

export type ApiResponse<T = any> = ApiSuccessResponse<T> | ApiErrorResponse;

/**
 * Standardized error response creator
 */
export function createErrorResponse(
  message: string,
  status: number = 500,
  code?: string
): NextResponse<ApiErrorResponse> {
  return NextResponse.json(
    {
      success: false,
      message,
      ...(code && { code }),
    },
    { status }
  );
}

/**
 * Standardized success response creator
 */
export function createSuccessResponse<T>(
  data: T,
  message?: string,
  status: number = 200
): NextResponse<ApiSuccessResponse<T>> {
  return NextResponse.json(
    {
      success: true,
      data,
      ...(message && { message }),
    },
    { status }
  );
}

/**
 * Error handler that sanitizes errors and logs them
 */
export function handleApiError(
  error: unknown,
  context: string = "API"
): NextResponse<ApiErrorResponse> {
  // Log the full error for debugging (server-side only)
  console.error(`[${context}] Error:`, {
    error: error instanceof Error ? error.message : String(error),
    stack: error instanceof Error ? error.stack : undefined,
    timestamp: new Date().toISOString(),
  });

  // Handle specific error types with sanitized messages
  if (error instanceof ZodError) {
    const fieldErrors = error.errors
      .map((err) => `${err.path.join(".")}: ${err.message}`)
      .join(", ");
    return createErrorResponse(
      `Validation failed: ${fieldErrors}`,
      400,
      "VALIDATION_ERROR"
    );
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    switch (error.code) {
      case "P2002":
        return createErrorResponse(
          "A record with this information already exists",
          409,
          "DUPLICATE_RECORD"
        );
      case "P2025":
        return createErrorResponse(
          "The requested record was not found",
          404,
          "RECORD_NOT_FOUND"
        );
      case "P2003":
        return createErrorResponse(
          "Invalid reference to related record",
          400,
          "INVALID_REFERENCE"
        );
      default:
        return createErrorResponse(
          "A database error occurred. Please try again later.",
          500,
          "DATABASE_ERROR"
        );
    }
  }

  if (error instanceof Prisma.PrismaClientUnknownRequestError) {
    return createErrorResponse(
      "A database error occurred. Please try again later.",
      500,
      "DATABASE_ERROR"
    );
  }

  if (error instanceof Prisma.PrismaClientValidationError) {
    return createErrorResponse(
      "Invalid data provided",
      400,
      "VALIDATION_ERROR"
    );
  }

  // Handle JWT/Auth errors
  if (error instanceof Error) {
    if (error.message.includes("jwt") || error.message.includes("token")) {
      return createErrorResponse(
        "Authentication failed. Please log in again.",
        401,
        "AUTH_ERROR"
      );
    }

    if (
      error.message.includes("unauthorized") ||
      error.message.includes("forbidden")
    ) {
      return createErrorResponse(
        "Access denied. You do not have permission to perform this action.",
        403,
        "PERMISSION_DENIED"
      );
    }
  }

  // Default sanitized error response
  return createErrorResponse(
    "An unexpected error occurred. Please try again later.",
    500,
    "INTERNAL_ERROR"
  );
}

/**
 * Async wrapper that automatically handles errors
 */
export function withErrorHandling<T extends any[], R>(
  handler: (...args: T) => Promise<NextResponse<R>>,
  context?: string
) {
  return async (...args: T): Promise<NextResponse<R | ApiErrorResponse>> => {
    try {
      return await handler(...args);
    } catch (error) {
      return handleApiError(error, context);
    }
  };
}

/**
 * Common error messages
 */
export const ERROR_MESSAGES = {
  UNAUTHORIZED: "You must be logged in to access this resource.",
  FORBIDDEN: "You do not have permission to access this resource.",
  NOT_FOUND: "The requested resource was not found.",
  VALIDATION_FAILED: "The provided data is invalid.",
  INTERNAL_ERROR: "An unexpected error occurred. Please try again later.",
  LOGIN_FAILED: "Login failed. Please check your credentials and try again.",
  REGISTRATION_FAILED:
    "Registration failed. Please check your information and try again.",
  DATABASE_ERROR: "A database error occurred. Please try again later.",
  DUPLICATE_EMAIL: "An account with this email already exists.",
  WEAK_PASSWORD: "Password must be at least 8 characters long.",
  INVALID_CREDENTIALS: "Invalid email or password.",
} as const;
