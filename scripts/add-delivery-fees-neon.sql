-- Add delivery fee columns to SiteSettings table in Neon Database
-- Run this script in Neon SQL Editor: https://console.neon.tech

-- Step 1: Add the new columns with default values
ALTER TABLE "SiteSettings" 
ADD COLUMN IF NOT EXISTS "deliveryFeeBeniSuef" DOUBLE PRECISION DEFAULT 20,
ADD COLUMN IF NOT EXISTS "deliveryFeeEastNile" DOUBLE PRECISION DEFAULT 40;

-- Step 2: Update existing rows to have the default values
UPDATE "SiteSettings" 
SET "deliveryFeeBeniSuef" = 20, 
    "deliveryFeeEastNile" = 40
WHERE "deliveryFeeBeniSuef" IS NULL OR "deliveryFeeEastNile" IS NULL;

-- Step 3: Verify the changes
SELECT * FROM "SiteSettings";
