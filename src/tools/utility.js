import { pipeline } from "stream";
import { getMediaReadableStream } from "../media/fs-tools.js";
import { getPDFReadableStream } from "./pdf-tools.js";
import express from "express";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import fs from "fs-extra";
const { readJSON, writeJSON, writeFile, createReadStream } = fs;
const filesRouter = express.Router();

const mediaJSONPath = join(
  dirname(fileURLToPath(import.meta.url)),
  "media.json"
);

const getMedia = () => readJSON(mediaJSONPath);
filesRouter.get("/downloadJSON", async (req, res, next) => {
  res.setHeader("Content-Disposition", "attachment; filename=media.json");
  const source = getMediaReadableStream();
  const destination = res;

  pipeline(source, destination, (err) => {
    err ? console.log(err) : console.log("stream ended successfully");
  });
});

filesRouter.get("/downloadPDF", async (req, res, next) => {
  try {
    const media = await getMedia();
    console.log(media);
    res.setHeader("Content-Disposition", "attachment; filename=media.pdf");
    const source = getPDFReadableStream(media[0]);
    const destination = res;
    pipeline(source, destination, (err) => {
      err ? console.log(err) : console.log("stream ended successfully");
    });
  } catch (error) {
    console.log(error);
  }
});
export default filesRouter;
