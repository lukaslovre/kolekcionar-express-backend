import express, { NextFunction, Request, Response } from "express";
import { prisma } from "../../database/prismaClient";
import { z } from "zod";
import { validateBody } from "../../middleware/validateMiddleware";
import { itemSchemaCreate } from "./itemValidator";
import { getAllCategoryDescendants } from "../kategorije/utils/sqlCategoryTreeUtils";

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
    const items = await prisma.item.findMany({ include: { tags: true, images: true } });
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

router.get(
  "/underCategory/:categoryId",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const categoryId = z.string().uuid().parse(req.params.categoryId);

      const allCategoriesUnderSelected = await getAllCategoryDescendants(categoryId);

      const categoryIds = [categoryId, ...allCategoriesUnderSelected.map((c) => c.id)];

      const items = await prisma.item.findMany({
        where: {
          kategorijaId: { in: categoryIds },
        },
        include: {
          tags: true,
          images: true,
        },
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
