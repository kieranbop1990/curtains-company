CREATE TABLE "LQCostingItem" (
    "id"            TEXT NOT NULL,
    "liveProjectId" TEXT NOT NULL,
    "description"   TEXT NOT NULL,
    "qty"           DOUBLE PRECISION NOT NULL DEFAULT 1,
    "unitCost"      DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt"     TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"     TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "LQCostingItem_pkey" PRIMARY KEY ("id")
);
ALTER TABLE "LQCostingItem" ADD CONSTRAINT "LQCostingItem_liveProjectId_fkey"
    FOREIGN KEY ("liveProjectId") REFERENCES "LiveProject"("id") ON DELETE CASCADE ON UPDATE CASCADE;
