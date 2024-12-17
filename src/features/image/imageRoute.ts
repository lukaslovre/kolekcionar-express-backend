import express, { NextFunction, Request, Response } from "express";
import multer from "multer";
import path from "path";
import sharp from "sharp";
import crypto from "crypto";
import fs from "fs/promises";

const router = express.Router();

// log the path for testing
const imagesPath = path.resolve(__dirname, "../../../public/images");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, imagesPath);
  },
  filename: function (req, file, cb) {
    const uniqueName = crypto.randomUUID() + path.extname(file.originalname);
    cb(null, uniqueName);
  },
});

const upload = multer({ storage: storage });

// Route that handles image creation
// Takes in images
// saves them to fs and gives them UUID for name
// returns the UUIDs mapped to the original names

// ADDITIONAL:
// Implement some way that if an image isn't "used" (isn't in db later after some time ) it gets deleted

router.post(
  "/upload",
  upload.single("image"),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const file = req.file;

      if (!file) {
        throw new Error("No file provided");
      }

      const lowResFilename = "lowres-" + file.filename;
      const outputPath = path.resolve(imagesPath, lowResFilename);

      //   Resize image using Sharp
      await sharp(file.path)
        .resize({ height: 256, withoutEnlargement: true })
        .toFile(outputPath);

      // Get file sizes
      const [originalSize, lowResSize] = await Promise.all([
        fs.stat(file.path),
        fs.stat(outputPath),
      ]);

      const data = {
        filename: {
          original: file.originalname,
          new: file.filename,
          lowres: lowResFilename,
        },
        filesize: {
          original: originalSize.size,
          lowres: lowResSize.size,
        },
      };

      res.json({
        message: "Image uploaded",
        data: data,
      });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
