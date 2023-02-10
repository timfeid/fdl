/*
  Warnings:

  - The primary key for the `genre_movie` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `movieId` on the `genre_movie` table. All the data in the column will be lost.
  - You are about to drop the `movies` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `mediaId` to the `genre_movie` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "genre_movie" DROP CONSTRAINT "genre_movie_movieId_fkey";

-- AlterTable
ALTER TABLE "genre_movie" DROP CONSTRAINT "genre_movie_pkey",
DROP COLUMN "movieId",
ADD COLUMN     "mediaId" TEXT NOT NULL,
ADD CONSTRAINT "genre_movie_pkey" PRIMARY KEY ("genreId", "mediaId");

-- DropTable
DROP TABLE "movies";

-- CreateTable
CREATE TABLE "Downloadable" (
    "id" TEXT NOT NULL,
    "imdbId" TEXT NOT NULL,
    "season" INTEGER,
    "episode" INTEGER,

    CONSTRAINT "Downloadable_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DownloadableLink" (
    "id" TEXT NOT NULL,
    "downloadableId" TEXT NOT NULL,

    CONSTRAINT "DownloadableLink_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Series" (
    "id" TEXT NOT NULL,
    "mediaId" TEXT NOT NULL,
    "airDate" TEXT NOT NULL,
    "slug" TEXT NOT NULL,

    CONSTRAINT "Series_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Movie" (
    "id" TEXT NOT NULL,
    "mediaId" TEXT NOT NULL,
    "releaseDate" TEXT NOT NULL,
    "slug" TEXT NOT NULL,

    CONSTRAINT "Movie_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "media" (
    "id" TEXT NOT NULL,
    "imdb_id" TEXT NOT NULL,
    "tmdb_id" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "originalLanguage" TEXT NOT NULL,
    "trailer" TEXT NOT NULL,
    "poster" TEXT NOT NULL,
    "tagline" TEXT,
    "backdrop" TEXT,
    "blurb" TEXT,
    "audienceRatingVotes" INTEGER,
    "audienceRatingAverage" DOUBLE PRECISION,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "media_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "media_imdb_id_key" ON "media"("imdb_id");

-- CreateIndex
CREATE UNIQUE INDEX "media_tmdb_id_key" ON "media"("tmdb_id");

-- AddForeignKey
ALTER TABLE "Downloadable" ADD CONSTRAINT "Downloadable_imdbId_fkey" FOREIGN KEY ("imdbId") REFERENCES "media"("imdb_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DownloadableLink" ADD CONSTRAINT "DownloadableLink_downloadableId_fkey" FOREIGN KEY ("downloadableId") REFERENCES "Downloadable"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "genre_movie" ADD CONSTRAINT "genre_movie_mediaId_fkey" FOREIGN KEY ("mediaId") REFERENCES "media"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
