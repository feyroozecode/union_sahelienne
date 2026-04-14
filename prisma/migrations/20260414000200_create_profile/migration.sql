CREATE TABLE "profile" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "gender" TEXT NOT NULL DEFAULT 'unspecified',
    "age" INTEGER,
    "profession" TEXT,
    "maritalStatus" TEXT,
    "childrenCount" INTEGER,
    "ethnicity" TEXT,
    "country" TEXT,
    "city" TEXT,
    "bloodType" TEXT,
    "hivTest" BOOLEAN,
    "hepatitisTest" BOOLEAN,
    "searchedAgeMin" INTEGER,
    "searchedAgeMax" INTEGER,
    "searchedMarital" TEXT,
    "searchedCriteria" TEXT,
    "termsAcceptedAt" TIMESTAMP(3),
    "isComplete" BOOLEAN NOT NULL DEFAULT false,
    "isValidated" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "profile_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "profile_userId_key" ON "profile"("userId");

ALTER TABLE "profile"
ADD CONSTRAINT "profile_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "user"("id")
ON DELETE RESTRICT ON UPDATE CASCADE;
