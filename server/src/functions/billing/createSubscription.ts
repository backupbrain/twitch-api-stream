import Stripe from "stripe";
import { HttpInvalidInputError } from "../../errors";
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2020-08-27",
});

const priceIds = [
  "price_1LRYZFFXDDb4rrbhP47KpuoU", // Basic
  "price_1LRYf8FXDDb4rrbh9fAhKiVc", // Intermediate
  "price_1LRYhoFXDDb4rrbhYbcSMtsM", // Advanced
];

export type Props = {
  stripeCustomerId: string;
  stripePriceId: string;
};
export const createSubscription = async ({
  stripeCustomerId,
  stripePriceId,
}: Props): Promise<Stripe.Subscription> => {
  if (!priceIds.includes(stripePriceId)) {
    throw new HttpInvalidInputError("Invalid stripePriceId");
  }
  try {
    const stripeSubscription = await stripe.subscriptions.create({
      customer: stripeCustomerId,
      items: [
        {
          price: stripePriceId,
        },
      ],
      payment_behavior: "default_incomplete",
      payment_settings: { save_default_payment_method: "on_subscription" },
      expand: ["latest_invoice.payment_intent"],
    });
    return stripeSubscription;
  } catch (error: any) {
    throw new HttpInvalidInputError(error.message);
  }
};
