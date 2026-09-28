-- Product management expansion. All additions preserve existing rows.
ALTER TABLE "Category" ADD COLUMN IF NOT EXISTS "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "Category" ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "productUrl" TEXT NOT NULL DEFAULT '';
ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "currency" VARCHAR(3) NOT NULL DEFAULT 'USD';
ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "brand" TEXT;
ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "availability" TEXT NOT NULL DEFAULT 'In stock';
ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "isFeatured" BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "isActive" BOOLEAN NOT NULL DEFAULT TRUE;
ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "source" TEXT NOT NULL DEFAULT 'MANUAL';
ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "sourceProductId" TEXT;
UPDATE "Product" SET "productUrl" = "affiliateUrl" WHERE "productUrl" = '';
-- The previous homepage treated its recent products as featured. Preserve that behaviour on upgrade.
UPDATE "Product" SET "isFeatured" = TRUE WHERE "isFeatured" = FALSE;
ALTER TABLE "Click" ADD COLUMN IF NOT EXISTS "sessionId" TEXT;
ALTER TABLE "Click" ADD COLUMN IF NOT EXISTS "merchant" TEXT;
ALTER TABLE "Click" ADD COLUMN IF NOT EXISTS "device" TEXT;
CREATE INDEX IF NOT EXISTS "Product_isActive_createdAt_idx" ON "Product" ("isActive", "createdAt");
CREATE INDEX IF NOT EXISTS "Product_categoryId_isActive_idx" ON "Product" ("categoryId", "isActive");
CREATE INDEX IF NOT EXISTS "Product_merchantName_idx" ON "Product" ("merchantName");
CREATE INDEX IF NOT EXISTS "Click_productId_createdAt_idx" ON "Click" ("productId", "createdAt");
CREATE INDEX IF NOT EXISTS "Click_createdAt_idx" ON "Click" ("createdAt");
