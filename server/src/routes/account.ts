import express, { Response, NextFunction, json } from "express";
export const router = express.Router();
import { Request } from "../types";
import { login } from "../functions/account/login";
import { requireLogin } from "../middleware/requireLogin";
import { refreshAuthToken } from "../functions/account/refreshAuthToken";
import { IsEmail, validateOrReject } from "class-validator";
import { HttpInvalidInputError, HttpUnauthorizedError } from "../errors";
import { logout } from "../functions/account/logout";

// login
class LoginRequest {
  @IsEmail()
  username!: string;
  password!: string;
}
router.post(
  "/api/1.0/account/login",
  async (request: Request, response: Response, next: NextFunction) => {
    const loginRequest = new LoginRequest();
    loginRequest.username = request.body.username;
    loginRequest.password = request.body.password;
    try {
      await validateOrReject(loginRequest);
    } catch (errors) {
      console.log({ errors });
      console.log(errors);
      next(new HttpInvalidInputError(errors));
      return;
    }
    const username = loginRequest.username;
    const password = loginRequest.password;
    try {
      const tokenData = await login({ username, password });
      return response.json(tokenData);
    } catch (error: unknown) {
      return next(error);
    }
  }
);

/**
 * /admin/oauth/
 */
router.get(
  "/admin/oauth",
  requireLogin,
  async (req: Request, res: Response, next: NextFunction) => {
    if (!req.accessToken) {
      next(new HttpUnauthorizedError("Unauthorized"));
      return;
    }
    const accessToken = req.accessToken.token;
    const updatedToken = await refreshAuthToken({ accessToken });
    res.json(updatedToken);
  }
);

/**
 * /admin/logout/
 */
router.post(
  "/admin/logout",
  requireLogin,
  async (req: Request, res: Response, next: NextFunction) => {
    if (!req.adminUser || !req.accessToken) {
      next(new HttpUnauthorizedError("Unauthorized"));
      return;
    }
    const accessToken = req.accessToken.token;
    try {
      const updatedAuthToken = await logout({ accessToken });
      res.json(updatedAuthToken);
    } catch (err) {
      return next(err);
    }
  }
);
