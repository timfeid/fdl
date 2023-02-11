/*
  Warnings:

  - You are about to drop the `Downloadable` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `DownloadableLink` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[imdb_id,type]` on the table `media` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "Downloadable" DROP CONSTRAINT "Downloadable_imdbId_fkey";

-- DropForeignKey
ALTER TABLE "DownloadableLink" DROP CONSTRAINT "DownloadableLink_downloadableId_fkey";

-- DropTable
DROP TABLE "Downloadable";

-- DropTable
DROP TABLE "DownloadableLink";

-- CreateTable
CREATE TABLE "downloadables" (
    "id" TEXT NOT NULL,
    "imdbId" TEXT NOT NULL,
    "type" "MediaType" NOT NULL,
    "season" INTEGER,
    "episode" INTEGER,

    CONSTRAINT "downloadables_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "downloadable_links" (
    "id" TEXT NOT NULL,
    "downloadableId" TEXT NOT NULL,

    CONSTRAINT "downloadable_links_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "media_imdb_id_type_key" ON "media"("imdb_id", "type");

-- AddForeignKey
ALTER TABLE "downloadables" ADD CONSTRAINT "downloadables_imdbId_fkey" FOREIGN KEY ("imdbId") REFERENCES "media"("imdb_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "downloadable_links" ADD CONSTRAINT "downloadable_links_downloadableId_fkey" FOREIGN KEY ("downloadableId") REFERENCES "downloadables"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
