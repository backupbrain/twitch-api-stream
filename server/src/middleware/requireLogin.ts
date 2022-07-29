import { prisma } from "../database/prisma";
import { Response, NextFunction } from "express";
import { Request } from "../types";
import { HttpForbiddenError, HttpTooManyRequestsError } from "../errors";
import { incrementUsageStats } from "../functions/rateLimit/incrementUsageStats";

/**
 * Verify that there are certain headers in the request
 * @param {Request} req
 * @param {Response} _res
 * @param {Function} next
 */
export const requireLogin = async (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  const authorizationHeader = req.headers["authorization"];
  let submittedAuthToken: string | undefined = undefined;
  const prefixLength = "Bearer ".length;
  if (authorizationHeader && authorizationHeader.length > prefixLength) {
    submittedAuthToken = authorizationHeader.substring(prefixLength);
  }
  if (!submittedAuthToken || submittedAuthToken.length === 0) {
    return next(new HttpForbiddenError("No auth token provided"));
  }
  // select authorization token and connected user from database
  const authToken = await prisma.accessToken.findFirst({
    where: {
      token: submittedAuthToken,
      expiresAt: {
        gte: new Date(),
      },
    },
    include: { user: true },
  });
  if (!authToken) {
    return next(new HttpForbiddenError("Unauthorized"));
  }
  req.accessToken = authToken;
  req.adminUser = authToken.user = authToken.user;
  // increment the number of api calls
  try {
    const usageStats = await incrementUsageStats({
      user: req.adminUser,
    });
    if (usageStats.numApiCallsRemainingInBillingPeriod <= 0) {
      return next(
        new HttpTooManyRequestsError("Please upgrade to get more api calls")
      );
    }
  } catch (error) {
    return next(error);
  }
  return next();
};
