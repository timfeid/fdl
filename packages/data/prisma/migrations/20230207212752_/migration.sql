/*
  Warnings:

  - A unique constraint covering the columns `[tmdb_id,type]` on the table `media` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "media_imdb_id_type_key";

-- CreateIndex
CREATE UNIQUE INDEX "media_tmdb_id_type_key" ON "media"("tmdb_id", "type");
