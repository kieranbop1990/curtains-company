-- LQ allowances, admin overrides, QR code
ALTER TABLE "LiveProject" ADD COLUMN IF NOT EXISTS "daysOnSite"            INTEGER;
ALTER TABLE "LiveProject" ADD COLUMN IF NOT EXISTS "travelAllowancePpd"    DOUBLE PRECISION;
ALTER TABLE "LiveProject" ADD COLUMN IF NOT EXISTS "overnightAllowancePpd" DOUBLE PRECISION;
ALTER TABLE "LiveProject" ADD COLUMN IF NOT EXISTS "adminOverrideNotes"    TEXT;
ALTER TABLE "LiveProject" ADD COLUMN IF NOT EXISTS "adminOverrideBy"       TEXT;
ALTER TABLE "LiveProject" ADD COLUMN IF NOT EXISTS "qrCodeUrl"             TEXT;

-- Quote documents
CREATE TABLE "QuoteDocument" (
    "id"         TEXT NOT NULL,
    "quoteId"    TEXT NOT NULL,
    "docType"    TEXT NOT NULL,
    "fileName"   TEXT NOT NULL,
    "s3Key"      TEXT NOT NULL,
    "uploadedBy" TEXT,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "QuoteDocument_pkey" PRIMARY KEY ("id")
);
ALTER TABLE "QuoteDocument" ADD CONSTRAINT "QuoteDocument_quoteId_fkey"
    FOREIGN KEY ("quoteId") REFERENCES "Quote"("id") ON DELETE CASCADE ON UPDATE CASCADE;
