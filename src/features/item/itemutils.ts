import { Item } from "@prisma/client";
import { z } from "zod";
import type { NextFunction, Request, Response } from "express";

export type AllowedFieldsKeys = keyof Item | "tags";
type AllowedFieldsValues = "string" | "number" | "string[]" | "NOT_ALLOWED";

export const allowedFields: Record<AllowedFieldsKeys, AllowedFieldsValues> = {
  id: "NOT_ALLOWED",
  cijena: "number",
  limit: "number",
  nazivId: "NOT_ALLOWED",
  kategorijaId: "NOT_ALLOWED",
  opis: "NOT_ALLOWED",
  groupId: "NOT_ALLOWED",
  tags: "string[]",
  vrijemeDodavanja: "number",
  tip: "string",
  countryId: "string",
  nominala: "number",
  godina: "number",
  mintage: "number",
  promjer: "number",
  masa: "number",
  visina: "number",
  sirina: "number",
  duljina: "number",
};

const allKeys = Object.keys(allowedFields);

const allowedKeys = Object.keys(allowedFields).filter(
  (key) => allowedFields[key as AllowedFieldsKeys] !== "NOT_ALLOWED"
);

const itemQuerySchema = z.object({
  max: z.string().default("4"), // TODO: handle negative numbers and add top limit
  offset: z.string().default("0"),
  sort: z.enum(["asc", "desc"]).default("desc"),
  sortBy: z.enum(allKeys as [string, ...string[]]).default("vrijemeDodavanja"),

  // Filter fields
  // search: z.string().optional(),
  ...Object.fromEntries(allowedKeys.map((key) => [key, z.string().optional()])),
});

export function handleQueryObject(query: Request["query"]) {
  console.log("Raw query params", query);

  // Step 1: Remove empty fields
  const cleanQuery = Object.fromEntries(
    Object.entries(query).filter(([key, value]) => value)
  );

  console.log("Clean query params", cleanQuery);

  // Step 2: Parse query object
  const parsedQuery = itemQuerySchema.parse(cleanQuery);

  console.log("Parsed query params", parsedQuery);

  // Step 3: Transform query fields to correct types
  // (if field is number, we should expect the following form to allow setting number ranges: field=1-10, field=1-, field=-10, field=1)

  const transformedQuery = {
    ...parsedQuery,

    max: isNaN(parseInt(parsedQuery.max)) ? 4 : parseInt(parsedQuery.max),
    offset: isNaN(parseInt(parsedQuery.offset)) ? 0 : parseInt(parsedQuery.offset),
    sort: parsedQuery.sort,
    sortBy: parsedQuery.sortBy,
  };
  // TODO: handle negative numbers
  console.log("Transformed query params", transformedQuery);

  return transformedQuery;
}

function countInString(str: string, char: string): number {
  let count = 0;
  for (let i = 0; i < str.length; i++) {
    if (str[i] === char) count++;
  }
  return count;
}

export function parseNumberRange(value: string) {
  // we should expect the following form to allow setting number ranges:
  // e.g. "1-10", "1-", "-10", "5"

  // export type IntFilter<$PrismaModel = never> = {
  //   equals?: number | IntFieldRefInput<$PrismaModel>
  //   in?: number[]
  //   notIn?: number[]
  //   lt?: number | IntFieldRefInput<$PrismaModel>
  //   lte?: number | IntFieldRefInput<$PrismaModel>
  //   gt?: number | IntFieldRefInput<$PrismaModel>
  //   gte?: number | IntFieldRefInput<$PrismaModel>
  //   not?: NestedIntFilter<$PrismaModel> | number
  // }

  const dashCount = countInString(value, "-");

  if (dashCount === 0) {
    const numberValue = parseFloat(value);
    return isNaN(numberValue) ? {} : { equals: numberValue };
  } else if (dashCount === 1) {
    let rangeQuery: Record<string, number> = {};

    const [min, max] = value.split("-").map((v) => parseFloat(v));

    if (!isNaN(min)) rangeQuery.gte = min;
    if (!isNaN(max)) rangeQuery.lte = max;

    return rangeQuery;
  } else {
    // invalid range, TODO: handle this case
    return {};
  }
}
