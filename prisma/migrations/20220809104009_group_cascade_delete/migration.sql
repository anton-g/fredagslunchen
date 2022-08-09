-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Lunch" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "date" DATETIME NOT NULL,
    "groupLocationLocationId" INTEGER NOT NULL,
    "groupLocationGroupId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    CONSTRAINT "Lunch_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Lunch_groupLocationLocationId_groupLocationGroupId_fkey" FOREIGN KEY ("groupLocationLocationId", "groupLocationGroupId") REFERENCES "GroupLocation" ("locationId", "groupId") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Lunch" ("date", "groupLocationGroupId", "groupLocationLocationId", "id", "userId") SELECT "date", "groupLocationGroupId", "groupLocationLocationId", "id", "userId" FROM "Lunch";
DROP TABLE "Lunch";
ALTER TABLE "new_Lunch" RENAME TO "Lunch";
CREATE TABLE "new_GroupMember" (
    "userId" TEXT NOT NULL,
    "groupId" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'MEMBER',
    "joinedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY ("userId", "groupId"),
    CONSTRAINT "GroupMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "GroupMember_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "Group" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_GroupMember" ("groupId", "joinedAt", "role", "userId") SELECT "groupId", "joinedAt", "role", "userId" FROM "GroupMember";
DROP TABLE "GroupMember";
ALTER TABLE "new_GroupMember" RENAME TO "GroupMember";
CREATE TABLE "new_Score" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "score" REAL NOT NULL,
    "userId" TEXT NOT NULL,
    "lunchId" INTEGER NOT NULL,
    "comment" TEXT,
    CONSTRAINT "Score_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Score_lunchId_fkey" FOREIGN KEY ("lunchId") REFERENCES "Lunch" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Score" ("comment", "id", "lunchId", "score", "userId") SELECT "comment", "id", "lunchId", "score", "userId" FROM "Score";
DROP TABLE "Score";
ALTER TABLE "new_Score" RENAME TO "Score";
CREATE TABLE "new_GroupLocation" (
    "groupId" TEXT NOT NULL,
    "locationId" INTEGER NOT NULL,
    "discoveredById" TEXT NOT NULL,

    PRIMARY KEY ("locationId", "groupId"),
    CONSTRAINT "GroupLocation_discoveredById_fkey" FOREIGN KEY ("discoveredById") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "GroupLocation_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "Group" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "GroupLocation_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "Location" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_GroupLocation" ("discoveredById", "groupId", "locationId") SELECT "discoveredById", "groupId", "locationId" FROM "GroupLocation";
DROP TABLE "GroupLocation";
ALTER TABLE "new_GroupLocation" RENAME TO "GroupLocation";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
