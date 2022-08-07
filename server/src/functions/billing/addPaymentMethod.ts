import { stripe } from "../utils/stripe";
import { User, PaymentMethod } from "@prisma/client";
import { HttpInvalidInputError } from "../../errors";
import { prisma } from "../../database/prisma";

export type Props = {
  user: User;
  stripeToken: string;
  primary: boolean;
  nickname?: string;
};
export const addPaymentMethod = async ({
  user,
  stripeToken,
  primary,
  nickname,
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
    const createdPaymentMethod = await prisma.paymentMethod.create({
      data: {
        userId: user.id,
        stripePaymentMethodId: paymentMethod.id,
        nickname,
        last4: paymentMethod.card?.last4,
        brand: paymentMethod.card?.brand,
        funding: paymentMethod.card?.funding,
        expirationMonth: paymentMethod.card?.exp_month,
        expirationYear: paymentMethod.card?.exp_year,
        isPrimary: primary,
      },
    });
    return createdPaymentMethod;
  } catch (error: any) {
    throw new HttpInvalidInputError(error.message);
  }
};
