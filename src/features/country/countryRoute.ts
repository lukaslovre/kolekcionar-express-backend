import express, { NextFunction, Request, Response } from "express";
import { prisma } from "../../database/prismaClient";

const router = express.Router();

router.get("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    console.log("All countries");

    const countries = await prisma.country.findMany();

    res.json({
      message: "All countries",
      data: countries,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
