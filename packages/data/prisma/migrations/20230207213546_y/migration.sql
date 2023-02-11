/*
  Warnings:

  - You are about to drop the `downloadable_links` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "downloadable_links" DROP CONSTRAINT "downloadable_links_downloadableId_fkey";

-- DropTable
DROP TABLE "downloadable_links";

-- CreateTable
CREATE TABLE "downloadable_urls" (
    "id" TEXT NOT NULL,
    "downloadableId" TEXT NOT NULL,
    "url" TEXT NOT NULL,

    CONSTRAINT "downloadable_urls_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "downloadable_urls" ADD CONSTRAINT "downloadable_urls_downloadableId_fkey" FOREIGN KEY ("downloadableId") REFERENCES "downloadables"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
