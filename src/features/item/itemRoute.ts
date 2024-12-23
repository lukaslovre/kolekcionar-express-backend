import express, { NextFunction, Request, Response } from "express";
import { prisma } from "../../database/prismaClient";
import { z } from "zod";
import { validateBody } from "../../middleware/validateMiddleware";
import { itemSchemaCreate } from "./itemValidator";
import { getAllCategoryDescendants } from "../kategorije/utils/sqlCategoryTreeUtils";
import { Item } from "@prisma/client";

const router = express.Router();

// plan for /item route
// GET:
// - / - get all items
// - /:id - get item by id
// POST:
// - / - create new item
// PUT:
// - /:id - update item by id
// DELETE:
// - /:id - delete item by id

router.get("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const items = await prisma.item.findMany({
      include: { tags: true, images: true },
    });
    res.json({
      message: "All items",
      data: items,
    });
  } catch (error) {
    next(error);
  }
});

router.get("/:id", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    if (!id) throw new Error("Id is required parameter");

    // Parse id to number and see that its not NaN
    if (isNaN(Number(id))) throw new Error("Id must be a number");

    const item = await prisma.item.findUnique({
      where: {
        id: Number(id),
      },
      include: {
        images: true,
        tags: true,
      },
    });

    res.json({
      message: "Item by id",
      data: item,
    });
  } catch (error) {
    next(error);
  }
});

// What query parameters should be available for this route? It should support pagination (max, offset), filtering (by all fields), sorting (by all fields)
// GET: /underCategory/:categoryId?max=10&offset=0&sort=desc&sortBy=vrijemeDodavanja&search=nekiTekst&

// rough:
// - take in query
// - remove all empty and non-whitelisted fields
// - transform query fields to correct types

type AllowedFieldsKeys = keyof Item | "tags";
type AllowedFieldsValues = "string" | "number" | "string[]" | "NOT_ALLOWED";

const allowedFields: Record<AllowedFieldsKeys, AllowedFieldsValues> = {
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
  max: z.string().default("2"), // TODO: handle negative numbers and add top limit
  offset: z.string().default("0"),
  sort: z.enum(["asc", "desc"]).default("desc"),
  sortBy: z.enum(allKeys as [string, ...string[]]).default("vrijemeDodavanja"),

  // Filter fields
  // search: z.string().optional(),
  ...Object.fromEntries(allowedKeys.map((key) => [key, z.string().optional()])),
});

function handleQueryObject(query: Request["query"]) {
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

    max: isNaN(parseInt(parsedQuery.max)) ? 2 : parseInt(parsedQuery.max),
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

function parseNumberRange(value: string) {
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

router.get(
  "/underCategory/:categoryId",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Validate path param
      const categoryId = z.string().uuid().parse(req.params.categoryId);

      const allCategoriesUnderSelected = await getAllCategoryDescendants(categoryId);
      const categoryIds = [categoryId, ...allCategoriesUnderSelected.map((c) => c.id)];

      const { max, offset, sort, sortBy, ...filterFields } = handleQueryObject(req.query); // query object validation, transformation and cleaning

      const items = await prisma.item.findMany({
        where: {
          kategorijaId: { in: categoryIds },
          AND: Object.entries(filterFields).map(([key, value]) => {
            if (allowedFields[key as AllowedFieldsKeys] === "number") {
              return {
                [key]: parseNumberRange(value as string),
              };
            } else {
              return {
                [key]: {
                  equals: value,
                },
              };
            }
          }),
        },
        // include: {
        //   tags: true,
        //   images: true,
        // },
        orderBy: [
          {
            [sortBy]: sort,
          },
          {
            vrijemeDodavanja: "desc",
          },
        ],
        take: max,
        skip: offset,
      });

      res.json({
        message: "Items under category",
        data: items,
      });
    } catch (error) {
      next(error);
    }
  }
);

router.post(
  "/",
  validateBody(itemSchemaCreate),
  async (req: Request, res: Response, next: NextFunction) => {
    const formData = req.body as z.infer<typeof itemSchemaCreate>;

    try {
      // Build base data object without relations
      const createData: any = {
        ...formData,
      };

      delete createData.tags;
      delete createData.images;

      if (formData.tags && formData.tags.length > 0) {
        createData.tags = {
          connect: formData.tags.map((tag) => ({ id: tag })),
        };
      }

      if (formData.images && formData.images.length > 0) {
        createData.images = {
          create: formData.images.map((image) => ({ url: image })),
        };
      }

      const newItem = await prisma.item.create({
        data: createData,
        include: { tags: true, images: true },
      });

      res.status(201).json({ message: "Item created", data: newItem });
    } catch (err) {
      next(err);
    }
  }
);

export default router;
