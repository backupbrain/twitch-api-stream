import { User, PaymentMethod } from "@prisma/client";
import { prisma } from "../../database/prisma";
import { HttpNotFoundError } from "../../errors";

export type Props = {
  user: User;
  id: string;
};
export const getPaymentMethods = async ({
  user,
  id,
}: Props): Promise<PaymentMethod> => {
  const paymentMethod = await prisma.paymentMethod.findFirst({
    where: {
      userId: user.id,
      id,
    },
  });
  if (!paymentMethod) {
    throw new HttpNotFoundError("Payment method not found");
  }
  return paymentMethod;
};
