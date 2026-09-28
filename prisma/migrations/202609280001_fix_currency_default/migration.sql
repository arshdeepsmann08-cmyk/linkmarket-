-- Fix: change currency default from USD to INR for India marketplace.
-- Update all existing products that were saved with the old USD default.
UPDATE "Product" SET currency = 'INR' WHERE currency = 'USD';

-- Change the column default to INR for all future inserts.
ALTER TABLE "Product" ALTER COLUMN currency SET DEFAULT 'INR';

