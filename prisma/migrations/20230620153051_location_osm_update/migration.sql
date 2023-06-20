/*
  Warnings:

  - A unique constraint covering the columns `[osmId]` on the table `Location` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Location" ADD COLUMN "countryCode" TEXT;
ALTER TABLE "Location" ADD COLUMN "osmId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Location_osmId_key" ON "Location"("osmId");
