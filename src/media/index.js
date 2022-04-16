import express from "express";
import fs from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import uniqid from "uniqid";
import { getMedia, writeMedia, saveMediaCover } from "./fs-tools.js";
import {
  checkMediaSchema,
  checkReviewSchema,
  checkValidationResult,
} from "./validation.js";
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

mediaRouter.put(
  "/:id/review",
  checkReviewSchema,
  checkValidationResult,
  async (req, res, next) => {
    try {
      const { text, rate } = req.body;
      const review = {
        id: uniqid(),
        text,
        rate,
        elementId: req.params.id,
        createdAt: new Date(),
      };
      const fileAsBuffer = fs.readFileSync(mediaJSONPath);
      const fileAsString = fileAsBuffer.toString();
      const fileAsJSONArray = JSON.parse(fileAsString);

      const reviewIndex = fileAsJSONArray.findIndex(
        (media) => media.id === req.params.id
      );
      if (!reviewIndex == -1) {
        res.status(404).send({ message: "movie not found" });
      } else {
        const previousReviewData = fileAsJSONArray[reviewIndex];
        previousReviewData.reviews = previousReviewData.reviews || [];
        const changedMovieReview = {
          ...previousReviewData,
          reviews: [...previousReviewData.reviews, review],
        };
        fileAsJSONArray[reviewIndex] = changedMovieReview;
        fs.writeFileSync(mediaJSONPath, JSON.stringify(fileAsJSONArray));
        res.send(changedMovieReview);
      }
    } catch (error) {
      next(error);
    }
  }
);

mediaRouter.delete("/:id/review/:reviewId", async (req, res, next) => {
  try {
    const media = await getMedia();
    const mediaIndex = media.findIndex((movie) => movie.id === req.params.id);
    if (mediaIndex !== -1) {
      const findMovie = media[mediaIndex];
      let reviews = findMovie.reviews;
      const removeReview = reviews.filter(
        (review) => review.id !== req.params.reviewId
      );
      console.log(removeReview);

      media[mediaIndex].reviews = removeReview;
      await writeMedia(media);
      res.status(201).send({ message: "review deleted" });
    }
  } catch (error) {
    res.status(500).send({ message: "review not found" });
  }
});
export default mediaRouter;
