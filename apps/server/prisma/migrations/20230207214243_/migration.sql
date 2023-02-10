/*
  Warnings:

  - Added the required column `referrer` to the `downloadables` table without a default value. This is not possible if the table is not empty.
  - Added the required column `title` to the `downloadables` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "downloadables" ADD COLUMN     "referrer" TEXT NOT NULL,
ADD COLUMN     "title" TEXT NOT NULL;
