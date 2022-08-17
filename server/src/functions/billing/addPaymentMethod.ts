import { PaymentMethod, Prisma, PrismaClient, User } from "@prisma/client";
import { prisma } from "../../database/prisma";
import { HttpInvalidInputError } from "../../errors";
import { stripe } from "../utils/stripe";

export type Props = {
  user: User;
  stripeToken: string;
  primary: boolean;
  nickname?: string;
  prismaOverride?: Prisma.TransactionClient | PrismaClient;
};
export const addPaymentMethod = async ({
  user,
  stripeToken,
  primary,
  nickname,
  prismaOverride,
}: Props): Promise<PaymentMethod> => {
  try {
    const paymentMethod = await stripe.paymentMethods.create({
      type: "card",
      card: {
        token: stripeToken,
      },
    });
    await stripe.paymentMethods.attach(paymentMethod.id, {
      customer: user.stripeCustomerId,
    });
    if (primary) {
      await stripe.customers.update(user.stripeCustomerId, {
        invoice_settings: { default_payment_method: paymentMethod.id },
      });
    }
    let activePrisma: Prisma.TransactionClient | PrismaClient = prisma;
    if (prismaOverride) {
      activePrisma = prismaOverride;
    }
    const createdPaymentMethod = await activePrisma.paymentMethod.create({
      data: {
        stripePaymentMethodId: paymentMethod.id,
        nickname,
        last4: paymentMethod.card?.last4,
        brand: paymentMethod.card?.brand,
        funding: paymentMethod.card?.funding,
        expirationMonth: paymentMethod.card?.exp_month,
        expirationYear: paymentMethod.card?.exp_year,
        isPrimary: primary,
        user: {
          connect: { id: user.id },
        },
      },
    });
    return createdPaymentMethod;
  } catch (error: any) {
    throw new HttpInvalidInputError(error.message);
  }
};
