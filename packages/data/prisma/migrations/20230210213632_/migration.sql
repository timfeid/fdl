/*
  Warnings:

  - A unique constraint covering the columns `[referrer]` on the table `downloadables` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "downloadables_referrer_key" ON "downloadables"("referrer");
