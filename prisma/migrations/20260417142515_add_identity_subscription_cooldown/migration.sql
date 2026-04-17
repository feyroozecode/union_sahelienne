-- AlterTable
ALTER TABLE "file" ALTER COLUMN "id" DROP DEFAULT;

-- AlterTable
ALTER TABLE "match" ADD COLUMN     "cooldownUntil" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "profile" ADD COLUMN     "identityDocPath" TEXT,
ADD COLUMN     "identityDocType" TEXT,
ADD COLUMN     "isIdentityVerified" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "matchCreditsTotal" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "matchCreditsUsed" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "subscriptionType" TEXT;
