import { stripe } from "../utils/stripe";
import Stripe from "stripe";
import { HttpInvalidInputError } from "../../errors";

export type Props = {
  email: string;
};
export const createStripeCustomer = async ({
  email,
}: Props): Promise<Stripe.Customer> => {
  try {
    const stripeCustomer = await stripe.customers.create({
      email,
    });
    return stripeCustomer;
  } catch (error: any) {
    throw new HttpInvalidInputError(error.message);
  }
};
