import { createMiddleware } from "hono/factory";
import { ApiResponse } from "@/common/types";

interface RateLimitOptions {
  windowMs?: number;
  max?: number;
}

const memoryStore = new Map<string, { count: number; resetTime: number }>();

export const rateLimiter = (options: RateLimitOptions = {}) => {
  const windowMs = options.windowMs || 60 * 1000;
  const max = options.max || 60;

  return createMiddleware(async (c, next) => {
    const ip = c.req.header("x-forwarded-for") || c.req.header("cf-connecting-ip") || "127.0.0.1";
    const now = Date.now();

    let record = memoryStore.get(ip);

    if (!record || now > record.resetTime) {
      record = { count: 1, resetTime: now + windowMs };
      memoryStore.set(ip, record);
    } else {
      record.count += 1;
    }

    const remaining = Math.max(0, max - record.count);
    const resetSeconds = Math.ceil((record.resetTime - now) / 1000);

    c.header("X-RateLimit-Limit", max.toString());
    c.header("X-RateLimit-Remaining", remaining.toString());
    c.header("X-RateLimit-Reset", resetSeconds.toString());

    if (record.count > max) {
      const response: ApiResponse = {
        success: false,
        error: {
          code: "TOO_MANY_REQUESTS",
          message: `Rate limit exceeded. Please try again in ${resetSeconds} seconds.`,
        },
        meta: {
          timestamp: new Date().toISOString(),
          requestId: crypto.randomUUID(),
        },
      };
      return c.json(response, 429);
    }

    await next();
  });
};
