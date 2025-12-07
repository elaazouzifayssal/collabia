-- CreateTable
CREATE TABLE "current_books" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "totalPages" INTEGER,
    "pagesRead" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'reading',
    "startDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "current_books_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "current_skills" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "level" TEXT NOT NULL DEFAULT 'beginner',
    "notes" TEXT,
    "startDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "current_skills_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "current_games" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "rank" TEXT,
    "frequency" TEXT,
    "startDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "current_games_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "book_history" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "totalPages" INTEGER,
    "pagesRead" INTEGER,
    "status" TEXT NOT NULL,
    "rating" INTEGER,
    "startedAt" TIMESTAMP(3) NOT NULL,
    "finishedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "book_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "skill_history" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "levelReached" TEXT NOT NULL,
    "notes" TEXT,
    "startedAt" TIMESTAMP(3) NOT NULL,
    "completedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "skill_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "game_history" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "rank" TEXT,
    "playedFrom" TIMESTAMP(3) NOT NULL,
    "playedTo" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "game_history_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "current_books_userId_key" ON "current_books"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "current_skills_userId_key" ON "current_skills"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "current_games_userId_key" ON "current_games"("userId");

-- CreateIndex
CREATE INDEX "book_history_userId_idx" ON "book_history"("userId");

-- CreateIndex
CREATE INDEX "skill_history_userId_idx" ON "skill_history"("userId");

-- CreateIndex
CREATE INDEX "game_history_userId_idx" ON "game_history"("userId");

-- AddForeignKey
ALTER TABLE "current_books" ADD CONSTRAINT "current_books_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "current_skills" ADD CONSTRAINT "current_skills_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "current_games" ADD CONSTRAINT "current_games_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "book_history" ADD CONSTRAINT "book_history_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "skill_history" ADD CONSTRAINT "skill_history_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "game_history" ADD CONSTRAINT "game_history_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
