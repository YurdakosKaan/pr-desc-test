import { NextFunction, Request, Response } from "express";

type RateLimitConfig = {
  windowMs: number; // time window in milliseconds
  maxRequests: number; // max requests per window
  keyGenerator?: (req: Request) => string; // function to generate a unique key per client
  skipSuccessfulRequests?: boolean; // don't count successful requests (2xx)
};

const defaultConfig: Required<RateLimitConfig> = {
  windowMs: 60000, // 1 minute
  maxRequests: 100,
  keyGenerator: (req: Request) => {
    const forwarded = req.headers["x-forwarded-for"] as string | undefined;
    const ip = forwarded?.split(",")[0]?.trim() || req.socket.remoteAddress || "unknown";
    return ip;
  },
  skipSuccessfulRequests: false,
};

type RequestEntry = {
  count: number;
  resetAt: number;
};

const store = new Map<string, RequestEntry>();

export function rateLimit(config: Partial<RateLimitConfig> = {}) {
  const opts = { ...defaultConfig, ...config };

  return function rateLimitMiddleware(req: Request, res: Response, next: NextFunction) {
    const key = opts.keyGenerator(req);
    const now = Date.now();
    let entry = store.get(key);

    // Clean expired entries periodically (simple cleanup every 100 requests)
    if (store.size > 1000) {
      for (const [k, v] of store.entries()) {
        if (v.resetAt < now) {
          store.delete(k);
        }
      }
    }

    // Initialize or reset window
    if (!entry || entry.resetAt < now) {
      entry = { count: 0, resetAt: now + opts.windowMs };
      store.set(key, entry);
    }

    // Check limit
    if (entry.count >= opts.maxRequests) {
      const retryAfter = Math.ceil((entry.resetAt - now) / 1000);
      res.setHeader("Retry-After", retryAfter.toString());
      res.setHeader("X-RateLimit-Limit", opts.maxRequests.toString());
      res.setHeader("X-RateLimit-Remaining", "0");
      res.setHeader("X-RateLimit-Reset", new Date(entry.resetAt).toISOString());
      return res.status(429).json({ error: { message: "Too many requests", code: "rate_limit_exceeded" } });
    }

    // Increment counter
    entry.count++;

    // Set rate limit headers
    res.setHeader("X-RateLimit-Limit", opts.maxRequests.toString());
    res.setHeader("X-RateLimit-Remaining", Math.max(0, opts.maxRequests - entry.count).toString());
    res.setHeader("X-RateLimit-Reset", new Date(entry.resetAt).toISOString());

    // Track successful requests if needed
    if (opts.skipSuccessfulRequests) {
      const originalEnd = res.end.bind(res);
      res.end = function (chunk?: any, encoding?: any, cb?: any) {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          entry!.count = Math.max(0, entry!.count - 1);
        }
        return originalEnd(chunk, encoding, cb);
      };
    }

    next();
  };
}

