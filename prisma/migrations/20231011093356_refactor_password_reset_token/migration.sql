/*
  Warnings:

  - You are about to drop the column `passwordResetTime` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `passwordResetToken` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Password" ADD COLUMN "passwordResetTime" DATETIME;
ALTER TABLE "Password" ADD COLUMN "passwordResetToken" TEXT;

-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "lastLogin" DATETIME,
    "role" TEXT NOT NULL DEFAULT 'USER',
    "theme" TEXT NOT NULL DEFAULT 'light',
    "avatarId" INTEGER NOT NULL
);
INSERT INTO "new_User" ("avatarId", "createdAt", "id", "lastLogin", "name", "role", "theme", "updatedAt") SELECT "avatarId", "createdAt", "id", "lastLogin", "name", "role", "theme", "updatedAt" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
