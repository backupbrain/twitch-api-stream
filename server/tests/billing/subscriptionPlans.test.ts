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
const newStripePriceId = "price_1LRYhoFXDDb4rrbhYbcSMtsM";

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
      id: newStripePriceId,
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
  test("Cannot swiwch to invalid plan", async () => {
    const endpoint = "/api/1.0/account/billing/subscription";
    const data = {
      id: "bad_price_id",
    };
    const response = await request(app)
      .post(endpoint)
      .set("Authorization", `${authToken.tokenType} ${authToken.accessToken}`)
      .send(data);
    expect(response.statusCode).toBe(400);
    expect(response.body.status).toBe("error");
    expect(response.body.message).toBe("invalid_stripePriceId");
  });
  test("Verifying the plan didn't change", async () => {
    const endpoint = "/api/1.0/account/billing/subscription";
    const response = await request(app)
      .get(endpoint)
      .set("Authorization", `${authToken.tokenType} ${authToken.accessToken}`);
    expect(response.statusCode).toBe(200);
    expect(response.body.status).toBe("success");
    const subscription = response.body.data;
    expect(subscription.id).toBe(newStripePriceId);
  });
  test("Switch to free plan", async () => {
    const endpoint = "/api/1.0/account/billing/subscription";
    const data = {
      id: null,
    };
    const response = await request(app)
      .post(endpoint)
      .set("Authorization", `${authToken.tokenType} ${authToken.accessToken}`)
      .send(data);
    // expect(response.statusCode).toBe(200);
    // expect(response.body.status).toBe("success");
    // expect(response.body.message).toBe("invalid_stripePriceId");
    const newSubscriptionData = response.body.data;
    expect(newSubscriptionData.id).toBe(null);
  });
  test("Verifying the plan changed", async () => {
    const endpoint = "/api/1.0/account/billing/subscription";
    const response = await request(app)
      .get(endpoint)
      .set("Authorization", `${authToken.tokenType} ${authToken.accessToken}`);
    expect(response.statusCode).toBe(200);
    expect(response.body.status).toBe("success");
    const subscription = response.body.data;
    expect(subscription.id).toBe(null);
  });
});
