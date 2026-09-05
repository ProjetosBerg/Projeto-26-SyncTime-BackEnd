import { NextFunction, Request, Response } from "express";
import { Middleware } from "@/presentation/protocols/middleware";
import { ResponseStatus } from "@/utils/service";

type RateLimitOptions = {
  limit: number;
  windowMs: number;
  keyPrefix: string;
  key?: (req: Request) => string;
};

type RateLimitEntry = {
  count: number;
  resetAt: number;
};

export const makeRateLimitMiddleware = (
  options: RateLimitOptions
): Middleware => {
  const entries = new Map<string, RateLimitEntry>();
  let requestsSinceCleanup = 0;

  const cleanupExpiredEntries = (now: number): void => {
    requestsSinceCleanup += 1;
    if (requestsSinceCleanup < 100) return;

    requestsSinceCleanup = 0;
    for (const [key, entry] of entries) {
      if (entry.resetAt <= now) entries.delete(key);
    }
  };

  return {
    handle(req: Request, res: Response, next: NextFunction): void {
      const now = Date.now();
      cleanupExpiredEntries(now);

      const requestKey = options.key?.(req) || req.ip || "unknown";
      const bucketKey = `${options.keyPrefix}:${requestKey}`;
      const current = entries.get(bucketKey);
      const entry =
        !current || current.resetAt <= now
          ? { count: 0, resetAt: now + options.windowMs }
          : current;

      entry.count += 1;
      entries.set(bucketKey, entry);

      const remaining = Math.max(0, options.limit - entry.count);
      const resetInSeconds = Math.max(
        1,
        Math.ceil((entry.resetAt - now) / 1000)
      );

      res.setHeader("RateLimit-Limit", String(options.limit));
      res.setHeader("RateLimit-Remaining", String(remaining));
      res.setHeader(
        "RateLimit-Reset",
        String(Math.ceil(entry.resetAt / 1000))
      );

      if (entry.count > options.limit) {
        res.setHeader("Retry-After", String(resetInSeconds));
        res.status(429).json({
          status: ResponseStatus.TOO_MANY_REQUESTS,
          message: "Muitas tentativas. Aguarde antes de tentar novamente.",
        });
        return;
      }

      next();
    },
  };
};
