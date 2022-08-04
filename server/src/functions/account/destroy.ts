import Stripe from "stripe";
import { User } from "@prisma/client";
import { HttpInvalidInputError } from "../../errors";
import { prisma } from "../../database/prisma";
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2020-08-27",
});

export type Props = {
  user: User;
};
export const destroyAccount = async ({ user }: Props) => {
  try {
    if (user.stripeSubscriptionId) {
      await stripe.subscriptions.del(user.stripeSubscriptionId);
    }
    await prisma.user.delete({
      where: { id: user.id },
    });
  } catch (error: any) {
    throw new HttpInvalidInputError(error.message);
  }
};
