import { User } from "@prisma/client";
import request from "supertest";
import { app } from "../../src/app";
import { prisma } from "../../src/database/prisma";
import { create } from "../../src/functions/account/create";
import { verifyUser } from "../../src/functions/account/verifyUser";
import { resetUsageStats } from "../../src/functions/rateLimit/resetUsageStats";
import { AuthToken } from "../../src/types";
import { loginTestHelper } from "../helpers/loginTestHelper";
import clearDatabase from "../setup";

const username = "user@example.com";
const oldPassword = "oldPassword";
const password = "password";
let user: User;
let authToken: AuthToken;
let passwordResetToken1 = "";
let passwordResetToken2 = "";

const unconfirmedUsername = "unconfirmed@example.com";
let unconfirmedUser: User;

const setup = async () => {
  user = await create({
    username,
    password: oldPassword,
  });
  await verifyUser({
    username,
    verificationToken: user.verificationToken || "",
  });
  unconfirmedUser = await create({
    username: unconfirmedUsername,
    password: oldPassword,
  });
};

beforeAll(async () => {
  await clearDatabase();
  await setup();
});

describe("Change password", () => {
  let authToken: AuthToken | undefined = undefined;
  test("Fails bad credentials", async () => {
    const endpoint = "/api/1.0/account/password/reset";
    const data = {
      username: "badusername@example.com",
    };
    const response = await request(app).post(endpoint).send(data);
    expect(response.statusCode).toBe(400);
    expect(response.body.status).toBe("error");
    expect(response.body.message).toBe("username_not_found");
  });
  test("Token created with good credentials, unverified user", async () => {
    const endpoint = "/api/1.0/account/password/reset";
    const data = {
      username: unconfirmedUsername,
    };
    const response = await request(app).post(endpoint).send(data);
    expect(response.statusCode).toBe(200);
    expect(response.body.status).toBe("success");
    expect(response.body.message).toBe("password_reset_token_created");
    const user = await prisma.user.findFirst({
      where: { username: unconfirmedUsername },
    });
    expect(user).not.toBe(null);
    expect(typeof user?.resetPasswordToken).toBe("string");
    expect(typeof user?.resetPasswordTokenExpiration).toBe("object");
    const now = new Date();
    expect(user?.resetPasswordTokenExpiration?.getTime()).toBeGreaterThan(
      now.getTime()
    );
    passwordResetToken1 = user?.resetPasswordToken || "";
  });
  test("Token created with good credentials, verified user", async () => {
    const endpoint = "/api/1.0/account/password/reset";
    const data = {
      username,
    };
    const response = await request(app).post(endpoint).send(data);
    expect(response.statusCode).toBe(200);
    expect(response.body.status).toBe("success");
    expect(response.body.message).toBe("password_reset_token_created");
    const user = await prisma.user.findFirst({
      where: { username },
    });
    expect(user).not.toBe(null);
    expect(typeof user?.resetPasswordToken).toBe("string");
    expect(typeof user?.resetPasswordTokenExpiration).toBe("object");
    const now = new Date();
    expect(user?.resetPasswordTokenExpiration?.getTime()).toBeGreaterThan(
      now.getTime()
    );
    passwordResetToken2 = user?.resetPasswordToken || "";
  });
  test("Reset fails with bad token", async () => {
    const endpoint = "/api/1.0/account/password/reset/set";
    const data = {
      username,
      password,
      token: "badToken",
    };
    const response = await request(app).post(endpoint).send(data);
    expect(response.statusCode).toBe(400);
    expect(response.body.status).toBe("error");
    expect(response.body.message).toBe("invalid_or_expired_token");
  });
  test("Reset succeeds with good token", async () => {
    const endpoint = "/api/1.0/account/password/reset/set";
    const data = {
      username,
      password,
      token: passwordResetToken2,
    };
    const response = await request(app).post(endpoint).send(data);
    expect(response.statusCode).toBe(200);
    expect(response.body.status).toBe("success");
    expect(response.body.message).toBe("password_changed");
  });
  test("Bad token cannot access restricted area with no authorization", async () => {
    const endpoint = "/api/1.0/account/refresh";
    const response = await request(app).post(endpoint);
    expect(response.statusCode).toBe(403);
    expect(response.body.status).toBe("error");
    expect(response.body.message).toBe("No auth token provided");
  });
  test("Bad token cannot access restricted area with bad authorization", async () => {
    const loginResponse = await loginTestHelper({ username, password });
    authToken = loginResponse.body.data;
    const endpoint = "/api/1.0/account/refresh";
    const response = await request(app)
      .post(endpoint)
      .set("Authorization", `${authToken?.tokenType} abc123`);
    expect(response.statusCode).toBe(403);
    expect(response.body.status).toBe("error");
    expect(response.body.message).toBe("Unauthorized");
  });
  test("Can extend auth token", async () => {
    await resetUsageStats({ user });
    const endpoint = "/api/1.0/account/refresh";
    const response = await request(app)
      .post(endpoint)
      .set(
        "Authorization",
        `${authToken?.tokenType} ${authToken?.accessToken}`
      );
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
      .set(
        "Authorization",
        `${authToken?.tokenType} ${authToken?.accessToken}`
      );
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
      .set(
        "Authorization",
        `${authToken?.tokenType} ${authToken?.accessToken}`
      );
    expect(response.statusCode).toBe(403);
    expect(response.body.status).toBe("error");
    expect(response.body.message).toBe("Unauthorized");
  });
});
