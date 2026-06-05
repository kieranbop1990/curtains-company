-- Add file upload fields to LQDrawing
ALTER TABLE "LQDrawing" ADD COLUMN IF NOT EXISTS "s3Key"    TEXT;
ALTER TABLE "LQDrawing" ADD COLUMN IF NOT EXISTS "fileName" TEXT;

-- Add file upload fields to LQInvoice
ALTER TABLE "LQInvoice" ADD COLUMN IF NOT EXISTS "s3Key"    TEXT;
ALTER TABLE "LQInvoice" ADD COLUMN IF NOT EXISTS "fileName" TEXT;
