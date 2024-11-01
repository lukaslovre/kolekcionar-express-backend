import express, { NextFunction, Request, Response } from "express";
import { prisma } from "../database/prismaClient";
import { kategorijeSchema } from "./kategorijeValidator";
import { validate } from "../middleware/validateMiddleware";

const router = express.Router();

router.get("/all", async (req: Request, res: Response) => {
  const result = await prisma.kategorije.findMany();
  res.send("All categories: " + JSON.stringify(result));
});

router.get("/id/:id", (req: Request, res: Response) => {
  res.send(`Category with id ${req.params.id}`);
});

router.post(
  "/",
  validate(kategorijeSchema), // req.body now has a validated object
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

export default router;
