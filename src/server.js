import express from "express";
import listEndpoints from "express-list-endpoints";
import cors from "cors";
import { join } from "path";
import {
  genericErrorHandler,
  notFoundErrorHandler,
  badRequestErrorHandler,
  unauthorizedErrorHandler,
} from "./errorHandler.js";
import createError from "http-errors";

import mediaRouter from "./media/index.js";

const server = express();

const port = process.env.PORT || 3001;

const publicFolderPath = join(process.cwd(), "./public");

const loggerMiddleware = (req, res, next) => {
  console.log(
    `Request method: ${req.method} --- URL ${req.url} --- ${new Date()}`
  );
  next();
};

const whitelist = [process.env.FE_DEV_URL, process.env.FE_PROD_URL];

server.use(express.static(publicFolderPath));
server.use(
  cors({
    origin: process.env.FE_PROD_URL,
    // (origin, next) => {
    //   console.log("ORIGIN: ", origin);

    //   if (!origin || whitelist.indexOf(origin) !== -1) {
    //     next(null, true);
    //   } else {
    //     next(createError(400, "CORS ERROR!"));
    //   }
    // },
  })
);
server.use(loggerMiddleware);
server.use(express.json());

server.use("/media", mediaRouter);

server.use(badRequestErrorHandler);
server.use(unauthorizedErrorHandler);
server.use(notFoundErrorHandler);
server.use(genericErrorHandler);

server.listen(port, () => {
  console.table(listEndpoints(server));
  console.log(`Server is running on port ${port}!`);
});
