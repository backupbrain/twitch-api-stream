import express, { Response, NextFunction } from "express";
export const router = express.Router();
import { Request } from "../types";
import { login } from "../functions/account/login";
import { requireLogin } from "../middleware/requireLogin";
import { refreshAuthToken } from "../functions/account/refreshAuthToken";
import { IsEmail, validateOrReject } from "class-validator";
import { HttpInvalidInputError, HttpUnauthorizedError } from "../errors";
import { logout } from "../functions/account/logout";
import { create } from "../functions/account/create";
import { verifyUser } from "../functions/account/verifyUser";
import { getUsageStats } from "../functions/rateLimit/getUsageStats";
import { changePassword } from "../functions/account/changePassword";
import { requestPasswordReset } from "../functions/account/requestPasswordReset";
import { setPasswordForUsername } from "../functions/account/setPasswordForUsername";

/**
 * Register
 */
class RegistrationRequest {
  @IsEmail()
  username!: string;
  password!: string;
  stripeToken?: string;
  stripePriceId?: string;
}
router.post(
  "/create",
  async (request: express.Request, response: Response, next: NextFunction) => {
    const registrationRequest = new RegistrationRequest();
    registrationRequest.username = request.body.username;
    registrationRequest.password = request.body.password;
    registrationRequest.stripeToken = request.body.stripeToken;
    registrationRequest.stripePriceId = request.body.stripePriceId;
    try {
      await validateOrReject(registrationRequest);
    } catch (errors) {
      console.log({ errors });
      return next(new HttpInvalidInputError(errors));
    }
    const username = registrationRequest.username;
    const password = registrationRequest.password;
    const stripeToken = registrationRequest.stripeToken;
    const stripePriceId = registrationRequest.stripePriceId;
    try {
      const user = await create({
        username,
        password,
        stripeToken,
        stripePriceId,
      });
      // TODO send email
      console.log(
        `User ${username} created with verification code: ${user.verificationToken}`
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
  async (request: express.Request, response: Response, next: NextFunction) => {
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
  async (request: express.Request, response: Response, next: NextFunction) => {
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
  async (request: Request, response: Response, next: NextFunction) => {
    const accessToken = request.accessToken!.token;
    const updatedToken = await refreshAuthToken({ accessToken });
    response.json(updatedToken);
  }
);

/**
 * Logout
 * Login Required
 */
router.post(
  "/logout",
  requireLogin,
  async (request: Request, response: Response, next: NextFunction) => {
    const accessToken = request.accessToken!.token;
    try {
      const updatedAuthToken = await logout({ accessToken });
      response.json(updatedAuthToken);
    } catch (err) {
      return next(err);
    }
  }
);

// TODO: reset and change password

class ChangePasswordRequest {
  oldPassword!: string;
  newPassword!: string;
}
router.post(
  "/password/change",
  async (request: Request, response: Response, next: NextFunction) => {
    const changePasswordRequest = new ChangePasswordRequest();
    changePasswordRequest.oldPassword = request.body.oldPassword;
    changePasswordRequest.newPassword = request.body.newPassword;
    try {
      await validateOrReject(changePasswordRequest);
    } catch (errors) {
      console.log({ errors });
      console.log(errors);
      next(new HttpInvalidInputError(errors));
      return;
    }
    const oldPassword = changePasswordRequest.oldPassword;
    const newPassword = changePasswordRequest.newPassword;
    await changePassword({
      user: request.adminUser!,
      oldPassword,
      newPassword,
    });
    response.json({ status: "success", message: "Password was changed." });
  }
);

class CreatePasswordResetRequestRequest {
  @IsEmail()
  username!: string;
}
router.post(
  "/password/reset",
  async (request: Request, response: Response, next: NextFunction) => {
    const passwordResetRequest = new CreatePasswordResetRequestRequest();
    passwordResetRequest.username = request.body.username;
    try {
      await validateOrReject(passwordResetRequest);
    } catch (errors) {
      console.log({ errors });
      console.log(errors);
      next(new HttpInvalidInputError(errors));
      return;
    }
    const username = passwordResetRequest.username;
    const user = await requestPasswordReset({
      username,
    });
    // TODO send email
    console.log(
      `User ${username} requested password reset with verification code: ${user.resetPasswordToken}`
    );
    response.json({
      status: "success",
      message: "A confirmation token was sent to your email address.",
    });
  }
);

class ResetPasswordChangeRequest {
  @IsEmail()
  username!: string;
  password!: string;
  token!: string;
}
router.post(
  "/password/reset/set",
  async (request: Request, response: Response, next: NextFunction) => {
    const passwordChangeRequest = new ResetPasswordChangeRequest();
    passwordChangeRequest.username = request.body.username;
    passwordChangeRequest.password = request.body.password;
    passwordChangeRequest.token = request.body.token;
    try {
      await validateOrReject(passwordChangeRequest);
    } catch (errors) {
      console.log({ errors });
      console.log(errors);
      next(new HttpInvalidInputError(errors));
      return;
    }
    const username = passwordChangeRequest.username;
    const password = passwordChangeRequest.password;
    const resetPasswordToken = passwordChangeRequest.token;
    await setPasswordForUsername({
      username,
      password,
      resetPasswordToken,
    });
    response.json({ status: "success", message: "Password was changed." });
  }
);

router.get(
  "/stats",
  requireLogin,
  async (request: Request, response: Response, next: NextFunction) => {
    try {
      const { userId, ...stats } = await getUsageStats({
        user: request.adminUser!,
      });
      response.json(stats);
    } catch (err) {
      return next(err);
    }
  }
);
