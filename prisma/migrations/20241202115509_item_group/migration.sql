-- CreateTable
CREATE TABLE "Group" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "purpose" TEXT
);

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
    "nominala" REAL,
    "valuta" TEXT,
    "godina" INTEGER,
    "kralj" TEXT,
    "mintage" INTEGER,
    "materijal" TEXT,
    "promjer" REAL,
    "masa" REAL,
    "kvaliteta" TEXT,
    "pick" TEXT,
    "serija" TEXT,
    "naselje" TEXT,
    "vrstaKamena" TEXT,
    "visina" REAL,
    "sirina" REAL,
    "duljina" REAL,
    CONSTRAINT "Item_kategorijaId_fkey" FOREIGN KEY ("kategorijaId") REFERENCES "Kategorije" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Item_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "Group" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Item" ("cijena", "duljina", "godina", "id", "kategorijaId", "kralj", "kvaliteta", "limit", "masa", "materijal", "mintage", "naselje", "nazivId", "nominala", "opis", "pick", "promjer", "serija", "sirina", "tip", "valuta", "visina", "vrijemeDodavanja", "vrstaKamena") SELECT "cijena", "duljina", "godina", "id", "kategorijaId", "kralj", "kvaliteta", "limit", "masa", "materijal", "mintage", "naselje", "nazivId", "nominala", "opis", "pick", "promjer", "serija", "sirina", "tip", "valuta", "visina", "vrijemeDodavanja", "vrstaKamena" FROM "Item";
DROP TABLE "Item";
ALTER TABLE "new_Item" RENAME TO "Item";
CREATE INDEX "kategorijaId" ON "Item"("kategorijaId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
