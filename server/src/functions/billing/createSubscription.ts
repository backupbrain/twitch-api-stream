import { Subscription } from "@prisma/client";
import Stripe from "stripe";
import { prisma } from "../../database/prisma";
import { HttpInvalidInputError } from "../../errors";
import { stripe } from "../utils/stripe";

export const priceIds = [
  "price_1LRYZFFXDDb4rrbhP47KpuoU", // Basic
  "price_1LRYf8FXDDb4rrbh9fAhKiVc", // Intermediate
  "price_1LRYhoFXDDb4rrbhYbcSMtsM", // Advanced
];

export type Props = {
  stripeCustomerId: string;
  subscriptionId: string;
};
export type Result = {
  subscription?: Subscription;
  stripeSubscription?: Stripe.Subscription;
};
export const createSubscription = async ({
  stripeCustomerId,
  subscriptionId,
}: Props): Promise<Result> => {
  // TODO: match against stripe live/test mode
  const subscription = await prisma.subscription.findFirst({
    where: { id: subscriptionId, active: true },
  });
  if (!subscription) {
    throw new HttpInvalidInputError("invalid_subscriptionId");
  }
  try {
    const stripeSubscription = await stripe.subscriptions.create({
      customer: stripeCustomerId,
      items: [
        {
          price: subscription.stripePriceId,
        },
      ],
      payment_behavior: "default_incomplete",
      payment_settings: { save_default_payment_method: "on_subscription" },
      expand: ["latest_invoice.payment_intent"],
    });
    return {
      subscription,
      stripeSubscription,
    };
  } catch (error: any) {
    throw new HttpInvalidInputError(error.message);
  }
};
