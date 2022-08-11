/*
  Warnings:

  - Added the required column `city` to the `Location` table without a default value. This is not possible if the table is not empty.
  - Added the required column `zipCode` to the `Location` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Location" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "lon" TEXT NOT NULL,
    "lat" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "zipCode" TEXT NOT NULL
);
INSERT INTO "new_Location" ("address", "id", "lat", "lon", "name") SELECT "address", "id", "lat", "lon", "name" FROM "Location";
DROP TABLE "Location";
ALTER TABLE "new_Location" RENAME TO "Location";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
