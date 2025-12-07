-- CreateTable
CREATE TABLE "interest_posts" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "interestValue" TEXT NOT NULL,
    "progressSnapshot" INTEGER,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "interest_posts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "interest_comments" (
    "id" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "interest_comments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "interest_likes" (
    "id" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "interest_likes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "interest_posts_type_interestValue_idx" ON "interest_posts"("type", "interestValue");

-- CreateIndex
CREATE INDEX "interest_posts_userId_idx" ON "interest_posts"("userId");

-- CreateIndex
CREATE INDEX "interest_comments_postId_idx" ON "interest_comments"("postId");

-- CreateIndex
CREATE INDEX "interest_comments_userId_idx" ON "interest_comments"("userId");

-- CreateIndex
CREATE INDEX "interest_likes_postId_idx" ON "interest_likes"("postId");

-- CreateIndex
CREATE UNIQUE INDEX "interest_likes_postId_userId_key" ON "interest_likes"("postId", "userId");

-- AddForeignKey
ALTER TABLE "interest_posts" ADD CONSTRAINT "interest_posts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "interest_comments" ADD CONSTRAINT "interest_comments_postId_fkey" FOREIGN KEY ("postId") REFERENCES "interest_posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "interest_comments" ADD CONSTRAINT "interest_comments_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "interest_likes" ADD CONSTRAINT "interest_likes_postId_fkey" FOREIGN KEY ("postId") REFERENCES "interest_posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "interest_likes" ADD CONSTRAINT "interest_likes_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
