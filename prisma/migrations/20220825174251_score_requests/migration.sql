-- CreateTable
CREATE TABLE "ScoreRequest" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "lunchId" INTEGER NOT NULL,
    "userId" TEXT NOT NULL,
    "requestedByUserId" TEXT NOT NULL,
    CONSTRAINT "ScoreRequest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ScoreRequest_requestedByUserId_fkey" FOREIGN KEY ("requestedByUserId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ScoreRequest_lunchId_fkey" FOREIGN KEY ("lunchId") REFERENCES "Lunch" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "ScoreRequest_lunchId_userId_key" ON "ScoreRequest"("lunchId", "userId");
