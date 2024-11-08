import express, { Request, Response } from "express";
import cors from "cors";
import { errorHandler } from "./middleware/errorHandler";
import kategorijeRoute from "./features/kategorije/kategorijeRoute";
import itemRoute from "./features/item/itemRoute";

const app = express();

app.use(cors());
app.use(express.json());

// Use routes
app.use("/kategorije", kategorijeRoute);
app.use("/item", itemRoute);
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
