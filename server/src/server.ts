import express, { NextFunction, Request, Response } from "express";
import cors from "cors";
import { prisma } from "./database/prisma";
const app = express();
app.use(cors());
app.use(express.json());
const port = 3030;

app.get("/", (request: Request, response: Response) => {
  throw new Error("Invalid Data");
  // res.json({ status: "success", message: "Hello world" });
});

// login
type LoginParams = {
  username: string;
  password: string;
};
app.post(
  "/api/1.0/account/login",
  async (request: Request, response: Response, next: NextFunction) => {
    /*
  { "username": "email@example.com", "password": "abc123" }
  */
    const data: LoginParams = request.body;
    const username = data.username;
    const password = data.password;
    const user = await prisma.user.findFirst({
      where: {
        username,
        password,
      },
    });
    if (!user) {
      next(new Error("Unauthorized"));
      return;
    }
    response.json({ status: "success", message: "User logged in" });
  }
);

// Handle undefined routes
app.use((request: Request, response: Response, next: NextFunction) => {
  response.status(404).json({
    status: "error",
    message: "Resource doesn't exist",
  });
});

// handle errors
app.use(
  (error: Error, request: Request, response: Response, next: NextFunction) => {
    console.error(error.stack);
    response.status(500).json({
      status: "error",
      message: "Internal server error",
    });
  }
);

app.listen(port, () => {
  console.log(`Rest API listening on port ${port}`);
});
