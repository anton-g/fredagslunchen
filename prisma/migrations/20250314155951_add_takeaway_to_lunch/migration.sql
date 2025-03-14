-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Lunch" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "date" DATETIME NOT NULL,
    "isTakeaway" BOOLEAN NOT NULL DEFAULT false,
    "groupLocationLocationId" INTEGER NOT NULL,
    "groupLocationGroupId" TEXT NOT NULL,
    "userId" TEXT,
    CONSTRAINT "Lunch_groupLocationLocationId_groupLocationGroupId_fkey" FOREIGN KEY ("groupLocationLocationId", "groupLocationGroupId") REFERENCES "GroupLocation" ("locationId", "groupId") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Lunch_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Lunch" ("date", "groupLocationGroupId", "groupLocationLocationId", "id", "userId") SELECT "date", "groupLocationGroupId", "groupLocationLocationId", "id", "userId" FROM "Lunch";
DROP TABLE "Lunch";
ALTER TABLE "new_Lunch" RENAME TO "Lunch";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
