import request from "supertest";
import { app } from "../../src/app";
import { prisma } from "../../src/database/prisma";
import clearDatabase from "../setup";

// TODO: create test database

beforeAll(async () => {
  await clearDatabase();
});

describe("Test registration", () => {
  const username = "user@example.com";
  const password = "password";
  let verificationToken = "";

  // TODO: test if user tries to create a subscription without a stripeToken
  test("User should be able to register", async () => {
    const endpoint = "/api/1.0/account/create";
    const data = {
      username,
      password,
    };
    const response = await request(app).post(endpoint).send(data);
    expect(response.statusCode).toBe(200);
    expect(response.body.status).toBe("success");
    expect(response.body.message).toBe("user_created");
    // get the user's verification code
    const user = await prisma.user.findFirst({
      where: { username },
    });
    if (!user) {
      throw Error("Could not find user");
    }
    verificationToken = user?.verificationToken || "";
    expect(verificationToken.length).toBe(6);
    expect(user?.isConfirmed).toBe(false);
  });

  test(
    "User should be able to register with paid plan",
    async () => {
      const endpoint = "/api/1.0/account/create";
      const stripeToken = "tok_visa";
      const subscriptionId = "95642f7a-d172-446f-a408-ebf310242a94";
      const data = {
        username: "user1@example.com",
        password,
        stripeToken,
        subscriptionId,
      };
      const response = await request(app).post(endpoint).send(data);
      expect(response.statusCode).toBe(200);
      expect(response.body.status).toBe("success");
      expect(response.body.message).toBe("user_created");
      // get the user's verification code
      const user = await prisma.user.findFirst({
        where: { username },
      });
      if (!user) {
        throw Error("Could not find user");
      }
      verificationToken = user?.verificationToken || "";
      expect(verificationToken.length).toBe(6);
      expect(user?.isConfirmed).toBe(false);
    },
    10 * 1000
  );

  test("Error when confirming choosing a plan with no stripeToken", async () => {
    const endpoint = "/api/1.0/account/create";
    const subscriptionId = "95642f7a-d172-446f-a408-ebf310242a94";
    const data = {
      username: "user2@example.com",
      password,
      subscriptionId,
    };
    const response = await request(app).post(endpoint).send(data);
    expect(response.statusCode).toBe(400);
    expect(response.body.status).toBe("error");
    expect(response.body.message).toBe(
      "stripeToken_required_if_subscriptionId_set"
    );
  });

  test("Error when confirming bad code", async () => {
    const badVerificationToken = "123456";
    const endpoint = "/api/1.0/account/verify";
    const data = {
      username,
      verificationToken: badVerificationToken,
    };
    const response = await request(app).post(endpoint).send(data);
    expect(response.statusCode).toBe(400);
    expect(response.body.status).toBe("error");
    expect(response.body.message).toBe("user_registered_or_verified");
    expect(response.body.details).toMatchInlineSnapshot(`Array []`);
  });

  test("Verify user", async () => {
    const endpoint = "/api/1.0/account/verify";
    const data = {
      username,
      verificationToken,
    };
    const response = await request(app).post(endpoint).send(data);
    expect(response.statusCode).toBe(200);
    expect(response.body.status).toBe("success");
    expect(response.body.message).toBe("user_verified");
  });

  test("User can't sign up under same name", async () => {
    const endpoint = "/api/1.0/account/create";
    const data = {
      username,
      password: "abc123",
    };
    const response = await request(app).post(endpoint).send(data);
    expect(response.statusCode).toBe(400);
    expect(response.body.status).toBe("error");
    expect(response.body.message).toBe("email_already_registered");
    expect(response.body.details).toMatchInlineSnapshot(`Array []`);
  });
});
