-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Score" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "score" REAL NOT NULL,
    "userId" TEXT NOT NULL,
    "lunchId" INTEGER NOT NULL,
    "comment" TEXT,
    CONSTRAINT "Score_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Score_lunchId_fkey" FOREIGN KEY ("lunchId") REFERENCES "Lunch" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Score" ("comment", "id", "lunchId", "score", "userId") SELECT "comment", "id", "lunchId", "score", "userId" FROM "Score";
DROP TABLE "Score";
ALTER TABLE "new_Score" RENAME TO "Score";
CREATE UNIQUE INDEX "Score_userId_lunchId_key" ON "Score"("userId", "lunchId");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
