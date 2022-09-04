import { validateOrReject } from "class-validator";
import express, { NextFunction, Response } from "express";
import { prisma } from "../database/prisma";
import { HttpInvalidInputError, HttpUnauthorizedError } from "../errors";
import { addPaymentMethod } from "../functions/billing/addPaymentMethod";
import { getPaymentMethod } from "../functions/billing/getPaymentMethod";
import { getPaymentMethods } from "../functions/billing/getPaymentMethods";
import { removePaymentMethod } from "../functions/billing/removePaymentMethod";
import { switchSubscriptionPlan } from "../functions/billing/switchSubscriptionPlan";
import { updatePaymentMethod } from "../functions/billing/updatePaymentMethod";
import { requireLogin } from "../middleware/requireLogin";
import { Request } from "../types";
import { successResponse } from "./responses";
export const router = express.Router();

router.get(
  "/subscription",
  requireLogin,
  async (request: Request, response: Response, next: NextFunction) => {
    if (!request.adminUser) {
      return next(new HttpUnauthorizedError("Unauthorized"));
    }
    return response.json(
      successResponse({ data: { id: request.adminUser.stripePriceId } })
    );
  }
);

class UpdateSubscriptionPlanRequest {
  id!: string | null;
}
router.post(
  "/subscription",
  requireLogin,
  async (request: Request, response: Response, next: NextFunction) => {
    if (!request.adminUser) {
      return next(new HttpUnauthorizedError("Unauthorized"));
    }
    const updateSubscriptionPlanRequest = new UpdateSubscriptionPlanRequest();
    updateSubscriptionPlanRequest.id = request.body.id;
    try {
      await validateOrReject(updateSubscriptionPlanRequest);
    } catch (errors) {
      return next(new HttpInvalidInputError(errors));
    }
    const stripePriceId = updateSubscriptionPlanRequest.id;
    try {
      await switchSubscriptionPlan({
        user: request.adminUser,
        stripePriceId,
      });
      const updatedUser = await prisma.user.findUnique({
        where: { id: request.adminUser.id },
      });
      // TODO: remove stripePaymentMethod information
      return response.json(
        successResponse({
          message: "subscription_changed",
          data: { id: updatedUser?.stripePriceId },
        })
      );
    } catch (error: unknown) {
      return next(error);
    }
  }
);

router.get(
  "/",
  requireLogin,
  async (request: Request, response: Response, next: NextFunction) => {
    if (!request.adminUser) {
      return next(new HttpUnauthorizedError("Unauthorized"));
    }
    try {
      const paymentMethods = await getPaymentMethods({
        user: request.adminUser,
      });
      // TODO: remove stripePaymentMethod information
      return response.json(successResponse({ data: paymentMethods }));
    } catch (error: unknown) {
      return next(error);
    }
  }
);

class CreatePaymentMethodRequest {
  stripeToken!: string;
  primary!: boolean;
  nickname?: string;
}
router.post(
  "/",
  requireLogin,
  async (request: Request, response: Response, next: NextFunction) => {
    if (!request.adminUser) {
      return next(new HttpUnauthorizedError("Unauthorized"));
    }
    const createPaymentMethodRequest = new CreatePaymentMethodRequest();
    createPaymentMethodRequest.stripeToken = request.body.stripeToken;
    createPaymentMethodRequest.primary = request.body.primary;
    createPaymentMethodRequest.nickname = request.body.nickname;
    try {
      await validateOrReject(createPaymentMethodRequest);
    } catch (errors) {
      return next(new HttpInvalidInputError(errors));
    }
    const stripeToken = createPaymentMethodRequest.stripeToken;
    const primary = createPaymentMethodRequest.primary;
    const nickname = createPaymentMethodRequest.nickname;
    try {
      const paymentMethod = await addPaymentMethod({
        user: request.adminUser,
        stripeToken,
        primary,
        nickname,
      });
      return response.json(
        successResponse({
          message: "payment_method_created",
          data: paymentMethod,
        })
      );
    } catch (error: unknown) {
      return next(error);
    }
  }
);

router.get(
  "/:id",
  requireLogin,
  async (request: Request, response: Response, next: NextFunction) => {
    if (!request.adminUser) {
      return next(new HttpUnauthorizedError("Unauthorized"));
    }
    const id = request.params.id;
    try {
      const paymentMethod = await getPaymentMethod({
        user: request.adminUser,
        id,
      });
      // TODO: remove stripe informtion
      return response.json(successResponse({ data: paymentMethod }));
    } catch (error: unknown) {
      return next(error);
    }
  }
);

class UpdatePaymentMethodRequest {
  primary!: boolean;
  nickname?: string;
}
router.post(
  "/:id",
  requireLogin,
  async (request: Request, response: Response, next: NextFunction) => {
    if (!request.adminUser) {
      return next(new HttpUnauthorizedError("Unauthorized"));
    }
    const id = request.params.id;
    const updatePaymentMethodRequest = new UpdatePaymentMethodRequest();
    updatePaymentMethodRequest.primary = request.body.primary;
    updatePaymentMethodRequest.nickname = request.body.nickname;
    try {
      await validateOrReject(updatePaymentMethodRequest);
    } catch (errors) {
      return next(new HttpInvalidInputError(errors));
    }
    const isPrimary = updatePaymentMethodRequest.primary;
    const nickname = updatePaymentMethodRequest.nickname;
    try {
      const paymentMethod = await updatePaymentMethod({
        user: request.adminUser,
        id,
        isPrimary,
        nickname,
      });
      // TODO: remove stripe informtion
      return response.json(
        successResponse({
          message: "payment_method_updated",
          data: paymentMethod,
        })
      );
    } catch (error: unknown) {
      return next(error);
    }
  }
);

router.delete(
  "/:id",
  requireLogin,
  async (request: Request, response: Response, next: NextFunction) => {
    if (!request.adminUser) {
      return next(new HttpUnauthorizedError("Unauthorized"));
    }
    const id = request.params.id;
    try {
      await removePaymentMethod({
        user: request.adminUser,
        id,
      });
      return response.json(
        successResponse({ message: "payment_method_deleted" })
      );
    } catch (error: unknown) {
      return next(error);
    }
  }
);
