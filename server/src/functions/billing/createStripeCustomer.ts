import Stripe from "stripe";
import { HttpInvalidInputError } from "../../errors";
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2020-08-27",
});

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
