/*
  Warnings:

  - You are about to drop the column `imdbId` on the `downloadables` table. All the data in the column will be lost.
  - Added the required column `mediaId` to the `downloadables` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "downloadables" DROP CONSTRAINT "downloadables_imdbId_fkey";

-- AlterTable
ALTER TABLE "downloadables" DROP COLUMN "imdbId",
ADD COLUMN     "mediaId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "downloadables" ADD CONSTRAINT "downloadables_mediaId_fkey" FOREIGN KEY ("mediaId") REFERENCES "media"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
