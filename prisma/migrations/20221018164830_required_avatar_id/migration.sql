/*
  Warnings:

  - Made the column `avatarId` on table `User` required. This step will fail if there are existing NULL values in that column.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'USER',
    "passwordResetToken" TEXT,
    "passwordResetTime" DATETIME,
    "theme" TEXT NOT NULL DEFAULT 'light',
    "avatarId" INTEGER NOT NULL
);
INSERT INTO "new_User" ("avatarId", "createdAt", "id", "name", "passwordResetTime", "passwordResetToken", "role", "theme", "updatedAt") SELECT "avatarId", "createdAt", "id", "name", "passwordResetTime", "passwordResetToken", "role", "theme", "updatedAt" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
