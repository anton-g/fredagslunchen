-- AlterTable
ALTER TABLE "User" ADD COLUMN "passwordResetTime" DATETIME;
ALTER TABLE "User" ADD COLUMN "passwordResetToken" TEXT;
