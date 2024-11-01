-- CreateTable
CREATE TABLE "Kategorije" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nazivId" TEXT NOT NULL,
    "parentId" TEXT,
    "drzavaId" TEXT,
    "isDead" BOOLEAN NOT NULL DEFAULT false,
    "opis" TEXT,
    "count" INTEGER NOT NULL DEFAULT 0
);
