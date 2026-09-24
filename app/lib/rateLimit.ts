import { createHash } from 'node:crypto';
import { prisma } from '@/app/lib/db';

type RateLimitResult = { limited: boolean; remaining: number; resetTime: number };

function storageKey(identifier: string) {
  return createHash('sha256').update(identifier).digest('hex');
}

/** Atomic, database-backed rate limiting shared across serverless instances. */
export async function rateLimit(
  identifier: string,
  maxAttempts = 5,
  windowMs = 15 * 60 * 1000,
): Promise<RateLimitResult> {
  const now = new Date();
  const [entry] = await prisma.$queryRawUnsafe<Array<{ count: number; windowStart: Date }>>(
    `INSERT INTO "LoginAttempt" ("key", "count", "windowStart", "updatedAt")
     VALUES ($1, 1, $2, $2)
     ON CONFLICT ("key") DO UPDATE SET
       "count" = CASE
         WHEN "LoginAttempt"."windowStart" <= $2 - ($3 * INTERVAL '1 millisecond') THEN 1
         ELSE "LoginAttempt"."count" + 1
       END,
       "windowStart" = CASE
         WHEN "LoginAttempt"."windowStart" <= $2 - ($3 * INTERVAL '1 millisecond') THEN $2
         ELSE "LoginAttempt"."windowStart"
       END,
       "updatedAt" = $2
     RETURNING "count", "windowStart"`,
    storageKey(identifier),
    now,
    windowMs,
  );

  // Opportunistically bound the table without adding a scheduled database job.
  if (Math.random() < 0.01) {
    await prisma.loginAttempt.deleteMany({
      where: { windowStart: { lt: new Date(now.getTime() - 48 * 60 * 60 * 1000) } },
    });
  }

  const resetTime = entry.windowStart.getTime() + windowMs;
  return {
    limited: entry.count > maxAttempts,
    remaining: Math.max(0, maxAttempts - entry.count),
    resetTime,
  };
}
