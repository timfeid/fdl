/*
  Warnings:

  - A unique constraint covering the columns `[slug,type]` on the table `media` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `guid` to the `downloadables` table without a default value. This is not possible if the table is not empty.
  - Made the column `imdb_id` on table `media` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "downloadables" ADD COLUMN     "guid" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "media" ALTER COLUMN "imdb_id" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "media_slug_type_key" ON "media"("slug", "type");
