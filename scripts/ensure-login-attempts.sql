-- Additive, repeatable deployment repair for database-backed login throttling.
CREATE TABLE IF NOT EXISTS "LoginAttempt" (
    "key" TEXT NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 0,
    "windowStart" TIMESTAMP(3) NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "LoginAttempt_pkey" PRIMARY KEY ("key")
);

CREATE INDEX IF NOT EXISTS "LoginAttempt_windowStart_idx"
    ON "LoginAttempt"("windowStart");
