/*
  Warnings:

  - Added the required column `type` to the `media` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "media_tmdb_id_key";

-- AlterTable
ALTER TABLE "media" ADD COLUMN     "type" "MediaType" NOT NULL;
