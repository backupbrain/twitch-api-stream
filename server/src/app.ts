import express, { NextFunction, Response } from "express";
import { Request } from "./types";
import { HttpError, HttpInvalidInputError } from "./errors";
import cors from "cors";
import { router } from "./routes";

export const app = express();
app.use(cors());
app.use(express.json());

app.use("/", router);

// Handle undefined routes
app.use((request: Request, response: Response, next: NextFunction) => {
  response.status(404).json({
    status: "error",
    message: "Resource doesn't exist",
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
      res.status(inputError.status || 500).send({
        error: {
          status: "error",
          message: inputError.message || "Invalid input",
          details: inputError.getRestDetails(),
        },
      });
    } else {
      res.status(error.status || 500).send({
        error: {
          status: error.status || 500,
          message: error.message || "Internal Server Error",
        },
      });
    }
  }
);
