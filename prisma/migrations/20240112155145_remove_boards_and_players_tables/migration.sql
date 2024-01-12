/*
  Warnings:

  - You are about to drop the `boards` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `players` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "players" DROP CONSTRAINT "players_boardId_fkey";

-- DropForeignKey
ALTER TABLE "players" DROP CONSTRAINT "players_userId_fkey";

-- DropTable
DROP TABLE "boards";

-- DropTable
DROP TABLE "players";
