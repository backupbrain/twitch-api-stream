import { User, PaymentMethod } from "@prisma/client";
import { prisma } from "../../database/prisma";

export type Props = {
  user: User;
  id: string;
};
export const getPaymentMethods = async ({
  user,
  id,
}: Props): Promise<PaymentMethod> => {
  const paymentMethod = await prisma.paymentMethods.findFirst({
    where: {
      userId: user.id,
      id,
    },
  });
  return paymentMethod;
};
