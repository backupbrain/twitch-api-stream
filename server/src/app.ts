import express, { NextFunction, Response } from "express";
import { Request } from "./types";
import { HttpError, HttpInvalidInputError } from "./errors";
import cors from "cors";
import { router } from "./routes";
import canonicalize from "canonicalize";

export const app = express();
app.use(cors());
app.use(express.json());

app.use("/", router);

// Handle undefined routes
app.use((request: Request, response: Response, next: NextFunction) => {
  response.status(404).send(
    canonicalize({
      status: "error",
      message: "resource_not_found",
    })
  );
});

// error handling
app.use(
  (
    error: HttpError | HttpInvalidInputError,
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    if (error.status === 400) {
      // TODO: build error details
      const inputError = error as HttpInvalidInputError;
      res.status(inputError.status || 400).send(
        canonicalize({
          status: "error",
          code: inputError.status || 400,
          message: inputError.message || "invalid_input",
          details: inputError.getRestDetails(),
        })
      );
    } else {
      res.status(error.status || 500).send(
        canonicalize({
          status: "error",
          code: error.status || 500,
          message: error.message || "internal_server_error",
        })
      );
    }
  }
);
