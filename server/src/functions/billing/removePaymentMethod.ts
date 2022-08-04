import Stripe from "stripe";
import { User } from "@prisma/client";
import { HttpInvalidInputError } from "../../errors";
import { prisma } from "../../database/prisma";
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2020-08-27",
});

export type Props = {
  user: User;
  id: string;
};
export const removePaymentMethod = async ({ user, id }: Props) => {
  try {
    const deletedPaymentMethod = await prisma.paymentMethods.delete({
      where: {
        id,
        userId: user.id,
      },
    });
    if (deletedPaymentMethod) {
      await stripe.paymentMethods.detach(deletedPaymentMethod.id);
    }
  } catch (error: any) {
    throw new HttpInvalidInputError(error.message);
  }
};
