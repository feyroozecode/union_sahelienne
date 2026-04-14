ALTER TABLE "user"
ADD COLUMN "phone" TEXT,
ADD COLUMN "otpHash" TEXT,
ADD COLUMN "otpExpiry" TIMESTAMP(3),
ADD COLUMN "otpPurpose" TEXT,
ADD COLUMN "lastOtpAt" TIMESTAMP(3),
ADD COLUMN "lastLoginAt" TIMESTAMP(3);

CREATE UNIQUE INDEX "user_phone_key" ON "user"("phone");
