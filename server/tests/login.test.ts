import { User } from "@prisma/client";
import request from "supertest";
import { app } from "../src/app";
import { prisma } from "../src/database/prisma";
import { create } from "../src/functions/account/create";
import { verifyUser } from "../src/functions/account/verifyUser";
import { resetUsageStats } from "../src/functions/rateLimit/resetUsageStats";
import { AuthToken } from "../src/types";
import clearDatabase from "./setup";

const username = "user@example.com";
const password = "password";
let user: User;
let authToken: AuthToken;

const unconfirmedUsername = "unconfirmed@example.com";
let unconfirmedUser: User;

const setup = async () => {
  user = await create({
    username,
    password,
  });
  await verifyUser({
    username,
    verificationToken: user.verificationToken || "",
  });
  unconfirmedUser = await create({
    username: unconfirmedUsername,
    password,
  });
};

beforeAll(async () => {
  await clearDatabase();
  await setup();
});

describe("Test login", () => {
  test("Login fails bad credentials", async () => {
    const endpoint = "/api/1.0/account/login";
    const data = {
      username,
      password: "badPassword",
    };
    const response = await request(app).post(endpoint).send(data);
    expect(response.statusCode).toBe(401);
    expect(response.body.status).toBe("error");
    expect(response.body.message).toBe("Unauthorized");
  });
  test("Login fails unconfirmed user", async () => {
    const endpoint = "/api/1.0/account/login";
    const data = {
      username: unconfirmedUsername,
      password,
    };
    const response = await request(app).post(endpoint).send(data);
    expect(response.statusCode).toBe(401);
    expect(response.body.status).toBe("error");
    expect(response.body.message).toBe("Unauthorized");
  });
  test("Login with correct credentials", async () => {
    const endpoint = "/api/1.0/account/login";
    const data = {
      username,
      password,
    };
    const response = await request(app).post(endpoint).send(data);
    expect(response.statusCode).toBe(200);
    const accessToken = await prisma.accessToken.findFirst({
      where: { userId: user.id },
    });
    if (!accessToken) {
      throw new Error("Auth token not created");
    }
    expect(response.statusCode).toBe(200);
    expect(response.body.status).toBe("success");
    expect(response.body.message).toBe("user_logged_in");
    expect(response.body.data.accessToken).toBe(accessToken.token);
    expect(response.body.data.refreshToken).toBe(accessToken.token);
    expect(response.body.data.expiresIn).toBeGreaterThan(0);
    expect(response.body.data.tokenType).toBe("Bearer");
    expect(response.body.data.scopes).toStrictEqual([]);
    authToken = response.body.data;
  });
  test("Bad token cannot access restricted area with no authorization", async () => {
    const endpoint = "/api/1.0/account/refresh";
    const response = await request(app).post(endpoint);
    expect(response.statusCode).toBe(403);
    expect(response.body.status).toBe("error");
    expect(response.body.message).toBe("No auth token provided");
  });
  test("Bad token cannot access restricted area with bad authorization", async () => {
    const endpoint = "/api/1.0/account/refresh";
    const response = await request(app)
      .post(endpoint)
      .set("Authorization", `${authToken.tokenType} abc123`);
    expect(response.statusCode).toBe(403);
    expect(response.body.status).toBe("error");
    expect(response.body.message).toBe("Unauthorized");
  });
  test("Can extend auth token", async () => {
    await resetUsageStats({ user });
    const endpoint = "/api/1.0/account/refresh";
    const response = await request(app)
      .post(endpoint)
      .set("Authorization", `${authToken.tokenType} ${authToken.accessToken}`);
    const accessToken = await prisma.accessToken.findFirst({
      where: { userId: user.id },
    });
    if (!accessToken) {
      throw new Error("Auth token not created");
    }
    expect(response.statusCode).toBe(200);
    expect(response.body.status).toBe("success");
    expect(response.body.message).toBe("login_token_refreshed");
    expect(response.body.data.accessToken).toBe(accessToken.token);
    expect(response.body.data.refreshToken).toBe(accessToken.token);
    expect(response.body.data.expiresIn).toBeGreaterThan(0);
    expect(response.body.data.tokenType).toBe("Bearer");
    expect(response.body.data.scopes).toStrictEqual([]);
  });

  test("Can log out", async () => {
    await resetUsageStats({ user });
    const endpoint = "/api/1.0/account/logout";
    const response = await request(app)
      .post(endpoint)
      .set("Authorization", `${authToken.tokenType} ${authToken.accessToken}`);
    expect(response.body.status).toBe("success");
    expect(response.body.message).toBe("user_logged_out");
    expect(response.statusCode).toBe(200);
    const accessToken = await prisma.accessToken.findFirst({
      where: {
        userId: user.id,
        expiresAt: {
          gte: new Date(),
        },
      },
    });
    expect(accessToken).toBe(null);
  });
  test("Cannot access restricted area after logout", async () => {
    const endpoint = "/api/1.0/account/refresh";
    const response = await request(app)
      .post(endpoint)
      .set("Authorization", `${authToken.tokenType} ${authToken.accessToken}`);
    expect(response.statusCode).toBe(403);
    expect(response.body.status).toBe("error");
    expect(response.body.message).toBe("Unauthorized");
  });
});
