-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Group" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "public" BOOLEAN NOT NULL DEFAULT false,
    "hideRecommendations" BOOLEAN NOT NULL DEFAULT false,
    "inviteToken" TEXT,
    "lon" REAL,
    "lat" REAL
);
INSERT INTO "new_Group" ("createdAt", "id", "inviteToken", "lat", "lon", "name", "public", "updatedAt") SELECT "createdAt", "id", "inviteToken", "lat", "lon", "name", "public", "updatedAt" FROM "Group";
DROP TABLE "Group";
ALTER TABLE "new_Group" RENAME TO "Group";
CREATE UNIQUE INDEX "Group_inviteToken_key" ON "Group"("inviteToken");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
