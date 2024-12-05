// import "csv"
import csv from "csv/sync";
import fs from "fs";
import z, { ZodError } from "zod";

// ID,Vrsta,SKU,Naziv,Objavljeno,Istaknuto?,"Vidljivost u katalogu","Kratak opis",Opis,"Datum početka sniženja","Datum kraja sniženja","Status poreza","Klasa poreza","Na zalihi?",Zalihe,"Nisko stanje zalihe","Narudžbe na upit dozvoljene?","Rasprodaja pojedinačno?","Težina (g)","Dužina (cm)","Širina (cm)","Visina (cm)","Dopusti recenzije kupaca?","Napomena uz kupovinu","Rasprodajna cijena","Normalna cijena",Kategorije,Oznake,"Klasa dostave",Slike,"Limit preuzimanja","Rok isteka preuzimanja",Glavni,"Grupirani proizvodi","Uvećana prodaja","Dodatna prodaja","Eksterni URL","Tekst dugmeta",Pozicija,"Atribut 1 ime","Atribut 1 vrijednosti","Atribut 1 vidljiv","Atribut 1 globalni"
// 68148,simple,261647,"OSIJEK PARK STARA RAZGLEDNICA",1,0,visible,,"Stanje razglednice kao na slici.",,,taxable,,1,1,,0,0,,,,,0,,,5.50,"RAZGLEDNICE > Hrvatska > Slavonija > Osijek",,,"https://kolekcionar.hr/wp-content/uploads/2023/03/osijek-park-stara-razglednica-20.jpg, https://kolekcionar.hr/wp-content/uploads/2023/03/osijek-park-stara-razglednica-20.jpg, https://kolekcionar.hr/wp-content/uploads/2023/03/osijek-park-stara-razglednica-21.jpg",,,,,,,,,0,"Kataloški broj",0,1,1

// TASK FOR COPILOT: Genearte typescript type based on the comment above (everything is a string because of loading from CSV)

// slike povuč

const OldItemStructureSchema = z.object({
  ID: z.string(),
  Vrsta: z.string(),
  SKU: z.string(),
  Naziv: z.string(),
  Objavljeno: z.string(), // pazi
  "Istaknuto?": z.string(),
  "Vidljivost u katalogu": z.string(),
  "Kratak opis": z.string(),
  Opis: z.string(),
  "Datum početka sniženja": z.string(),
  "Datum kraja sniženja": z.string(),
  "Status poreza": z.string(),
  "Klasa poreza": z.string(),
  "Na zalihi?": z.string(),
  Zalihe: z.string(),
  "Nisko stanje zalihe": z.string(),
  "Narudžbe na upit dozvoljene?": z.string(),
  "Rasprodaja pojedinačno?": z.string(),
  "Težina (g)": z.string(),
  "Dužina (cm)": z.string(),
  "Širina (cm)": z.string(),
  "Visina (cm)": z.string(),
  "Dopusti recenzije kupaca?": z.string(),
  "Napomena uz kupovinu": z.string(),
  "Rasprodajna cijena": z.string(),
  "Normalna cijena": z.string(),
  Kategorije: z.string(),
  Oznake: z.string(),
  "Klasa dostave": z.string(),
  Slike: z.string(),
  "Limit preuzimanja": z.string(),
  "Rok isteka preuzimanja": z.string(),
  Glavni: z.string(),
  "Grupirani proizvodi": z.string(),
  "Uvećana prodaja": z.string(),
  "Dodatna prodaja": z.string(),
  "Eksterni URL": z.string(),
  "Tekst dugmeta": z.string(),
  Pozicija: z.string(),
  "Atribut 1 ime": z.string(),
  "Atribut 1 vrijednosti": z.string(),
  "Atribut 1 vidljiv": z.string(),
  "Atribut 1 globalni": z.string(),
});

// Read file
const csvContent = fs.readFileSync(
  `${__dirname}/wc-product-export-28-11-2024-1732802530606.csv`,
  {
    encoding: "utf-8",
  }
);

const records = csv.parse(csvContent, {
  bom: true,
  columns: true,
});

type OldItemStructure = z.infer<typeof OldItemStructureSchema>;

let validRecords: OldItemStructure[] = [];

if (Array.isArray(records)) {
  let currentRecord: OldItemStructure;

  records.forEach((record) => {
    try {
      currentRecord = OldItemStructureSchema.parse(record);
      if (currentRecord["Objavljeno"] === "1") {
        validRecords.push(record);
      }
    } catch (error) {
      if (error instanceof ZodError) {
        console.log(error.errors);
      } else {
        console.log(error);
      }
    }
  });
} else {
  throw new Error("Records is not an array");
}

const MinimizedItemStructureSchema = OldItemStructureSchema.pick({
  ID: true,
  SKU: true,
  Naziv: true,
  Opis: true,
  Zalihe: true,
  "Normalna cijena": true,
  Kategorije: true,
  Slike: true,
}).extend({
  Zalihe: z.string().transform((val) => parseInt(val)),
  "Normalna cijena": z.string().transform((val) => parseFloat(val)),
  Slike: z.string().transform((val) => val.split(", ").map((url) => url.trim())),
});

const parsedRecords = validRecords.map((record) => {
  return MinimizedItemStructureSchema.parse(record);
});

// console.log(parsedRecords);

// Save the parsedRecords to a JSON file
fs.writeFileSync(
  `${__dirname}/parsedItems.json`,
  JSON.stringify(parsedRecords, null, 2),
  {
    encoding: "utf-8",
  }
);

// What is the command to run just this typescript file?
// npx ts-node src/features/import-data-from-csv/parsing-csv-jamba/parseItemsCsv.ts
