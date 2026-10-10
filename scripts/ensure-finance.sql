BEGIN;
SET LOCAL search_path TO public;
ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "requestKey" TEXT;
ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "requestHash" TEXT;
CREATE UNIQUE INDEX IF NOT EXISTS "Order_requestKey_key" ON "Order"("requestKey");
CREATE TABLE IF NOT EXISTS "ProductCost" (
 "productId" TEXT PRIMARY KEY REFERENCES "Product"("id") ON DELETE CASCADE,
 "chocolate" DECIMAL(12,2) NOT NULL CHECK ("chocolate" >= 0),
 "packaging" DECIMAL(12,2) NOT NULL CHECK ("packaging" >= 0),
 "nuts" DECIMAL(12,2) NOT NULL CHECK ("nuts" >= 0),
 "decoration" DECIMAL(12,2) NOT NULL CHECK ("decoration" >= 0),
 "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS "FinanceSettings" (
 "id" INTEGER PRIMARY KEY DEFAULT 1 CHECK ("id" = 1),
 "advertisingPct" DECIMAL(5,2) NOT NULL DEFAULT 10 CHECK ("advertisingPct" BETWEEN 0 AND 50),
 "developmentPct" DECIMAL(5,2) NOT NULL DEFAULT 20 CHECK ("developmentPct" BETWEEN 0 AND 50),
 "deliveryCostBeniSuef" DECIMAL(12,2) CHECK ("deliveryCostBeniSuef" >= 0),
 "deliveryCostEastNile" DECIMAL(12,2) CHECK ("deliveryCostEastNile" >= 0),
 "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "FinanceSettings" ("id") VALUES (1) ON CONFLICT DO NOTHING;
CREATE TABLE IF NOT EXISTS "OrderFinance" (
 "orderId" TEXT PRIMARY KEY REFERENCES "Order"("id") ON DELETE RESTRICT,
 "version" INTEGER NOT NULL DEFAULT 1,
 "lines" JSONB NOT NULL,
 "netSales" DECIMAL(14,2) NOT NULL,
 "productCost" DECIMAL(14,2),
 "advertisingPct" DECIMAL(5,2) NOT NULL,
 "developmentPct" DECIMAL(5,2) NOT NULL,
 "advertising" DECIMAL(14,2) NOT NULL,
 "deliveryCost" DECIMAL(12,2),
 "profit" DECIMAL(14,2),
 "development" DECIMAL(14,2),
 "available" DECIMAL(14,2),
 "received" DECIMAL(14,2) NOT NULL DEFAULT 0 CHECK ("received" >= 0),
 "refunded" DECIMAL(14,2) NOT NULL DEFAULT 0 CHECK ("refunded" >= 0 AND "refunded" <= "received"),
 "completedAt" TIMESTAMP(3),
 "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
 "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS "FinanceEvent" (
 "id" TEXT PRIMARY KEY,
 "orderId" TEXT NOT NULL REFERENCES "OrderFinance"("orderId") ON DELETE RESTRICT,
 "actorId" TEXT NOT NULL,
 "action" TEXT NOT NULL,
 "reason" TEXT NOT NULL,
 "before" JSONB NOT NULL,
 "after" JSONB NOT NULL,
 "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS "FinanceEvent_orderId_createdAt_idx" ON "FinanceEvent"("orderId", "createdAt");
COMMIT;
