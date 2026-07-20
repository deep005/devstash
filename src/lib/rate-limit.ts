import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const redis =
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
    ? Redis.fromEnv()
    : null;

function createLimiter(
  tokens: number,
  window: `${number} ${"s" | "m" | "h"}`,
  prefix: string,
): Ratelimit | null {
  if (!redis) return null;
  return new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(tokens, window),
    prefix: `ratelimit:${prefix}`,
  });
}

// Limits per context/features/rate-limiting-spec.md.
export const loginRateLimiter = createLimiter(5, "15 m", "login");
export const registerRateLimiter = createLimiter(3, "1 h", "register");
export const forgotPasswordRateLimiter = createLimiter(3, "1 h", "forgot-password");
export const resetPasswordRateLimiter = createLimiter(5, "15 m", "reset-password");
export const resendVerificationRateLimiter = createLimiter(3, "15 m", "resend-verification");

export interface RateLimitResult {
  success: boolean;
  remaining: number;
  reset: number;
}

/**
 * Checks `limiter` for `identifier`. Fails open (always succeeds) when Upstash
 * isn't configured or the check itself errors, so an outage never blocks
 * legitimate auth traffic.
 */
export async function checkRateLimit(
  limiter: Ratelimit | null,
  identifier: string,
): Promise<RateLimitResult> {
  if (!limiter) {
    return { success: true, remaining: Infinity, reset: 0 };
  }
  try {
    const { success, remaining, reset } = await limiter.limit(identifier);
    return { success, remaining, reset };
  } catch (error) {
    console.error("Rate limit check failed; failing open.", error);
    return { success: true, remaining: Infinity, reset: 0 };
  }
}

/** Extracts the client IP from standard proxy headers (Vercel sets x-forwarded-for). */
export function getClientIp(headers: Pick<Headers, "get">): string {
  const forwardedFor = headers.get("x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(",")[0]!.trim();
  }
  return headers.get("x-real-ip") ?? "unknown";
}

/** Seconds until `resetMs` (a Ratelimit `reset` timestamp), for a Retry-After header. */
export function getRetryAfterSeconds(resetMs: number): number {
  return Math.max(1, Math.ceil((resetMs - Date.now()) / 1000));
}

/** Friendly "try again in X" text for a Ratelimit `reset` timestamp. */
export function formatRetryAfter(resetMs: number): string {
  const minutes = Math.ceil(getRetryAfterSeconds(resetMs) / 60);
  return minutes <= 1 ? "a minute" : `${minutes} minutes`;
}
