import { User } from "@prisma/client";
import { prisma } from "../../database/prisma";
import { HttpInvalidInputError, HttpNotFoundError } from "../../errors";
import { stripe } from "../utils/stripe";

export type Props = {
  user: User;
  id: string;
};
export const removePaymentMethod = async ({ user, id }: Props) => {
  try {
    const existingPaymentMethod = await prisma.paymentMethod.findFirst({
      where: {
        userId: user.id,
        id,
      },
    });
    if (!existingPaymentMethod) {
      throw new HttpNotFoundError("Payment method not found");
    }
    const deletedPaymentMethod = await prisma.paymentMethod.delete({
      where: {
        id,
      },
    });
    if (deletedPaymentMethod) {
      await stripe.paymentMethods.detach(
        deletedPaymentMethod.stripePaymentMethodId
      );
    }
  } catch (error: any) {
    throw new HttpInvalidInputError(error.message);
  }
};
