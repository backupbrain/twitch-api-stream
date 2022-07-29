import { ApiStats, User } from "@prisma/client";
import { prisma } from "../../database/prisma";
import {
  HttpInternalServerError,
  HttpTooManyRequestsError,
} from "../../errors";
import { getFutureDateByMonths } from "../utils/getFutureDateByMonths";

export const apiRateLimitMilliseconds = 100;

export type Props = {
  user: User;
};
export const incrementUsageStats = async ({
  user,
}: Props): Promise<ApiStats> => {
  const apiStats = await prisma.apiStats.findUnique({
    where: { userId: user.id },
  });
  if (!apiStats) {
    throw new HttpInternalServerError(
      `API Stats could not be found for user ${user.username}`
    );
  }
  const now = new Date();
  if (apiStats.lastApiCall) {
    const timeSinceLastApiCall = now.getTime() - apiStats.lastApiCall.getTime();
    if (timeSinceLastApiCall < apiRateLimitMilliseconds) {
      throw new HttpTooManyRequestsError(
        `Too many requests for this user. Please wait ${apiRateLimitMilliseconds} milliseconds before your next request`
      );
    }
  }
  // FIXME: fix date roll-over logic to handle long times
  // since billingPeriodEnd and now.
  if (apiStats.billingPeriodEnd > now) {
    const oneMonthInFuture = getFutureDateByMonths({ date: now, numMonths: 1 });
    apiStats.billingPeriodStart = apiStats.billingPeriodEnd;
    apiStats.billingPeriodEnd = oneMonthInFuture;
    apiStats.numApiCallsSinceBillingStart = 0;
    apiStats.numApiCallsRemainingInBillingPeriod =
      apiStats.numApiCallsAllowedInPeriod;
  }
  const numApiCallsSinceBillingStart =
    apiStats.numApiCallsSinceBillingStart + 1;
  const numApiCallsRemainingInBillingPeriod = Math.max(
    0,
    apiStats.numApiCallsRemainingInBillingPeriod - 1
  );
  const updatedApiStats = await prisma.apiStats.update({
    where: { userId: user.id },
    data: {
      numApiCallsSinceBillingStart,
      numApiCallsSinceAccountBirthday: numApiCallsSinceBillingStart,
      numApiCallsRemainingInBillingPeriod,
      lastApiCall: now,
    },
  });
  return updatedApiStats;
};
