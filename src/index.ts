import express, { Request, Response } from "express";
import cors from "cors";
import kategorijeRoute from "./features/kategorije/kategorijeRoute";
import { errorHandler } from "./middleware/errorHandler";

const app = express();

app.use(express.json());
app.use(cors());

// Use routes
app.use("/kategorije", kategorijeRoute);
app.get("/", (req: Request, res: Response) => {
  res.send("Hello World!");
});

// Centralized Error Handling Middleware
// In any route, if you want to pass an error to this middleware, call next(err)
app.use(errorHandler);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port http://localhost:${PORT}`);
});

// Dogovori:
// uvijek vraćati odgovor kao json (res.json())
