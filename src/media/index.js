import express from "express";
import fs from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import uniqid from "uniqid";
import { getMedia, writeMedia, saveMediaCover } from "./fs-tools.js";
import { checkMediaSchema, checkReviewSchema } from "./validation.js";
import createError from "http-errors";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";

const mediaRouter = express.Router();

const mediaJSONPath = join(
  dirname(fileURLToPath(import.meta.url)),
  "media.json"
);

const cloudinaryUploader = multer({
  storage: new CloudinaryStorage({
    cloudinary,
    params: {
      folder: "m5-d9",
    },
  }),
}).single("poster");

mediaRouter.post(
  "/",
  checkMediaSchema,
  checkReviewSchema,
  async (req, res, next) => {
    try {
      const newMedia = { ...req.body, createdAt: new Date(), id: uniqid() };
      const mediaArray = JSON.parse(fs.readFileSync(mediaJSONPath));
      mediaArray.push(newMedia);
      fs.writeFileSync(mediaJSONPath, JSON.stringify(mediaArray));
      res.status(201).send({ id: newMedia.id });
    } catch (error) {
      next(error);
    }
  }
);

mediaRouter.get("/", async (req, res, next) => {
  try {
    const media = await getMedia();
    console.log(media);
    res.send(media);
  } catch (error) {
    next(error);
  }
});

mediaRouter.get("/:id", async (req, res, next) => {
  try {
    const media = await getMedia();
    const findMovie = media.find((movie) => movie.id === req.params.id);
    console.log(findMovie);
    if (findMovie) {
      res.send(findMovie);
    } else {
      next.createError(404, "Movie not found!");
    }
  } catch (error) {
    next(error);
  }
});

mediaRouter.put("/:id", async (req, res, next) => {
  try {
    const media = await getMedia();

    const index = media.findIndex((media) => media.id === req.params.id);

    if (index !== -1) {
      const oldMedia = media[index];

      const updatedMedia = { ...oldMedia, ...req.body, updatedAt: new Date() };

      media[index] = updatedMedia;

      await writeMedia(media);

      res.send(updatedMedia);
    } else {
      next(createError(404, `media with id ${req.params.id} not found!`));
    }
  } catch (error) {
    next(error);
  }
});

mediaRouter.delete("/:id", async (req, res, next) => {
  try {
    const media = await getMedia();
    const remainingMedia = media.filter((media) => media.id !== req.params.id);
    console.log(remainingMedia);
    await writeMedia(remainingMedia);
    res.status(201).send();
  } catch (error) {
    next(error);
  }
});

mediaRouter.put("/:id/poster", cloudinaryUploader, async (req, res, next) => {
  try {
    const media = await getMedia();

    const index = media.findIndex((media) => media.id === req.params.id);
    console.log(req.file);
    if (index !== -1) {
      const oldMedia = media[index];

      const updatedMedia = {
        ...oldMedia,
        Poster: req.file.path,
        updatedAt: new Date(),
      };
      media[index] = updatedMedia;
      await writeMedia(media);
      res.send(updatedMedia);
    }
  } catch (error) {
    next(error);
  }
});
export default mediaRouter;
