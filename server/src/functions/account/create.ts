import { createOneTimePassword } from "../utils/createOneTimePassword";
import { prisma } from "../../database/prisma";
import { HttpInvalidInputError } from "../../errors";
import { User } from "@prisma/client";
import { hashPassword } from "../utils/hashPassword";
import { getFutureDateByMonths } from "../utils/getFutureDateByMonths";

const defaultNumApiCallsAllowedInPeriod = 1000;

export type Props = {
  username: string;
  password: string;
};

export const create = async ({ username, password }: Props): Promise<User> => {
  const hashedPassword = hashPassword({ password });
  const verificationToken = createOneTimePassword({});
  return await prisma.$transaction(async (prisma) => {
    try {
      const user = await prisma.user.create({
        data: {
          username,
          hashedPassword,
          verificationToken,
          isConfirmed: false,
        },
      });
      const now = new Date();
      const billingPeriodEnd = getFutureDateByMonths({
        date: now,
        numMonths: 1,
      });
      const numApiCallsAllowedInPeriod = defaultNumApiCallsAllowedInPeriod;
      await prisma.apiStats.create({
        data: {
          userId: user.id,
          billingPeriodEnd,
          numApiCallsAllowedInPeriod,
          numApiCallsRemainingInBillingPeriod: numApiCallsAllowedInPeriod,
        },
      });
      return user;
    } catch (error) {
      throw new HttpInvalidInputError("Email already registerd");
    }
  });
};
