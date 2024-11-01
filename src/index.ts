// General Express.js setup
import express, { Request, Response } from "express";
import cors from "cors";
import testRoute from "./routes/testRoute";
import { main } from "./database/prismaClient";

const app = express();
app.use(express.json());
app.use(cors());

// Use routes
app.use("/test", testRoute);

app.get("/", (req: Request, res: Response) => {
  res.send("Hello World!");
});

app.listen(3000, () => {
  console.log("Server is running on http://localhost:3000");
});
