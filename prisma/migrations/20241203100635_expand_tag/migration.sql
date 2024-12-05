/*
  Warnings:

  - You are about to drop the column `kralj` on the `Item` table. All the data in the column will be lost.
  - You are about to drop the column `kvaliteta` on the `Item` table. All the data in the column will be lost.
  - You are about to drop the column `materijal` on the `Item` table. All the data in the column will be lost.
  - You are about to drop the column `naselje` on the `Item` table. All the data in the column will be lost.
  - You are about to drop the column `pick` on the `Item` table. All the data in the column will be lost.
  - You are about to drop the column `serija` on the `Item` table. All the data in the column will be lost.
  - You are about to drop the column `valuta` on the `Item` table. All the data in the column will be lost.
  - You are about to drop the column `vrstaKamena` on the `Item` table. All the data in the column will be lost.
  - Added the required column `group` to the `Tag` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Item" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "cijena" REAL NOT NULL,
    "limit" INTEGER NOT NULL DEFAULT 1,
    "nazivId" TEXT NOT NULL,
    "kategorijaId" TEXT NOT NULL,
    "opis" TEXT,
    "groupId" TEXT,
    "vrijemeDodavanja" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "tip" TEXT NOT NULL DEFAULT 'ostalo',
    "countryId" TEXT,
    "nominala" REAL,
    "godina" INTEGER,
    "mintage" INTEGER,
    "promjer" REAL,
    "masa" REAL,
    "visina" REAL,
    "sirina" REAL,
    "duljina" REAL,
    CONSTRAINT "Item_kategorijaId_fkey" FOREIGN KEY ("kategorijaId") REFERENCES "Kategorije" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Item_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "Group" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Item_countryId_fkey" FOREIGN KEY ("countryId") REFERENCES "Country" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Item" ("cijena", "countryId", "duljina", "godina", "groupId", "id", "kategorijaId", "limit", "masa", "mintage", "nazivId", "nominala", "opis", "promjer", "sirina", "tip", "visina", "vrijemeDodavanja") SELECT "cijena", "countryId", "duljina", "godina", "groupId", "id", "kategorijaId", "limit", "masa", "mintage", "nazivId", "nominala", "opis", "promjer", "sirina", "tip", "visina", "vrijemeDodavanja" FROM "Item";
DROP TABLE "Item";
ALTER TABLE "new_Item" RENAME TO "Item";
CREATE INDEX "kategorijaId" ON "Item"("kategorijaId");
CREATE TABLE "new_Tag" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "naziv" TEXT NOT NULL,
    "group" TEXT NOT NULL,
    "displayOnCard" BOOLEAN NOT NULL DEFAULT true,
    "displayOnDetails" BOOLEAN NOT NULL DEFAULT true,
    "description" TEXT
);
INSERT INTO "new_Tag" ("id", "naziv") SELECT "id", "naziv" FROM "Tag";
DROP TABLE "Tag";
ALTER TABLE "new_Tag" RENAME TO "Tag";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
