import Stripe from "stripe";
import { PaymentMethod, User } from "@prisma/client";
import { prisma } from "../../database/prisma";
import { HttpNotFoundError } from "../../errors";
import { makePaymentMethodPrimary } from "./makePaymentMethodPrimary";
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2020-08-27",
});

export type Props = {
  user: User;
  id: string;
  isPrimary: boolean;
  nickname?: string;
};
export const updatePaymentMethod = async ({
  user,
  id,
  isPrimary,
  nickname,
}: Props): Promise<PaymentMethod> => {
  const existingPaymentMethod = await prisma.paymentMethod.findFirst({
    where: {
      userId: user.id,
      id,
    },
  });
  if (!existingPaymentMethod) {
    throw new HttpNotFoundError("Payment method not found");
  }
  if (isPrimary) {
    await makePaymentMethodPrimary({
      user,
      id,
    });
  } else {
    // TODO: remove
    if (user.stripeSubscriptionId) {
      await stripe.subscriptions.update(user.stripeSubscriptionId, {
        default_payment_method: undefined,
      });
    }
  }
  const updatedPaymentMethod = await prisma.paymentMethod.update({
    where: { id },
    data: { nickname, isPrimary },
  });
  return updatedPaymentMethod;
};
