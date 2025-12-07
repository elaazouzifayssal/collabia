-- AlterTable
ALTER TABLE "posts" ADD COLUMN     "interestType" TEXT,
ADD COLUMN     "interestValue" TEXT,
ADD COLUMN     "progressSnapshot" INTEGER;

-- CreateIndex
CREATE INDEX "posts_interestType_interestValue_idx" ON "posts"("interestType", "interestValue");
