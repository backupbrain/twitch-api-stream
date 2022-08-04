import Stripe from "stripe";
import { PaymentMethod, User } from "@prisma/client";
import { prisma } from "../../database/prisma";
import { HttpInvalidInputError, HttpNotFoundError } from "../../errors";
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2020-08-27",
});

export type Props = {
  user: User;
  id: string;
};
export const makePaymentMethodPrimary = async ({
  user,
  id,
}: Props): Promise<PaymentMethod> => {
  return await prisma.$transaction(async (prisma) => {
    try {
      // TODO: update Stripe
      const existingPaymentMethod = await prisma.paymentMethod.findFirst({
        where: {
          userId: user.id,
          id,
        },
      });
      if (!existingPaymentMethod) {
        throw new HttpNotFoundError("Payment method not found");
      }
      await prisma.paymentMethod.updateMany({
        where: {
          userId: user.id,
          id: {
            not: id,
          },
        },
        data: {
          isPrimary: false,
        },
      });
      await prisma.paymentMethod.updateMany({
        where: {
          userId: user.id,
          id,
        },
        data: {
          isPrimary: true,
        },
      });
      const primaryPaymentMethod = await prisma.paymentMethod.findFirst({
        where: {
          userId: user.id,
          id,
        },
      });
      if (!primaryPaymentMethod) {
        throw new HttpNotFoundError("Payment method not found");
      }
      return primaryPaymentMethod;
    } catch (error: any) {
      throw new HttpInvalidInputError(error.message);
    }
  });
};
