/*
  Warnings:

  - A unique constraint covering the columns `[tmdb_id]` on the table `media` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "media" ALTER COLUMN "imdb_id" DROP NOT NULL,
ALTER COLUMN "tmdb_id" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "media_tmdb_id_key" ON "media"("tmdb_id");
