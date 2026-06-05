CREATE TABLE "QuoteChaseEntry" (
    "id"             TEXT NOT NULL,
    "quoteId"        TEXT NOT NULL,
    "chaseDate"      TEXT NOT NULL,
    "chasedBy"       TEXT NOT NULL,
    "method"         TEXT,
    "outcome"        TEXT,
    "nextActionDate" TEXT,
    "createdAt"      TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "QuoteChaseEntry_pkey" PRIMARY KEY ("id")
);
ALTER TABLE "QuoteChaseEntry" ADD CONSTRAINT "QuoteChaseEntry_quoteId_fkey"
    FOREIGN KEY ("quoteId") REFERENCES "Quote"("id") ON DELETE CASCADE ON UPDATE CASCADE;
