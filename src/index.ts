import express, { Request, Response } from "express";
import cors from "cors";
import path from "path";
import { errorHandler } from "./middleware/errorHandler";
import kategorijeRoute from "./features/kategorije/kategorijeRoute";
import itemRoute from "./features/item/itemRoute";
import tagRoute from "./features/tag/tagRoute";
import countryRoute from "./features/country/countryRoute";
import imageRoute from "./features/image/imageRoute";

const app = express();

app.use(cors());
app.use(express.json());

// Serve static files
const pathToImages = path.resolve(__dirname, "../public/images");
app.use("/images", express.static(pathToImages));

// Use routes
app.use("/kategorije", kategorijeRoute);
app.use("/item", itemRoute);
app.use("/tag", tagRoute);
app.use("/country", countryRoute);
app.use("/image", imageRoute);

// Test route
app.get("/health", (req: Request, res: Response) => {
  res.json({
    message: "Server is running",
  });
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
