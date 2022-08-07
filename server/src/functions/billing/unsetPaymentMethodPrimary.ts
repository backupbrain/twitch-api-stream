import { stripe } from "../utils/stripe";
import { User } from "@prisma/client";
import { HttpInvalidInputError } from "../../errors";

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
