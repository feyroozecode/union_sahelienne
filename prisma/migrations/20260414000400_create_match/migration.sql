CREATE TABLE "match" (
    "id" SERIAL NOT NULL,
    "requesterId" INTEGER NOT NULL,
    "targetId" INTEGER NOT NULL,
    "pairKey" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "chatOpenedAt" TIMESTAMP(3),
    "chatExpiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "match_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "match_pairKey_key" ON "match"("pairKey");
CREATE INDEX "match_requesterId_idx" ON "match"("requesterId");
CREATE INDEX "match_targetId_idx" ON "match"("targetId");

ALTER TABLE "match"
ADD CONSTRAINT "match_requesterId_fkey"
FOREIGN KEY ("requesterId") REFERENCES "user"("id")
ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "match"
ADD CONSTRAINT "match_targetId_fkey"
FOREIGN KEY ("targetId") REFERENCES "user"("id")
ON DELETE RESTRICT ON UPDATE CASCADE;
