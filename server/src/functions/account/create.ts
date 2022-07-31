import { createOneTimePassword } from "../utils/createOneTimePassword";
import { prisma } from "../../database/prisma";
import { HttpInvalidInputError } from "../../errors";
import { User } from "@prisma/client";
import { hashPassword } from "../utils/hashPassword";
import { getFutureDateByMonths } from "../utils/getFutureDateByMonths";
import { createStripeCustomer } from "../billing/createStripeCustomer";
import { createSubscription } from "../billing/createSubscription";

const defaultNumApiCallsAllowedInPeriod = 1000;

export type Props = {
  username: string;
  password: string;
  stripePriceId?: string;
};

export const create = async ({
  username,
  password,
  stripePriceId,
}: Props): Promise<User> => {
  const hashedPassword = hashPassword({ password });
  const verificationToken = createOneTimePassword({});
  let stripeSubscriptionId: string | null = null;
  const stripeCustomer = await createStripeCustomer({
    email: username,
  });
  if (stripePriceId) {
    // TODO: store payment method
    const stripeSubscription = await createSubscription({
      stripeCustomerId: stripeCustomer.id,
      stripePriceId,
    });
    stripeSubscriptionId = stripeSubscription.id;
  }
  return await prisma.$transaction(async (prisma) => {
    try {
      const user = await prisma.user.create({
        data: {
          username,
          hashedPassword,
          verificationToken,
          isConfirmed: false,
          stripeCustomerId: stripeCustomer.id,
          stripeSubscriptionId,
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
