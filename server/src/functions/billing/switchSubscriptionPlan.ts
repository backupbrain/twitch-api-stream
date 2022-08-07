import { stripe } from "../utils/stripe";
import { User } from "@prisma/client";
import Stripe from "stripe";
import { prisma } from "../../database/prisma";
import { HttpInvalidInputError } from "../../errors";
import { createSubscription, priceIds } from "./createSubscription";

export type Props = {
  user: User;
  stripePriceId: string;
};
export const switchSubscriptionPlan = async ({
  user,
  stripePriceId,
}: Props): Promise<Stripe.Subscription> => {
  if (!priceIds.includes(stripePriceId)) {
    throw new HttpInvalidInputError("Invalid stripePriceId");
  }
  try {
    if (!user.stripeSubscriptionId) {
      const subscription = createSubscription({
        stripeCustomerId: user.stripeCustomerId,
        stripePriceId,
      });
      return subscription;
    }
    const existingSubscription = await stripe.subscriptions.retrieve(
      user.stripeSubscriptionId
    );
    let existingPriceId = existingSubscription.items.data[0].price.id;
    const updatedSubscription = await stripe.subscriptions.update(
      user.stripeSubscriptionId,
      {
        items: [
          {
            id: existingPriceId,
            deleted: true,
          },
          {
            id: stripePriceId,
            quantity: 1,
          },
        ],
      }
    );
    await prisma.user.update({
      where: { id: user.id },
      data: { stripePriceId },
    });
    return updatedSubscription;
  } catch (error: any) {
    throw new HttpInvalidInputError(error.message);
  }
};
