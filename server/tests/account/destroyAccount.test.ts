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

describe("Test account destroy", () => {
  test("Can destroy account", async () => {
    const endpoint = "/api/1.0/account/destroy";
    const response = await request(app)
      .post(endpoint)
      .set("Authorization", `${authToken.tokenType} ${authToken.accessToken}`);
    expect(response.statusCode).toBe(200);
    expect(response.body.status).toBe("success");
    expect(response.body.message).toBe("user_removed");
  });
});
