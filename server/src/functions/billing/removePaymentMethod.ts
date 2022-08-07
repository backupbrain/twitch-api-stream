import { stripe } from "../utils/stripe";
import { User } from "@prisma/client";
import { HttpInvalidInputError, HttpNotFoundError } from "../../errors";
import { prisma } from "../../database/prisma";

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
      await stripe.paymentMethods.detach(deletedPaymentMethod.id);
    }
  } catch (error: any) {
    throw new HttpInvalidInputError(error.message);
  }
};
