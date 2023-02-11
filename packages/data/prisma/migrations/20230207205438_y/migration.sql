/*
  Warnings:

  - You are about to drop the `Movie` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Series` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `releaseDate` to the `media` table without a default value. This is not possible if the table is not empty.
  - Added the required column `slug` to the `media` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "MediaType" AS ENUM ('SERIES', 'MOVIE');

-- AlterTable
ALTER TABLE "media" ADD COLUMN     "releaseDate" TEXT NOT NULL,
ADD COLUMN     "slug" TEXT NOT NULL;

-- DropTable
DROP TABLE "Movie";

-- DropTable
DROP TABLE "Series";
