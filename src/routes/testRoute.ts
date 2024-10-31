import express, { Request, Response } from "express";
import { testSchema } from "../validators/testSchema";

const router = express.Router();

router.post("/", (req: Request, res: Response) => {
  console.log(req.body);
  try {
    const { name, email, age } = testSchema.parse(req.body);
    res.send(`Hello ${name}!`);
  } catch (error) {
    res.status(400).send(error);
  }
});

export default router;
