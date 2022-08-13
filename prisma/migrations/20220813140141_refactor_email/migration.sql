/*
  Warnings:

  - You are about to drop the column `email` on the `User` table. All the data in the column will be lost.

*/
-- CreateTable
CREATE TABLE "Email" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "email" TEXT NOT NULL
);

-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "emailId" INTEGER,
    "name" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'USER',
    CONSTRAINT "User_emailId_fkey" FOREIGN KEY ("emailId") REFERENCES "Email" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

INSERT INTO "Email" ("email") SELECT "email" FROM "User";
INSERT INTO "new_User" ("createdAt", "id", "name", "role", "updatedAt") SELECT "createdAt", "id", "name", "role", "updatedAt" FROM "User";

CREATE TABLE "temp_User_Email" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "emailId" INTEGER,
  "email" TEXT
);

INSERT INTO "temp_User_Email" ("id", "email") SELECT "id", "email" FROM "User";

UPDATE "temp_User_Email"
SET "emailId" = "Temp"."id"
FROM ("temp_User_Email" INNER JOIN "Email" ON "temp_User_Email"."email" = "Email"."email") as "Temp";

UPDATE "new_User"
SET "emailId" = "Temp"."emailId" 
FROM ("new_User" INNER JOIN "temp_User_Email" on "new_User"."id" = "temp_User_Email"."id") as "Temp";

DROP TABLE "User";
DROP TABLE "temp_User_Email";
ALTER TABLE "new_User" RENAME TO "User";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;

-- CreateIndex
CREATE UNIQUE INDEX "Email_email_key" ON "Email"("email");
