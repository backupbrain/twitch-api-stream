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
    console.log({ body: response.body });
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
    expect(response.body.message).toBe(
      "Account already verified or doesn't exist"
    );
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
    expect(response.body.message).toBe("Email already registerd");
    expect(response.body.details).toMatchInlineSnapshot(`Array []`);
  });
});
