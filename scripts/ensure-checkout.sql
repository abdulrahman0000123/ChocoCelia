-- Additive and repeatable. Historical orders retain unknown schedule and pricing details.
BEGIN;
ALTER TABLE "Order"
  ADD COLUMN IF NOT EXISTS "requestedDeliveryDate" TEXT,
  ADD COLUMN IF NOT EXISTS "requestedDeliveryTime" TEXT,
  ADD COLUMN IF NOT EXISTS "subtotal" DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS "deliveryFee" DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS "couponCode" TEXT,
  ADD COLUMN IF NOT EXISTS "discountPct" DOUBLE PRECISION NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "discountAmount" DOUBLE PRECISION NOT NULL DEFAULT 0;
COMMIT;
