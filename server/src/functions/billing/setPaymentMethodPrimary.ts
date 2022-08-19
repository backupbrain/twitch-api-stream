import { PaymentMethod, User } from "@prisma/client";
import { prisma } from "../../database/prisma";
import { HttpInvalidInputError, HttpNotFoundError } from "../../errors";
import { stripe } from "../utils/stripe";

export type Props = {
  user: User;
  id: string;
  nickname?: string;
};
export const setPaymentMethodPrimary = async ({
  user,
  id,
  nickname,
}: Props): Promise<PaymentMethod> => {
  return await prisma.$transaction(async (prisma) => {
    try {
      // TODO: update Stripe
      const existingPaymentMethod = await prisma.paymentMethod.findFirst({
        where: { userId: user.id, id },
      });
      if (!existingPaymentMethod) {
        throw new HttpNotFoundError("Payment method not found");
      }
      if (user.stripeSubscriptionId) {
        await stripe.subscriptions.update(user.stripeSubscriptionId, {
          default_payment_method: existingPaymentMethod.stripePaymentMethodId,
        });
      }
      await prisma.paymentMethod.updateMany({
        where: {
          userId: user.id,
          id: { not: id },
        },
        data: {
          isPrimary: false,
        },
      });
      const updatedPaymentMethod = await prisma.paymentMethod.update({
        where: { id },
        data: { isPrimary: true, nickname },
      });
      return updatedPaymentMethod;
    } catch (error: any) {
      throw new HttpInvalidInputError(error.message);
    }
  });
};
