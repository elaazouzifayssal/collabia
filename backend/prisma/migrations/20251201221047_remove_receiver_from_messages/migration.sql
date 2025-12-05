/*
  Warnings:

  - You are about to drop the column `isRead` on the `messages` table. All the data in the column will be lost.
  - You are about to drop the column `receiverId` on the `messages` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "messages" DROP CONSTRAINT "messages_receiverId_fkey";

-- AlterTable
ALTER TABLE "messages" DROP COLUMN "isRead",
DROP COLUMN "receiverId";
