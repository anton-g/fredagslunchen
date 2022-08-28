-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Email" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "email" TEXT NOT NULL,
    "userId" TEXT,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "verificationToken" TEXT,
    "verificationRequestTime" DATETIME,
    CONSTRAINT "Email_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Email" ("email", "id", "verificationRequestTime", "verificationToken", "verified") SELECT "email", "id", "verificationRequestTime", "verificationToken", "verified" FROM "Email";
UPDATE "new_Email" SET "userId" = "User"."id" from "User" where "User"."emailId" = "new_Email"."id";
DROP TABLE "Email";
ALTER TABLE "new_Email" RENAME TO "Email";
CREATE UNIQUE INDEX "Email_email_key" ON "Email"("email");
CREATE UNIQUE INDEX "Email_userId_key" ON "Email"("userId");
CREATE UNIQUE INDEX "Email_verificationToken_key" ON "Email"("verificationToken");
CREATE TABLE "new_User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'USER',
    "passwordResetToken" TEXT,
    "passwordResetTime" DATETIME
);
INSERT INTO "new_User" ("createdAt", "id", "name", "passwordResetTime", "passwordResetToken", "role", "updatedAt") SELECT "createdAt", "id", "name", "passwordResetTime", "passwordResetToken", "role", "updatedAt" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
