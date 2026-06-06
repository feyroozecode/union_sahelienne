-- AlterTable
ALTER TABLE "user"
  ADD COLUMN "waitlistReason" TEXT,
  ADD COLUMN "waitlistedAt" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "user_waitlistReason_waitlistedAt_idx"
  ON "user"("waitlistReason", "waitlistedAt");
