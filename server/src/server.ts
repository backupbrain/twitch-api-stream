require("dotenv").config();
import express, { NextFunction, Response } from "express";
import { Request } from "./types";
import { HttpError, HttpInvalidInputError } from "./errors";
import cors from "cors";
import { router } from "./routes";
const requestedPort = process.env.PORT || "3030";
const port = parseInt(requestedPort);

const app = express();
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
    console.log(typeof error);
    if (error.status === 400) {
      // TODO: build error details
      const inputError = error as HttpInvalidInputError;
      res.status(inputError.status || 500).send({
        error: {
          status: inputError.status || 500,
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

app.listen(port, () => {
  console.log(`Rest API listening on port ${port}`);
});
