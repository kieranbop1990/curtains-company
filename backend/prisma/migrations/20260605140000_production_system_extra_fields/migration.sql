ALTER TABLE "ProductionSystem" ADD COLUMN IF NOT EXISTS "barrelType"          TEXT;
ALTER TABLE "ProductionSystem" ADD COLUMN IF NOT EXISTS "installationType"    TEXT;
ALTER TABLE "ProductionSystem" ADD COLUMN IF NOT EXISTS "fabricAccommodation" TEXT;
ALTER TABLE "ProductionSystem" ADD COLUMN IF NOT EXISTS "bottomRail"          TEXT;
ALTER TABLE "ProductionSystem" ADD COLUMN IF NOT EXISTS "motorPosition"       TEXT;
ALTER TABLE "ProductionSystem" ADD COLUMN IF NOT EXISTS "installationSide"    TEXT;
ALTER TABLE "ProductionSystem" ADD COLUMN IF NOT EXISTS "firingRating"        TEXT;
ALTER TABLE "ProductionSystem" ADD COLUMN IF NOT EXISTS "loadingPlate"        BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "ProductionSystem" ADD COLUMN IF NOT EXISTS "droppingHeightBar"   BOOLEAN NOT NULL DEFAULT false;
