import { User, PaymentMethod } from "@prisma/client";
import { prisma } from "../../database/prisma";

export type Props = {
  user: User;
};
export const getPaymentMethods = async ({
  user,
}: Props): Promise<PaymentMethod[]> => {
  const paymentMethods = await prisma.paymentMethod.findMany({
    where: {
      userId: user.id,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
  return paymentMethods;
};
