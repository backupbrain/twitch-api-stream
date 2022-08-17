import { User } from "@prisma/client";
import { prisma } from "../../database/prisma";
import { HttpInvalidInputError } from "../../errors";
import { stripe } from "../utils/stripe";

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
