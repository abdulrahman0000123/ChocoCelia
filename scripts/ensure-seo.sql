-- Additive, repeatable SEO provisioning. No existing rows are deleted.
BEGIN;
-- AlterTable
ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "attributes" JSONB NOT NULL DEFAULT '[]',
ADD COLUMN IF NOT EXISTS "imageAltAr" TEXT,
ADD COLUMN IF NOT EXISTS "imageAltEn" TEXT,
ADD COLUMN IF NOT EXISTS "published" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN IF NOT EXISTS "slug" TEXT;
ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "attributeSearch" TEXT NOT NULL DEFAULT '';

-- AlterTable
ALTER TABLE "sitesettings" ADD COLUMN IF NOT EXISTS "extra" JSONB NOT NULL DEFAULT '{}';

-- CreateTable
CREATE TABLE IF NOT EXISTS "SeoRecord" (
    "id" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "values" JSONB NOT NULL DEFAULT '{}',
    "history" JSONB NOT NULL DEFAULT '[]',
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SeoRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "SeoSettings" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "values" JSONB NOT NULL DEFAULT '{}',
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SeoSettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "AiSettings" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "encryptedKey" TEXT,
    "encryptedGoogle" TEXT,
    "enabled" BOOLEAN NOT NULL DEFAULT false,
    "model" TEXT NOT NULL DEFAULT 'gpt-4o-mini',
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AiSettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "ContentPage" (
    "id" TEXT NOT NULL,
    "kind" TEXT NOT NULL DEFAULT 'ARTICLE',
    "slug" TEXT NOT NULL,
    "titleAr" TEXT NOT NULL,
    "titleEn" TEXT NOT NULL,
    "summaryAr" TEXT NOT NULL DEFAULT '',
    "summaryEn" TEXT NOT NULL DEFAULT '',
    "bodyAr" TEXT NOT NULL DEFAULT '',
    "bodyEn" TEXT NOT NULL DEFAULT '',
    "image" TEXT NOT NULL DEFAULT '',
    "imageAltAr" TEXT NOT NULL DEFAULT '',
    "imageAltEn" TEXT NOT NULL DEFAULT '',
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "publishAt" TIMESTAMP(3),
    "productIds" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "categoryId" TEXT,
    "attributeKeys" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "history" JSONB NOT NULL DEFAULT '[]',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ContentPage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "UrlRedirect" (
    "fromPath" TEXT NOT NULL,
    "toPath" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UrlRedirect_pkey" PRIMARY KEY ("fromPath")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "TargetKeyword" (
    "id" TEXT NOT NULL,
    "term" TEXT NOT NULL,
    "locale" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "intent" TEXT NOT NULL DEFAULT '',
    "clicks" INTEGER,
    "impressions" INTEGER,
    "position" DOUBLE PRECISION,
    "source" TEXT NOT NULL DEFAULT 'manual',
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TargetKeyword_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "SeoRecord_entityType_entityId_key" ON "SeoRecord"("entityType", "entityId");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "ContentPage_slug_key" ON "ContentPage"("slug");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "ContentPage_status_publishAt_idx" ON "ContentPage"("status", "publishAt");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "TargetKeyword_term_locale_entityType_entityId_key" ON "TargetKeyword"("term", "locale", "entityType", "entityId");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "Product_slug_key" ON "Product"("slug");

-- Optional AI providers. Existing OpenAI key stays compatible.
ALTER TABLE "AiSettings" ADD COLUMN IF NOT EXISTS "provider" TEXT NOT NULL DEFAULT 'openai',
ADD COLUMN IF NOT EXISTS "providerKeys" JSONB NOT NULL DEFAULT '{}';

COMMIT;
