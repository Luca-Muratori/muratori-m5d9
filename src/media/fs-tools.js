import fs from "fs-extra";
import { fileURLToPath } from "url";
import { join, dirname } from "path";

const { readJSON, writeJSON, writeFile, createReadStream, createWriteStream } =
  fs;

const mediaJSONPath = join(
  dirname(fileURLToPath(import.meta.url)),
  "media.json"
);

const mediaFolderPath = join(
  dirname(fileURLToPath(import.meta.url)),
  "../media"
);

const usersPublicFolderPath = join(process.cwd(), "./public/img/media");

export const getMedia = () => readJSON(mediaJSONPath);
export const writeMedia = (content) => writeJSON(mediaJSONPath, content);

export const saveMediaCover = (filename, contentAsBuffer) =>
  writeFile(join(usersPublicFolderPath, filename), contentAsBuffer);

export const getMediaReadableStream = () => createReadStream(mediaJSONPath);

export const getPDFWritableStream = (filename) =>
  createWriteStream(join(mediaFolderPath, filename));
