import { NextRequest } from 'next/server';

// Simple in-memory rate limiter for development
// In production, consider using Redis or a more robust solution
const rateLimit = new Map<string, { count: number; resetTime: number }>();

export interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Maximum requests per window
  message?: string; // Custom error message
}

export function createRateLimiter(config: RateLimitConfig) {
  return (req: NextRequest): { success: boolean; error?: Response; headers?: Record<string, string> } => {
    // Get client identifier (IP address for API routes)
    const forwarded = req.headers.get('x-forwarded-for');
    const realIp = req.headers.get('x-real-ip');
    const identifier = forwarded ?
                      forwarded.split(',')[0].trim() :
                      (realIp ?? 'unknown');

    const now = Date.now();
    const windowStart = now - config.windowMs;

    // Clean up old entries
    for (const [key, value] of rateLimit.entries()) {
      if (value.resetTime < now) {
        rateLimit.delete(key);
      }
    }

    // Get or create rate limit entry
    let entry = rateLimit.get(identifier);
    if (!entry || entry.resetTime < now) {
      entry = {
        count: 0,
        resetTime: now + config.windowMs
      };
      rateLimit.set(identifier, entry);
    }

    // Check if rate limit exceeded
    if (entry.count >= config.maxRequests) {
      const errorResponse = new Response(
        JSON.stringify({
          error: config.message || 'Too many requests',
          retryAfter: Math.ceil((entry.resetTime - now) / 1000)
        }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'X-RateLimit-Limit': config.maxRequests.toString(),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': new Date(entry.resetTime).toISOString(),
            'Retry-After': Math.ceil((entry.resetTime - now) / 1000).toString()
          }
        }
      );
      return { success: false, error: errorResponse };
    }

    // Increment counter
    entry.count++;

    // Add rate limit headers to successful response
    const headers = {
      'X-RateLimit-Limit': config.maxRequests.toString(),
      'X-RateLimit-Remaining': Math.max(0, config.maxRequests - entry.count).toString(),
      'X-RateLimit-Reset': new Date(entry.resetTime).toISOString()
    };

    return { success: true, headers };
  };
}

// Pre-configured rate limiters for different use cases
export const authRateLimit = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 5, // 5 attempts per 15 minutes
  message: 'Too many authentication attempts, please try again later'
});

export const generalApiRateLimit = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 100, // 100 requests per 15 minutes
  message: 'API rate limit exceeded'
});

export const aggressiveRateLimit = createRateLimiter({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 10, // 10 requests per minute
  message: 'Too many requests, please slow down'
});