import { User } from "@prisma/client";
import request from "supertest";
import { app } from "../../src/app";
import { create } from "../../src/functions/account/create";
import { verifyUser } from "../../src/functions/account/verifyUser";
import { AuthToken } from "../../src/types";
import { loginTestHelper } from "../helpers/loginTestHelper";
import clearDatabase from "../setup";

const username = "user@example.com";
const password = "password";
let user: User;
let authToken: AuthToken;
const newStripePriceId = "sp_abc123";

const setup = async () => {
  user = await create({
    username,
    password,
  });
  await verifyUser({
    username,
    verificationToken: user.verificationToken || "",
  });
  const response = await loginTestHelper({
    username,
    password,
  });
  authToken = response.body.data;
};

beforeAll(async () => {
  await clearDatabase();
  await setup();
});

describe("Switching subscription plans", () => {
  test("Get the current plan", async () => {
    const endpoint = "/api/1.0/account/billing/subscription";
    const response = await request(app)
      .get(endpoint)
      .set("Authorization", `${authToken.tokenType} ${authToken.accessToken}`);
    expect(response.statusCode).toBe(200);
    expect(response.body.status).toBe("success");
    const subscription = response.body.data;
    expect(subscription.id).toBe(user.stripePriceId);
  });
  test("Switching subscription plans", async () => {
    const endpoint = "/api/1.0/account/billing/subscription";
    const data = {
      stripePriceId: newStripePriceId,
    };
    const response = await request(app)
      .post(endpoint)
      .set("Authorization", `${authToken.tokenType} ${authToken.accessToken}`)
      .send(data);
    expect(response.statusCode).toBe(200);
    expect(response.body.status).toBe("success");
    expect(response.body.message).toBe("subscription_changed");
    const newSubscriptionData = response.body.data;
    expect(newSubscriptionData.id).toBe(newStripePriceId);
  });
  test("Verifying the current plan changed", async () => {
    const endpoint = "/api/1.0/account/billing/subscription";
    const response = await request(app)
      .get(endpoint)
      .set("Authorization", `${authToken.tokenType} ${authToken.accessToken}`);
    expect(response.statusCode).toBe(200);
    expect(response.body.status).toBe("success");
    const subscription = response.body.data;
    expect(subscription.id).toBe(newStripePriceId);
  });
});
