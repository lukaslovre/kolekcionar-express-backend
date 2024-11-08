-- CreateTable
CREATE TABLE "Item" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "cijena" REAL NOT NULL,
    "limit" INTEGER NOT NULL DEFAULT 1,
    "nazivId" TEXT NOT NULL,
    "kategorijaId" TEXT NOT NULL,
    "opis" TEXT,
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
    "duljina" REAL
);

-- CreateTable
CREATE TABLE "Tag" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "naziv" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Image" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "url" TEXT NOT NULL,
    "itemId" INTEGER NOT NULL,
    CONSTRAINT "Image_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "Item" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "_ItemToTag" (
    "A" INTEGER NOT NULL,
    "B" TEXT NOT NULL,
    CONSTRAINT "_ItemToTag_A_fkey" FOREIGN KEY ("A") REFERENCES "Item" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_ItemToTag_B_fkey" FOREIGN KEY ("B") REFERENCES "Tag" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "_ItemToTag_AB_unique" ON "_ItemToTag"("A", "B");

-- CreateIndex
CREATE INDEX "_ItemToTag_B_index" ON "_ItemToTag"("B");
