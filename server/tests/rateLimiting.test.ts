import request from "supertest";
import { app } from "../src/app";
import { User } from "@prisma/client";
import { prisma } from "../src/database/prisma";
import { create } from "../src/functions/account/create";
import clearDatabase from "./setup";
import { verifyUser } from "../src/functions/account/verifyUser";
import { AuthToken } from "../src/types";
import { login } from "../src/functions/account/login";

const username = "user@example.com";
const password = "password";
let user: User;
let authToken: AuthToken;

const setup = async () => {
  user = await create({
    username,
    password,
  });
  await verifyUser({
    username,
    verificationToken: user.verificationToken || "",
  });
  authToken = await login({ username, password });
};

beforeAll(async () => {
  await clearDatabase();
  await setup();
});

describe("", () => {
  test("Endpoint works first run", async () => {
    const apiStats = await prisma.apiStats.findUnique({
      where: { userId: user.id },
    });
    if (!apiStats) {
      throw new Error("Could not fetch API Stats for user");
    }
    const endpoint = "/api/1.0/account/stats";
    const response = await request(app)
      .get(endpoint)
      .set("Authorization", `${authToken.tokenType} ${authToken.accessToken}`);
    expect(response.statusCode).toBe(200);
    const stats = response.body.data;
    expect(stats.accountBirthday).toBe(apiStats.accountBirthday.toISOString());
    expect(stats.billingPeriodEnd).toBe(
      apiStats.billingPeriodEnd.toISOString()
    );
    expect(stats.billingPeriodStart).toBe(
      apiStats.billingPeriodStart.toISOString()
    );
    expect(stats.numApiCallsAllowedInPeriod).toBe(
      apiStats.numApiCallsAllowedInPeriod
    );
    expect(stats.numApiCallsRemainingInBillingPeriod).toBe(
      apiStats.numApiCallsAllowedInPeriod - 1
    );
    expect(stats.numApiCallsSinceBillingStart).toBe(1);
    expect(stats.numApiCallsSinceAccountBirthday).toBe(1);
    const now = new Date();
    const timeSinceApiCall =
      now.getTime() - new Date(stats.lastApiCall).getTime();
    expect(timeSinceApiCall).toBeLessThan(10);
  });
  test.skip("Rate limit prevents fast api calls", async () => {
    const endpoint = "/api/1.0/account/stats";
    const response = await request(app)
      .get(endpoint)
      .set("Authorization", `${authToken.tokenType} ${authToken.accessToken}`);
    expect(response.statusCode).toBe(429);
  });
  // exceeding api call limit works
  // test if the date roll-over works
});
