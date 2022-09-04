import { User } from "@prisma/client";
import Stripe from "stripe";
import { prisma } from "../../database/prisma";
import { HttpInvalidInputError } from "../../errors";
import { stripe } from "../utils/stripe";
import {
  createSubscription,
  Result as CreateSubscriptionResult,
} from "./createSubscription";

export type StripeSubscriptionProps = {
  user: User;
  subscriptionId?: string | null;
};
export const retrieveOrCreateStripeSubscription = async ({
  user,
  subscriptionId,
}: StripeSubscriptionProps): Promise<CreateSubscriptionResult | undefined> => {
  if (!user.stripeSubscriptionId) {
    if (subscriptionId) {
      const subscriptionData = await createSubscription({
        stripeCustomerId: user.stripeCustomerId,
        subscriptionId,
      });
      return subscriptionData;
    } else {
      return undefined;
    }
  } else {
    const stripeSubscription = await stripe.subscriptions.retrieve(
      user.stripeSubscriptionId
    );
    return { subscription: undefined, stripeSubscription };
  }
};

export type Props = {
  user: User;
  subscriptionId: string | null;
};
export const switchSubscriptionPlan = async ({
  user,
  subscriptionId,
}: Props): Promise<Stripe.Subscription | null> => {
  try {
    if (subscriptionId) {
      // paid plan
      // TODO: match this plan against testing/live mode
      const subscription = await prisma.subscription.findFirst({
        where: { id: subscriptionId, active: true },
      });
      if (!subscription) {
        throw new HttpInvalidInputError("invalid_subscriptionId");
      }
      let subscriptionData: CreateSubscriptionResult | undefined = undefined;
      try {
        subscriptionData = await retrieveOrCreateStripeSubscription({
          user,
          subscriptionId,
        });
      } catch (error: any) {
        throw new HttpInvalidInputError(error.message);
      }
      if (!subscriptionData?.stripeSubscription) {
        throw new HttpInvalidInputError("cannot_retrive_stripe_subscription");
      }
      if (!subscriptionData?.subscription) {
        throw new HttpInvalidInputError("cannot_retrive_subscription");
      }
      let didFindExistingPriceId = false;
      const stripeSubscriptionItems: { [key: string]: any }[] = [];
      subscriptionData?.stripeSubscription.items.data.forEach((data) => {
        if (data.price.id === subscription.stripePriceId) {
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
          subscription: subscriptionData?.stripeSubscription.id!,
          price: subscription.stripePriceId,
          quantity: 1,
        });
      }
      const updatedSubscription = await stripe.subscriptions.update(
        subscriptionData?.stripeSubscription.id!,
        {
          items: stripeSubscriptionItems,
        }
      );
      await prisma.user.update({
        where: { id: user.id },
        data: {
          subscriptionId: subscriptionData.subscription.id,
          stripeSubscriptionId: updatedSubscription.id,
        },
      });
      return updatedSubscription;
    } else {
      // free plan
      const stripeSubscription = await retrieveOrCreateStripeSubscription({
        user,
        subscriptionId,
      });
      if (stripeSubscription) {
        await stripe.subscriptions.cancel(
          stripeSubscription.stripeSubscription?.id!
        );
      }
      let newSubscriptionId = stripeSubscription?.subscription?.id || null;
      await prisma.user.update({
        where: { id: user.id },
        data: { subscriptionId: newSubscriptionId, stripeSubscriptionId: null },
      });
      return null;
    }
  } catch (error: any) {
    throw new HttpInvalidInputError(error.message);
  }
};
