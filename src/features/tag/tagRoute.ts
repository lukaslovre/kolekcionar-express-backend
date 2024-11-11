import express, { NextFunction, Request, Response } from "express";
import { prisma } from "../../database/prismaClient";
import { z } from "zod";
import { validateBody } from "../../middleware/validateMiddleware";
import { tagSchema, tagSchemaCreate } from "./tagValidator";

const router = express.Router();

router.get("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tags = await prisma.tag.findMany();

    res.json({
      message: "All tags",
      data: tags,
    });
  } catch (error) {
    next(error);
  }
});

router.post(
  "/",
  validateBody(tagSchemaCreate),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const tag = await prisma.tag.create({
        data: req.body,
      });

      res.json({
        message: "Tag created",
        data: tag,
      });
    } catch (error) {
      next(error);
    }
  }
);
export default router;
