/*
  Warnings:

  - Added the required column `headers` to the `Path` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Path" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "requestPath" TEXT NOT NULL,
    "contentType" TEXT NOT NULL,
    "filePath" TEXT NOT NULL,
    "headers" TEXT NOT NULL
);
INSERT INTO "new_Path" ("contentType", "filePath", "id", "requestPath") SELECT "contentType", "filePath", "id", "requestPath" FROM "Path";
DROP TABLE "Path";
ALTER TABLE "new_Path" RENAME TO "Path";
CREATE UNIQUE INDEX "Path_requestPath_key" ON "Path"("requestPath");
CREATE UNIQUE INDEX "Path_filePath_key" ON "Path"("filePath");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
