import cors from "cors";
import express, { NextFunction, Response } from "express";
import { HttpError, HttpInvalidInputError } from "./errors";
import { router } from "./routes";
import { Request } from "./types";

export const app = express();
app.use(cors());
app.use(express.json());

app.use("/", router);

// Handle undefined routes
app.use((_request: Request, response: Response, next: NextFunction) => {
  response.status(404).json({
    status: "error",
    message: "resource_not_found",
  });
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
      res.status(inputError.status || 400).json({
        status: "error",
        message: inputError.message || "invalid_input",
        details: inputError.getRestDetails(),
      });
    } else {
      res.status(error.status || 500).json({
        status: "error",
        message: error.message || "internal_server_error",
      });
    }
  }
);
