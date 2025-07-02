/*
  Warnings:

  - You are about to drop the column `fileName` on the `Resume` table. All the data in the column will be lost.
  - You are about to drop the column `fileType` on the `Resume` table. All the data in the column will be lost.
  - Added the required column `fileSize` to the `Resume` table without a default value. This is not possible if the table is not empty.
  - Added the required column `mimeType` to the `Resume` table without a default value. This is not possible if the table is not empty.
  - Added the required column `originalName` to the `Resume` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Resume" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "originalName" TEXT NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "mimeType" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'uploaded',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Resume_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Resume" ("createdAt", "fileUrl", "id", "status", "updatedAt", "userId") SELECT "createdAt", "fileUrl", "id", "status", "updatedAt", "userId" FROM "Resume";
DROP TABLE "Resume";
ALTER TABLE "new_Resume" RENAME TO "Resume";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
