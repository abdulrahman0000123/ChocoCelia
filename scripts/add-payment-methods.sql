-- Add InstaPay and Cash Wallet fields to SiteSettings table
-- Run this script in Neon SQL Editor: https://console.neon.tech

-- Step 1: Add the new columns
ALTER TABLE "sitesettings" 
ADD COLUMN IF NOT EXISTS "instapaylink" TEXT,
ADD COLUMN IF NOT EXISTS "cashwalletnumber" TEXT;

-- Step 2: Verify the changes
SELECT * FROM "sitesettings";
