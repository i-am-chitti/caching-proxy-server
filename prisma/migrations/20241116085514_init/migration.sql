-- CreateTable
CREATE TABLE "Path" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "requestPath" TEXT NOT NULL,
    "contentType" TEXT NOT NULL,
    "filePath" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Path_requestPath_key" ON "Path"("requestPath");

-- CreateIndex
CREATE UNIQUE INDEX "Path_filePath_key" ON "Path"("filePath");
