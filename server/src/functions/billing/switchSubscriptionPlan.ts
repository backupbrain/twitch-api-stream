import { User } from "@prisma/client";
import Stripe from "stripe";
import { prisma } from "../../database/prisma";
import { HttpInvalidInputError } from "../../errors";
import { stripe } from "../utils/stripe";
import { createSubscription, priceIds } from "./createSubscription";

export type StripeSubscriptionProps = {
  user: User;
  stripePriceId?: string | null;
};
export const retrieveOrCreateStripeSubscription = async ({
  user,
  stripePriceId,
}: StripeSubscriptionProps): Promise<Stripe.Subscription | undefined> => {
  if (!user.stripeSubscriptionId) {
    if (stripePriceId) {
      const subscription = await createSubscription({
        stripeCustomerId: user.stripeCustomerId,
        stripePriceId,
      });
      return subscription;
    } else {
      return undefined;
    }
  } else {
    const subscription = await stripe.subscriptions.retrieve(
      user.stripeSubscriptionId
    );
    return subscription;
  }
};

export type Props = {
  user: User;
  stripePriceId: string | null;
};
export const switchSubscriptionPlan = async ({
  user,
  stripePriceId,
}: Props): Promise<Stripe.Subscription | null> => {
  try {
    if (stripePriceId) {
      // paid plan
      if (!priceIds.includes(stripePriceId)) {
        throw new HttpInvalidInputError("invalid_stripePriceId");
      }
      let stripeSubscription: Stripe.Subscription | undefined = undefined;
      try {
        stripeSubscription = await retrieveOrCreateStripeSubscription({
          user,
          stripePriceId,
        });
      } catch (error: any) {
        throw new HttpInvalidInputError(error.message);
      }
      if (!stripeSubscription) {
        throw new HttpInvalidInputError("cannot_retrive_stripe_subscription");
      }
      let didFindExistingPriceId = false;
      const stripeSubscriptionItems: { [key: string]: any }[] = [];
      stripeSubscription.items.data.forEach((data) => {
        if (data.price.id === stripePriceId) {
          didFindExistingPriceId = true;
          stripeSubscriptionItems.push({
            id: data.id,
            quantity: 1,
          });
        } else {
          stripeSubscriptionItems.push({
            id: data.id,
            deleted: true,
          });
        }
      });
      if (!didFindExistingPriceId) {
        await stripe.subscriptionItems.create({
          subscription: stripeSubscription.id!,
          price: stripePriceId,
          quantity: 1,
        });
      }
      const updatedSubscription = await stripe.subscriptions.update(
        stripeSubscription.id!,
        {
          items: stripeSubscriptionItems,
        }
      );
      await prisma.user.update({
        where: { id: user.id },
        data: { stripePriceId, stripeSubscriptionId: updatedSubscription.id },
      });
      return updatedSubscription;
    } else {
      // free plan
      const stripeSubscription = await retrieveOrCreateStripeSubscription({
        user,
        stripePriceId,
      });
      if (stripeSubscription) {
        await prisma.user.update({
          where: { id: user.id },
          data: { stripePriceId, stripeSubscriptionId: stripeSubscription.id },
        });
        // turn off subscription
        const stripeSubscriptionItems: { [key: string]: any }[] = [];
        stripeSubscription.items.data.forEach((data) => {
          if (data.price.id !== stripePriceId) {
            stripeSubscriptionItems.push({
              id: data.id,
              deleted: true,
            });
          }
        });
        const res = await stripe.subscriptions.cancel(stripeSubscription.id);
        await prisma.user.update({
          where: { id: user.id },
          data: { stripePriceId, stripeSubscriptionId: null },
        });
        return null;
      } else {
        await prisma.user.update({
          where: { id: user.id },
          data: { stripePriceId, stripeSubscriptionId: null },
        });
        return null;
      }
    }
  } catch (error: any) {
    throw new HttpInvalidInputError(error.message);
  }
};
