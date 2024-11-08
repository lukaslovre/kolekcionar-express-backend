import express, { NextFunction, Request, Response } from "express";
import { prisma } from "../../database/prismaClient";
import { z } from "zod";
import { validateBody } from "../../middleware/validateMiddleware";
import { itemSchemaCreate } from "./itemValidator";

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

    const item = await prisma.item.findUnique({
      where: {
        id: Number(id),
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

router.post(
  "/",
  validateBody(itemSchemaCreate),
  async (req: Request, res: Response, next: NextFunction) => {
    // Treba provjerit jesu li poslani images i tags.
    // Prisma ima opcije .create .connect .disconnect .set

    // Ovo nije gotovo, treba vidjet kako funkcioniraju ovi relational polja

    try {
      const newItem = await prisma.item.create({
        data: req.body,
      });

      res.status(201).json({ message: "Item created", data: newItem });
    } catch (err) {
      next(err);
    }
  }
);

export default router;
