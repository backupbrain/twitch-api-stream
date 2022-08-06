import Stripe from "stripe";
import { User } from "@prisma/client";
import { HttpInvalidInputError } from "../../errors";
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2020-08-27",
});

export type Props = {
  user: User;
  id: string;
};
export const unsetPaymentMethodPrimary = async ({ user, id }: Props) => {
  if (user.stripeSubscriptionId) {
    try {
      await stripe.subscriptions.update(user.stripeSubscriptionId, {
        default_payment_method: undefined,
      });
    } catch (error: any) {
      throw new HttpInvalidInputError(error.message);
    }
  }
};
