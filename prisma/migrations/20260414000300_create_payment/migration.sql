CREATE TABLE "payment" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "receiptPath" TEXT,
    "waveRef" TEXT,
    "amount" DOUBLE PRECISION,
    "validatedAt" TIMESTAMP(3),
    "validatedBy" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payment_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "payment_waveRef_key" ON "payment"("waveRef");
CREATE INDEX "payment_userId_idx" ON "payment"("userId");

ALTER TABLE "payment"
ADD CONSTRAINT "payment_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "user"("id")
ON DELETE RESTRICT ON UPDATE CASCADE;
