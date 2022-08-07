import { PaymentMethod, User } from "@prisma/client";
import { prisma } from "../../database/prisma";
import { HttpNotFoundError } from "../../errors";
import { setPaymentMethodPrimary } from "./setPaymentMethodPrimary";
import { unsetPaymentMethodPrimary } from "./unsetPaymentMethodPrimary";

export type Props = {
  user: User;
  id: string;
  isPrimary: boolean;
  nickname?: string;
};
export const updatePaymentMethod = async ({
  user,
  id,
  isPrimary,
  nickname,
}: Props): Promise<PaymentMethod> => {
  const existingPaymentMethod = await prisma.paymentMethod.findFirst({
    where: {
      userId: user.id,
      id,
    },
  });
  if (!existingPaymentMethod) {
    throw new HttpNotFoundError("Payment method not found");
  }
  if (isPrimary) {
    await setPaymentMethodPrimary({
      user,
      id,
    });
  } else {
    await unsetPaymentMethodPrimary({
      user,
      id,
    });
  }
  const updatedPaymentMethod = await prisma.paymentMethod.update({
    where: { id },
    data: { nickname, isPrimary },
  });
  return updatedPaymentMethod;
};
