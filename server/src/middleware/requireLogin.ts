import { prisma } from "../database/prisma";
import { Response, NextFunction } from "express";
import { Request } from "../types";
import { HttpUnauthorizedError } from "../errors";

/**
 * Verify that there are certain headers in the request
 * @param {Request} req
 * @param {Response} res
 * @param {Function} next
 */
export const requireLogin = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authorizationHeader = req.headers["authorization"];
  let submittedAuthToken: string | undefined = undefined;
  const prefixLength = "Bearer ".length;
  if (authorizationHeader && authorizationHeader.length > prefixLength) {
    submittedAuthToken = authorizationHeader.substring(prefixLength);
  }
  if (!submittedAuthToken || submittedAuthToken.length === 0) {
    return next(new HttpUnauthorizedError("No auth token provided"));
  }
  // select authorization token and connected user from database
  const authorizationToken = await prisma.accessToken.findFirst({
    where: { token: submittedAuthToken },
    include: { user: true },
  });
  if (!authorizationToken) {
    return next(new HttpUnauthorizedError("Unauthorized"));
  }
  req.authorizationToken = authorizationToken;
  req.adminUser = authorizationToken.user = authorizationToken.user;
  return next();
};
