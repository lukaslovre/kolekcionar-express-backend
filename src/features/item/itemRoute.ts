import express, { NextFunction, Request, Response } from "express";
import { prisma } from "../../database/prismaClient";
import { z } from "zod";
import { validateBody } from "../../middleware/validateMiddleware";
import { itemSchemaCreate } from "./itemValidator";
import { getAllCategoryDescendants } from "../kategorije/utils/sqlCategoryTreeUtils";
import {
  allFields,
  AllowedFieldsKeys,
  handleQueryObject,
  parseNumberRange,
} from "./itemUtils";
import { Prisma } from "@prisma/client";

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

          AND: Object.entries(filterFields).flatMap<Prisma.ItemWhereInput>(
            ([key, value]) => {
              // Number fields
              if (allFields[key as AllowedFieldsKeys] === "number") {
                return [
                  {
                    [key]: parseNumberRange(value as string),
                  },
                ];
              }

              // String[] fields
              if (allFields[key as AllowedFieldsKeys] === "string[]") {
                // Currently only 'tags' field is string[]
                // Multiple conditions, one for each tag
                // => item must contain ALL tags in the split array
                const tagIds = (value as string).split(",").map((v) => v.trim());
                return tagIds.map((tagId) => ({
                  [key]: {
                    some: { id: tagId },
                  },
                }));
              }

              // Other fields
              return [
                {
                  [key]: {
                    equals: value,
                    // contains: value,
                  },
                },
              ];
            }
          ),
        },
        include: {
          tags: true,
          images: true,
        },
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
