-- CreateTable
CREATE TABLE "matches" (
    "id" TEXT NOT NULL,
    "user1Id" TEXT NOT NULL,
    "user2Id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "matches_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "matches_user1Id_idx" ON "matches"("user1Id");

-- CreateIndex
CREATE INDEX "matches_user2Id_idx" ON "matches"("user2Id");

-- CreateIndex
CREATE UNIQUE INDEX "matches_user1Id_user2Id_key" ON "matches"("user1Id", "user2Id");
