-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Email" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "email" TEXT NOT NULL,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "verificationToken" TEXT,
    "verificationRequestTime" DATETIME
);
INSERT INTO "new_Email" ("email", "id") SELECT "email", "id" FROM "Email";
DROP TABLE "Email";
ALTER TABLE "new_Email" RENAME TO "Email";
CREATE UNIQUE INDEX "Email_email_key" ON "Email"("email");
CREATE UNIQUE INDEX "Email_verificationToken_key" ON "Email"("verificationToken");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
