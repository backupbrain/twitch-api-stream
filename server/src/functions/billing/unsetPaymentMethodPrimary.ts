import { PaymentMethod, User } from "@prisma/client";
import { prisma } from "../../database/prisma";
import { HttpInvalidInputError, HttpNotFoundError } from "../../errors";
import { stripe } from "../utils/stripe";

export type Props = {
  user: User;
  id: string;
  nickname?: string;
};
export const unsetPaymentMethodPrimary = async ({
  user,
  id,
  nickname,
}: Props): Promise<PaymentMethod> => {
  const existingPaymentMethod = await prisma.paymentMethod.findFirst({
    where: { id, userId: user.id },
  });
  if (!existingPaymentMethod) {
    throw new HttpNotFoundError("Payment method not found");
  }
  try {
    if (user.stripeSubscriptionId) {
      await stripe.subscriptions.update(user.stripeSubscriptionId, {
        default_payment_method: undefined,
      });
    }
    const updatedPaymentMethod = await prisma.paymentMethod.update({
      where: { id },
      data: { isPrimary: false, nickname },
    });
    return updatedPaymentMethod;
  } catch (error: any) {
    throw new HttpInvalidInputError(error.message);
  }
};
