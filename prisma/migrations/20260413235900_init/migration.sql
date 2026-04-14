-- Initial schema: base tables from NestJS boilerplate (pre-auth-field additions)

CREATE TABLE "role" (
  "id"   INTEGER NOT NULL,
  "name" TEXT    NOT NULL,
  CONSTRAINT "role_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "status" (
  "id"   INTEGER NOT NULL,
  "name" TEXT    NOT NULL,
  CONSTRAINT "status_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "file" (
  "id"   UUID NOT NULL DEFAULT gen_random_uuid(),
  "path" TEXT NOT NULL,
  CONSTRAINT "file_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "user" (
  "id"         SERIAL NOT NULL,
  "email"      TEXT,
  "password"   TEXT,
  "provider"   TEXT NOT NULL DEFAULT 'email',
  "socialId"   TEXT,
  "firstName"  TEXT,
  "lastName"   TEXT,
  "createdAt"  TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"  TIMESTAMP(3) NOT NULL,
  "deletedAt"  TIMESTAMP(3),
  "photoId"    UUID,
  "roleId"     INTEGER,
  "statusId"   INTEGER,
  CONSTRAINT "user_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "user_email_key"  ON "user"("email");
CREATE UNIQUE INDEX "user_photoId_key" ON "user"("photoId");
CREATE INDEX "user_socialId_idx"   ON "user"("socialId");
CREATE INDEX "user_firstName_idx"  ON "user"("firstName");
CREATE INDEX "user_lastName_idx"   ON "user"("lastName");

ALTER TABLE "user" ADD CONSTRAINT "user_photoId_fkey"
  FOREIGN KEY ("photoId") REFERENCES "file"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "user" ADD CONSTRAINT "user_roleId_fkey"
  FOREIGN KEY ("roleId") REFERENCES "role"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "user" ADD CONSTRAINT "user_statusId_fkey"
  FOREIGN KEY ("statusId") REFERENCES "status"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE TABLE "session" (
  "id"        SERIAL NOT NULL,
  "hash"      TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  "deletedAt" TIMESTAMP(3),
  "userId"    INTEGER NOT NULL,
  CONSTRAINT "session_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "session_userId_idx" ON "session"("userId");

ALTER TABLE "session" ADD CONSTRAINT "session_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
