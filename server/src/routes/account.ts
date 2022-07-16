import express, { Response, NextFunction, json } from "express";
export const router = express.Router();
import { Request } from "../types";
import { login } from "../functions/account/login";
import { requireLogin } from "../middleware/requireLogin";
import { refreshAuthToken } from "../functions/account/refreshAuthToken";
import { IsEmail, validateOrReject } from "class-validator";
import { HttpInvalidInputError, HttpUnauthorizedError } from "../errors";
import { logout } from "../functions/account/logout";
import { register } from "../functions/account/register";
import { verifyUser } from "../functions/account/verifyUser";

/**
 * Register
 */
class RegistrationRequest {
  @IsEmail()
  username!: string;
  password!: string;
}
router.post(
  "/create",
  async (request: Request, response: Response, next: NextFunction) => {
    const registrationRequest = new RegistrationRequest();
    registrationRequest.username = request.body.username;
    registrationRequest.password = request.body.password;
    try {
      await validateOrReject(registrationRequest);
    } catch (errors) {
      console.log({ errors });
      console.log(errors);
      return next(new HttpInvalidInputError(errors));
    }
    const username = registrationRequest.username;
    const password = registrationRequest.password;
    try {
      const user = await register({ username, password });
      // TODO send email
      console.log(
        `User created with verification code: ${user.verificationToken}`
      );
      return response.json({ status: "success" });
    } catch (error: unknown) {
      return next(error);
    }
  }
);

/**
 * Register
 */
class VerifyRegistrationRequest {
  @IsEmail()
  username!: string;
  verificationToken!: string;
}
router.post(
  "/verify",
  async (request: Request, response: Response, next: NextFunction) => {
    const requestData = new VerifyRegistrationRequest();
    requestData.username = request.body.username;
    requestData.verificationToken = request.body.verificationToken;
    try {
      await validateOrReject(requestData);
    } catch (errors) {
      console.log({ errors });
      console.log(errors);
      return next(new HttpInvalidInputError(errors));
    }
    const username = requestData.username;
    const verificationToken = requestData.verificationToken;
    try {
      await verifyUser({ username, verificationToken });
      return response.json({ status: "success" });
    } catch (error: unknown) {
      return next(error);
    }
  }
);

/**
 * Login
 */
class LoginRequest {
  @IsEmail()
  username!: string;
  password!: string;
}
router.post(
  "/login",
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
 * Refresh auth token
 * Login required
 */
router.post(
  "/refresh",
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
 * Logout
 * Login Required
 */
router.post(
  "/logout",
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

// TODO: reset and change password
