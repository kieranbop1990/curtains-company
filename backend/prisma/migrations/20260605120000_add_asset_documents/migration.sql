-- CreateTable
CREATE TABLE "AssetDocument" (
    "id"         TEXT NOT NULL,
    "assetId"    TEXT NOT NULL,
    "docType"    TEXT NOT NULL,
    "fileName"   TEXT NOT NULL,
    "s3Key"      TEXT NOT NULL,
    "uploadedBy" TEXT,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AssetDocument_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "AssetDocument" ADD CONSTRAINT "AssetDocument_assetId_fkey"
    FOREIGN KEY ("assetId") REFERENCES "Asset"("id") ON DELETE CASCADE ON UPDATE CASCADE;
