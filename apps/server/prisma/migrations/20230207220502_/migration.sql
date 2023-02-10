/*
  Warnings:

  - You are about to drop the column `downloadableId` on the `downloadable_urls` table. All the data in the column will be lost.
  - You are about to drop the column `mediaId` on the `downloadables` table. All the data in the column will be lost.
  - The primary key for the `genre_movie` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `genreId` on the `genre_movie` table. All the data in the column will be lost.
  - You are about to drop the column `mediaId` on the `genre_movie` table. All the data in the column will be lost.
  - You are about to drop the column `audienceRatingAverage` on the `media` table. All the data in the column will be lost.
  - You are about to drop the column `audienceRatingVotes` on the `media` table. All the data in the column will be lost.
  - You are about to drop the column `originalLanguage` on the `media` table. All the data in the column will be lost.
  - Added the required column `downloadable_id` to the `downloadable_urls` table without a default value. This is not possible if the table is not empty.
  - Added the required column `media_id` to the `downloadables` table without a default value. This is not possible if the table is not empty.
  - Added the required column `genre_id` to the `genre_movie` table without a default value. This is not possible if the table is not empty.
  - Added the required column `media_id` to the `genre_movie` table without a default value. This is not possible if the table is not empty.
  - Added the required column `original_language` to the `media` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "downloadable_urls" DROP CONSTRAINT "downloadable_urls_downloadableId_fkey";

-- DropForeignKey
ALTER TABLE "downloadables" DROP CONSTRAINT "downloadables_mediaId_fkey";

-- DropForeignKey
ALTER TABLE "genre_movie" DROP CONSTRAINT "genre_movie_genreId_fkey";

-- DropForeignKey
ALTER TABLE "genre_movie" DROP CONSTRAINT "genre_movie_mediaId_fkey";

-- AlterTable
ALTER TABLE "downloadable_urls" DROP COLUMN "downloadableId",
ADD COLUMN     "downloadable_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "downloadables" DROP COLUMN "mediaId",
ADD COLUMN     "media_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "genre_movie" DROP CONSTRAINT "genre_movie_pkey",
DROP COLUMN "genreId",
DROP COLUMN "mediaId",
ADD COLUMN     "genre_id" TEXT NOT NULL,
ADD COLUMN     "media_id" TEXT NOT NULL,
ADD CONSTRAINT "genre_movie_pkey" PRIMARY KEY ("genre_id", "media_id");

-- AlterTable
ALTER TABLE "media" DROP COLUMN "audienceRatingAverage",
DROP COLUMN "audienceRatingVotes",
DROP COLUMN "originalLanguage",
ADD COLUMN     "audience_rating_average" DOUBLE PRECISION,
ADD COLUMN     "audience_rating_votes" INTEGER,
ADD COLUMN     "original_language" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "downloadables" ADD CONSTRAINT "downloadables_media_id_fkey" FOREIGN KEY ("media_id") REFERENCES "media"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "downloadable_urls" ADD CONSTRAINT "downloadable_urls_downloadable_id_fkey" FOREIGN KEY ("downloadable_id") REFERENCES "downloadables"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "genre_movie" ADD CONSTRAINT "genre_movie_genre_id_fkey" FOREIGN KEY ("genre_id") REFERENCES "genres"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "genre_movie" ADD CONSTRAINT "genre_movie_media_id_fkey" FOREIGN KEY ("media_id") REFERENCES "media"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
