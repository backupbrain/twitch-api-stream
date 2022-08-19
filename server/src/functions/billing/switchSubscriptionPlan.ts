import { User } from "@prisma/client";
import Stripe from "stripe";
import { prisma } from "../../database/prisma";
import { HttpInvalidInputError } from "../../errors";
import { stripe } from "../utils/stripe";
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
    throw new HttpInvalidInputError("invalid_stripePriceId");
  }
  console.log({ stripePriceId });
  try {
    // TODO: handle case where we switch off the subscription
    let stripeSubscriptionId = user.stripeSubscriptionId;
    if (!user.stripeSubscriptionId) {
      const subscription = await createSubscription({
        stripeCustomerId: user.stripeCustomerId,
        stripePriceId,
      });
      stripeSubscriptionId = subscription.id;
    }
    console.log({ stripeSubscriptionId });
    const existingSubscription = await stripe.subscriptions.retrieve(
      stripeSubscriptionId!
    );
    console.log({ existingSubscription });
    const stripeSubscriptionItems: { [key: string]: any }[] = [];
    let didFindSamePlanId = false;
    existingSubscription.items.data.forEach((data) => {
      if (data.price.id !== stripePriceId) {
        stripeSubscriptionItems.push({
          id: data.price.id,
          deleted: true,
        });
      }
    });
    const updatedSubscription = await stripe.subscriptions.update(
      stripeSubscriptionId!,
      {
        items: stripeSubscriptionItems,
      }
    );
    if (stripePriceId) {
      await stripe.subscriptionItems.create({
        subscription: updatedSubscription.id,
        price: stripePriceId,
        quantity: 1,
      });
    }

    console.log({ stripePriceId });
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: { stripePriceId, stripeSubscriptionId },
    });
    console.log({ updatedUser });
    return updatedSubscription;
  } catch (error: any) {
    console.log("Error!!!");
    console.log(error);
    throw new HttpInvalidInputError(error.message);
  }
};
