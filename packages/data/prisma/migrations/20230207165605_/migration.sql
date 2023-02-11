/*
  Warnings:

  - You are about to drop the column `year` on the `movies` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[tmdb_id]` on the table `movies` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `originalLanguage` to the `movies` table without a default value. This is not possible if the table is not empty.
  - Added the required column `releaseDate` to the `movies` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tmdb_id` to the `movies` table without a default value. This is not possible if the table is not empty.
  - Added the required column `trailer` to the `movies` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "movies" DROP COLUMN "year",
ADD COLUMN     "audienceRatingAverage" DOUBLE PRECISION,
ADD COLUMN     "audienceRatingVotes" INTEGER,
ADD COLUMN     "originalLanguage" TEXT NOT NULL,
ADD COLUMN     "releaseDate" TEXT NOT NULL,
ADD COLUMN     "tagline" TEXT,
ADD COLUMN     "tmdb_id" INTEGER NOT NULL,
ADD COLUMN     "trailer" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "Genre" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Genre_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "genre_movie" (
    "genreId" TEXT NOT NULL,
    "movieId" TEXT NOT NULL,

    CONSTRAINT "genre_movie_pkey" PRIMARY KEY ("genreId","movieId")
);

-- CreateIndex
CREATE UNIQUE INDEX "Genre_name_key" ON "Genre"("name");

-- CreateIndex
CREATE UNIQUE INDEX "movies_tmdb_id_key" ON "movies"("tmdb_id");

-- AddForeignKey
ALTER TABLE "genre_movie" ADD CONSTRAINT "genre_movie_genreId_fkey" FOREIGN KEY ("genreId") REFERENCES "Genre"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "genre_movie" ADD CONSTRAINT "genre_movie_movieId_fkey" FOREIGN KEY ("movieId") REFERENCES "movies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
