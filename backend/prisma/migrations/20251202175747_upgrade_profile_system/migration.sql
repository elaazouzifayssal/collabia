-- AlterTable: Add new profile fields
ALTER TABLE "users"
  ADD COLUMN "username" TEXT,
  ADD COLUMN "location" TEXT,
  ADD COLUMN "openToStudyPartner" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN "openToProjects" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN "openToAccountability" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN "openToCofounder" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN "openToHelpingOthers" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN "lastActiveAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  ADD COLUMN "collaborationsStarted" INTEGER NOT NULL DEFAULT 0;

-- Create unique index on username
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");
