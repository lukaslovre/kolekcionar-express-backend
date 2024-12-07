import fs from "fs";
import path from "path";
import csv from "csv/sync";
import { prisma } from "../../database/prismaClient";

// 2. Load data from `./data/data.csv`
const countriesDataPath = path.resolve(__dirname, "data/data.csv");
const countriesDataCsvContent = fs.readFileSync(countriesDataPath, {
  encoding: "utf-8",
});

type CountryData = {
  Name: string;
  Code: string;
};

const countriesData: CountryData[] = csv.parse(countriesDataCsvContent, {
  bom: true,
  columns: true,
});

// Manually add missing countries
// (these are countries that are not in the `data.csv` file but are in the `flags` folder)
const manuallyAddedCountries: CountryData[] = [
  { Name: "Kosovo", Code: "xk" },
  {
    Name: "England",
    Code: "gb-eng",
  },
  {
    Name: "Northern Ireland",
    Code: "gb-nir",
  },
  {
    Name: "Scotland",
    Code: "gb-sct",
  },
  {
    Name: "Wales",
    Code: "gb-wls",
  },
];

countriesData.push(...manuallyAddedCountries);

// console.log(countriesData);

// 3. Read the files in the `data/flags` folder and create a list of countries (from the filenames)
const flagsFolderPath = path.resolve(__dirname, "data/flags");
const flagsFiles = fs.readdirSync(flagsFolderPath);
const flagsCountries = flagsFiles.map((flagFile) => flagFile.split(".")[0]);

// console.log(flagsCountries);

// 4. Map the countries to the data from `data.csv` to get full country name
const mappedData: CountryData[] = flagsCountries.map((flagCountry) => {
  const countryData = countriesData.find(
    (country) => country.Code.toLowerCase() === flagCountry
  );

  return {
    Name: countryData?.Name || "",
    Code: flagCountry,
  };
});

const successfullyMappedData = mappedData.filter((country) => country.Name !== "");
const failedMappedData = mappedData.filter((country) => country.Name === "");

console.log("Successfully mapped data:");
console.log(successfullyMappedData);

console.log("Failed to map data:");
console.log(failedMappedData);

// Write to DB

// (async () => {
//   const response = await prisma.country.createMany({
//     data: successfullyMappedData.map((country) => ({
//       name: country.Name,
//       code: country.Code,
//     })),
//   });

//   console.log(response);
// })();
