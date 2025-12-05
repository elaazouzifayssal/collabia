-- AlterTable
ALTER TABLE "users" ADD COLUMN "schoolVerified" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "schoolEmail" TEXT,
ADD COLUMN "verifiedAt" TIMESTAMP(3);
