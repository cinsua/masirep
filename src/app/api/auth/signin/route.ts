import { NextRequest, NextResponse } from "next/server";
import { authRateLimit } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  // Apply aggressive rate limiting for sign-in attempts
  const rateLimitResult = authRateLimit(req);
  if (!rateLimitResult.success) {
    return rateLimitResult.error;
  }

  // This route is just for rate limiting purposes
  // The actual authentication is handled by NextAuth.js
  // We return success to let the client proceed to NextAuth
  const response = NextResponse.json({
    success: true,
    message: "Rate limit check passed"
  });

  // Add rate limit headers
  if (rateLimitResult.headers) {
    Object.entries(rateLimitResult.headers).forEach(([key, value]) => {
      response.headers.set(key, value);
    });
  }

  return response;
}

export async function GET(req: NextRequest) {
  // Allow clients to check current rate limit status
  const rateLimitResult = authRateLimit(req);

  const response = NextResponse.json({
    success: rateLimitResult.success,
    headers: rateLimitResult.headers || {}
  });

  // Add rate limit headers if available
  if (rateLimitResult.headers) {
    Object.entries(rateLimitResult.headers).forEach(([key, value]) => {
      response.headers.set(key, value);
    });
  }

  return response;
}