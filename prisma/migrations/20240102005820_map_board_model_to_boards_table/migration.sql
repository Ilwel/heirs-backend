/*
  Warnings:

  - You are about to drop the `Board` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "players" DROP CONSTRAINT "players_boardId_fkey";

-- DropTable
DROP TABLE "Board";

-- CreateTable
CREATE TABLE "boards" (
    "id" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "boards_id_key" ON "boards"("id");

-- AddForeignKey
ALTER TABLE "players" ADD CONSTRAINT "players_boardId_fkey" FOREIGN KEY ("boardId") REFERENCES "boards"("id") ON DELETE SET NULL ON UPDATE CASCADE;
