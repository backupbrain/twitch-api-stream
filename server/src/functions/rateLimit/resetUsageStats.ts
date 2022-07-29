import { User } from "@prisma/client";
import { prisma } from "../../database/prisma";
import { HttpInternalServerError } from "../../errors";

export type Props = {
  user: User;
};
export const resetUsageStats = async ({ user }: Props) => {
  const lastApiCall = new Date();
  lastApiCall.setDate(new Date().getDate() - 1);
  const usageStats = await prisma.apiStats.findUnique({
    where: { userId: user.id },
  });
  if (!usageStats) {
    throw new HttpInternalServerError(
      `API Stats could not be found for user ${user.username}`
    );
  }
  await prisma.apiStats.update({
    where: { userId: user.id },
    data: {
      numApiCallsSinceBillingStart: 0,
      numApiCallsSinceAccountBirthday: 0,
      numApiCallsRemainingInBillingPeriod:
        usageStats.numApiCallsAllowedInPeriod,
      lastApiCall,
    },
  });
};
