import Stripe from "stripe";
import { User } from "@prisma/client";
import { prisma } from "../../database/prisma";
import { HttpInvalidInputError } from "../../errors";
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2020-08-27",
});

export type Props = {
  user: User;
  id: string;
};
export const makePaymentMethodPrimary = async ({ user, id }: Props) => {
  return await prisma.$transaction(async (prisma) => {
    try {
      // TODO: update Stripe
      const primaryPaymentMethod = await prisma.paymentMethods.update({
        where: {
          userId: user.id,
          id,
        },
        data: {
          isPrimary: true,
        },
      });
      if (!primaryPaymentMethod) {
        throw new HttpInvalidInputError("invalid paymentMethodId");
      }
      await prisma.paymentMethods.updateMany({
        where: {
          userId: user.id,
          id: {
            ne: id,
          },
        },
        data: {
          isPrimary: false,
        },
      });
      return primaryPaymentMethod;
    } catch (error: any) {
      throw new HttpInvalidInputError(error.message);
    }
  });
};
