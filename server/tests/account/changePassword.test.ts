import { User } from "@prisma/client";
import request from "supertest";
import { app } from "../../src/app";
import { prisma } from "../../src/database/prisma";
import { create } from "../../src/functions/account/create";
import { verifyUser } from "../../src/functions/account/verifyUser";
import { verifyPassword } from "../../src/functions/utils/verifyPassword";
import { AuthToken } from "../../src/types";
import { loginTestHelper } from "../helpers/loginTestHelper";
import clearDatabase from "../setup";

const username = "user@example.com";
const oldPassword = "oldPassword";
const newPassword = "password";
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
  const response = await loginTestHelper({
    username,
    password: oldPassword,
  });
  authToken = response.body.data;
};

beforeAll(async () => {
  await clearDatabase();
  await setup();
});

describe("Change password", () => {
  test(
    "Fails bad old password",
    async () => {
      const endpoint = "/api/1.0/account/password/change";
      const data = {
        oldPassword: "badoldpassword",
        newPassword,
      };
      const response = await request(app)
        .post(endpoint)
        .set("Authorization", `${authToken.tokenType} ${authToken.accessToken}`)
        .send(data);
      expect(response.statusCode).toBe(400);
      expect(response.body.status).toBe("error");
      expect(response.body.message).toBe("field_oldpassword_incorrect");
    },
    10 * 1000
  );
  test("Password changed", async () => {
    const endpoint = "/api/1.0/account/password/change";
    const data = {
      oldPassword,
      newPassword,
    };
    const response = await request(app)
      .post(endpoint)
      .set("Authorization", `${authToken.tokenType} ${authToken.accessToken}`)
      .send(data);
    expect(response.statusCode).toBe(200);
    expect(response.body.status).toBe("success");
    expect(response.body.message).toBe("password_changed");
    const user = await prisma.user.findFirst({
      where: { username },
    });
    expect(user).not.toBe(null);
    expect(user?.hashedPassword).not.toBe(undefined);
    const doesPasswordVerify = verifyPassword({
      password: newPassword,
      hashedPassword: user?.hashedPassword!,
    });
    expect(doesPasswordVerify).toBe(true);
  });
  test("User can log in with new password", async () => {
    const response = await loginTestHelper({
      username,
      password: newPassword,
    });
    expect(response.statusCode).toBe(200);
    expect(response.body.status).toBe("success");
    expect(response.body.message).toBe("user_logged_in");
  });
});
