-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Location" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "lon" TEXT,
    "lat" TEXT,
    "address" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "zipCode" TEXT NOT NULL,
    "global" BOOLEAN NOT NULL DEFAULT false
);
INSERT INTO "new_Location" ("address", "city", "global", "id", "lat", "lon", "name", "zipCode") SELECT "address", "city", "global", "id", "lat", "lon", "name", "zipCode" FROM "Location";
DROP TABLE "Location";
ALTER TABLE "new_Location" RENAME TO "Location";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
