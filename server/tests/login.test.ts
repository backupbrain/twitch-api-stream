import request from "supertest";
import { app } from "../src/app";
import { AccessToken, User } from "@prisma/client";
import { prisma } from "../src/database/prisma";
import { register } from "../src/functions/account/register";
import clearDatabase from "./setup";
import { verifyUser } from "../src/functions/account/verifyUser";
import { AuthToken } from "../src/types";

const username = "user@example.com";
const password = "password";
let user: User;
let authToken: AuthToken;

const unconfirmedUsername = "unconfirmed@example.com";
let unconfirmedUser: User;

const setup = async () => {
  user = await register({
    username,
    password,
  });
  await verifyUser({
    username,
    verificationToken: user.verificationToken || "",
  });
  unconfirmedUser = await register({
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
    expect(response.body).toMatchInlineSnapshot(`
Object {
  "error": Object {
    "message": "Unauthorized",
    "status": 401,
  },
}
`);
  });
  test("Login fails unconfirmed user", async () => {
    const endpoint = "/api/1.0/account/login";
    const data = {
      username: unconfirmedUsername,
      password,
    };
    const response = await request(app).post(endpoint).send(data);
    expect(response.statusCode).toBe(401);
    expect(response.body).toMatchInlineSnapshot(`
Object {
  "error": Object {
    "message": "Unauthorized",
    "status": 401,
  },
}
`);
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
    expect(response.body.accessToken).toBe(accessToken.token);
    expect(response.body.refreshToken).toBe(accessToken.token);
    expect(response.body.expiresIn).toBeGreaterThan(0);
    expect(response.body.tokenType).toBe("Bearer");
    expect(response.body.scopes).toStrictEqual([]);
    authToken = response.body;
  });
  test("Bad token cannot access restricted area with no authorization", async () => {
    const endpoint = "/api/1.0/account/refresh";
    const response = await request(app).post(endpoint);
    expect(response.statusCode).toBe(403);
    expect(response.body).toMatchInlineSnapshot(`
Object {
  "error": Object {
    "message": "No auth token provided",
    "status": 403,
  },
}
`);
  });
  test("Bad token cannot access restricted area with bad authorization", async () => {
    const endpoint = "/api/1.0/account/refresh";
    const response = await request(app)
      .post(endpoint)
      .set("Authorization", `${authToken.tokenType} abc123`);
    expect(response.statusCode).toBe(403);
    expect(response.body).toMatchInlineSnapshot(`
Object {
  "error": Object {
    "message": "Unauthorized",
    "status": 403,
  },
}
`);
  });
  test("Can extend auth token", async () => {
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
    expect(response.body.accessToken).toBe(accessToken.token);
    expect(response.body.refreshToken).toBe(accessToken.token);
    expect(response.body.expiresIn).toBeGreaterThan(0);
    expect(response.body.tokenType).toBe("Bearer");
    expect(response.body.scopes).toStrictEqual([]);
  });

  test("Can log out", async () => {
    const endpoint = "/api/1.0/account/logout";
    const response = await request(app)
      .post(endpoint)
      .set("Authorization", `${authToken.tokenType} ${authToken.accessToken}`);
    expect(response.body).toMatchInlineSnapshot(`
Object {
  "accessToken": "${authToken.accessToken}",
  "expiresIn": 0,
  "refreshToken": "",
  "scopes": Array [],
  "tokenType": "Bearer",
}
`);
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
    expect(response.body).toMatchInlineSnapshot(`
Object {
  "error": Object {
    "message": "Unauthorized",
    "status": 403,
  },
}
`);
  });
});
