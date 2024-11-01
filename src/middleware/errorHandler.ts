import { ErrorRequestHandler, NextFunction, Request, Response } from "express";
import { ZodError } from "zod";

export const errorHandler: ErrorRequestHandler = (
  err: unknown,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (err instanceof ZodError) {
    console.log(err.issues);
    res.status(400).json({ error: err.issues });
  } else if (err instanceof Error) {
    console.log(err.message);
    res.status(500).json({ error: err.message });
  } else {
    console.log(err);
    res.status(500).json({ error: "Something went wrong" });
  }
};
