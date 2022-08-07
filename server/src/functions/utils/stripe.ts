require("dotenv").config();
import Stripe from "stripe";

if (!process.env.STRIPE_SECRET_KEY) {
  console.error(".env file doesn't have a STRIPE_SECRET_KEY");
  process.exit(1);
}
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2020-08-27",
});
