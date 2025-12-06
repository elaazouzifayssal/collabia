/*
  Warnings:

  - You are about to drop the `matches` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "matches";

-- CreateTable
CREATE TABLE "swipe_interests" (
    "id" TEXT NOT NULL,
    "senderId" TEXT NOT NULL,
    "receiverId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "isSuperLike" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "respondedAt" TIMESTAMP(3),

    CONSTRAINT "swipe_interests_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "swipe_interests_senderId_idx" ON "swipe_interests"("senderId");

-- CreateIndex
CREATE INDEX "swipe_interests_receiverId_idx" ON "swipe_interests"("receiverId");

-- CreateIndex
CREATE INDEX "swipe_interests_status_idx" ON "swipe_interests"("status");

-- CreateIndex
CREATE UNIQUE INDEX "swipe_interests_senderId_receiverId_key" ON "swipe_interests"("senderId", "receiverId");
