/*
  Warnings:

  - A unique constraint covering the columns `[guid]` on the table `downloadables` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "downloadables_referrer_key";

-- CreateIndex
CREATE UNIQUE INDEX "downloadables_guid_key" ON "downloadables"("guid");
