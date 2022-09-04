import { User } from "@prisma/client";
import { prisma } from "../../database/prisma";
import { HttpInvalidInputError } from "../../errors";
import { addPaymentMethod } from "../billing/addPaymentMethod";
import { createStripeCustomer } from "../billing/createStripeCustomer";
import { createSubscription } from "../billing/createSubscription";
import { createOneTimePassword } from "../utils/createOneTimePassword";
import { getFutureDateByMonths } from "../utils/getFutureDateByMonths";
import { hashPassword } from "../utils/hashPassword";

const defaultNumApiCallsAllowedInPeriod = 1000;

export type Props = {
  username: string;
  password: string;
  subscriptionId?: string;
  stripeToken?: string;
};

export const create = async ({
  username,
  password,
  subscriptionId,
  stripeToken,
}: Props): Promise<User> => {
  // check for matching user befor doing anything, so we can
  // handle the stripe errors in the try/catch later
  const existingUser = await prisma.user.findFirst({
    where: { username },
  });
  if (existingUser) {
    throw new HttpInvalidInputError("email_already_registered");
  }
  const hashedPassword = hashPassword({ password });
  const verificationToken = createOneTimePassword({});
  let stripeSubscriptionId: string | null = null;
  const stripeCustomer = await createStripeCustomer({
    email: username,
  });
  if (subscriptionId && !stripeToken) {
    throw new HttpInvalidInputError(
      "stripeToken_required_if_subscriptionId_set"
    );
  }
  if (subscriptionId) {
    // TODO: store payment method
    const subscriptionData = await createSubscription({
      stripeCustomerId: stripeCustomer.id,
      subscriptionId,
    });
    stripeSubscriptionId = subscriptionData.stripeSubscription?.id || null;
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
          subscriptionId,
        },
      });
      if (stripeToken) {
        await addPaymentMethod({
          user,
          stripeToken,
          primary: true,
          prismaOverride: prisma,
        });
      }
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
    } catch (error: any) {
      throw new HttpInvalidInputError(error.message);
    }
  });
};
