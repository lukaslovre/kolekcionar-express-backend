import express, { NextFunction, Request, Response } from "express";
import { prisma } from "../database/prismaClient";
import { kategorijeSchema, kategorijeSchemaCreate } from "./kategorijeValidator";
import { validateBody } from "../middleware/validateMiddleware";
import { z } from "zod";

const router = express.Router();

// How to use query parameters in express?
// answer: req.query
// Example: GET /kategorije?max=10&offset=5
router.get("/all", async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Get query parameters
    const { max = "10", offset = "0" } = req.query;
    const maxInt = parseInt(max as string);
    const offsetInt = parseInt(offset as string);

    //   Use zod to parse the string to number
    const maxNum = z.number().parse(maxInt);
    const offsetNum = z.number().parse(offsetInt);

    console.log(maxNum, offsetNum);

    const result = await prisma.kategorije.findMany({
      take: maxNum,
      skip: offsetNum,
    });
    res.json({
      message: "All categories",
      data: result,
    });
  } catch (err) {
    next(err);
  }
});

router.get("/id/:id", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = z.string().uuid().parse(req.params.id); // Throw error if invalid UUID

    const result = await prisma.kategorije.findUnique({
      where: {
        id: id,
      },
    });

    res.json({
      message: "Category by ID",
      data: result,
    });
  } catch (err) {
    next(err);
  }
});

router.post(
  "/",
  validateBody(kategorijeSchemaCreate), // req.body now has a validated object
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const newCategory = await prisma.kategorije.create({
        data: req.body,
      });

      res.status(201).json({ message: "Category created", data: newCategory });
    } catch (err) {
      next(err); // Pass the error to the error handler middleware (middleware/errorHandler.ts)
    }
  }
);

router.put(
  "/",
  validateBody(kategorijeSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Ako u body-u fali neko opcionalno polje ostane nepromjenjeno
      const updatedCategory = await prisma.kategorije.update({
        where: {
          id: req.body.id,
        },
        data: req.body,
      });

      res.json({ message: "Category updated", data: updatedCategory });
    } catch (err) {
      next(err);
    }
  }
);

export default router;
