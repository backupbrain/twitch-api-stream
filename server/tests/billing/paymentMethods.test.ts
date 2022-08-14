import { User } from "@prisma/client";
import request from "supertest";
import { app } from "../../src/app";
import { prisma } from "../../src/database/prisma";
import { create } from "../../src/functions/account/create";
import { verifyUser } from "../../src/functions/account/verifyUser";
import { AuthToken } from "../../src/types";
import { loginTestHelper } from "../helpers/loginTestHelper";
import clearDatabase from "../setup";

const username = "user@example.com";
const password = "password";
let user: User;
let authToken: AuthToken;
let paymentMethod1: any = undefined;
let paymentMethod2: any = undefined;
let paymentMethod3: any = undefined;

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

describe("Adding payment methods", () => {
  test("Add a non-primary billing method", async () => {
    const endpoint = "/api/1.0/account/billing";
    const stripeToken = "token_12345";
    const data = {
      stripeToken,
    };
    const response = await request(app)
      .post(endpoint)
      .set("Authorization", `${authToken.tokenType} ${authToken.accessToken}`)
      .send(data);
    expect(response.statusCode).toBe(200);
    expect(response.body.status).toBe("success");
    expect(response.body.message).toBe("payment_method_created");
    const newPaymentMethodData = response.body.data;
    expect(typeof newPaymentMethodData.id).toBe("string");
    expect(newPaymentMethodData.stripePaymentMethodId).toBe("");
    expect(newPaymentMethodData.nickname).toBe(null);
    expect(newPaymentMethodData.isPrimary).toBe(false);
    const paymentMethod = await prisma.paymentMethod.findFirst({
      where: {
        id: newPaymentMethodData.id,
      },
    });
    expect(paymentMethod).not.toBe(null);
    expect(paymentMethod?.id).toBe(newPaymentMethodData.id);
    paymentMethod1 = newPaymentMethodData;
  });
  test("Add a primary billing method", async () => {
    const endpoint = "/api/1.0/account/billing";
    const stripeToken = "token_23456";
    const data = {
      stripeToken,
      primary: true,
    };
    const response = await request(app)
      .post(endpoint)
      .set("Authorization", `${authToken.tokenType} ${authToken.accessToken}`)
      .send(data);
    expect(response.statusCode).toBe(200);
    expect(response.body.status).toBe("success");
    expect(response.body.message).toBe("payment_method_created");
    const newPaymentMethodData = response.body.data;
    expect(typeof newPaymentMethodData.id).toBe("string");
    expect(newPaymentMethodData.stripePaymentMethodId).toBe(stripeToken);
    expect(newPaymentMethodData.nickname).toBe(null);
    expect(newPaymentMethodData.isPrimary).toBe(true);
    const primaryPaymentMethods = await prisma.paymentMethod.findMany({
      where: {
        id: newPaymentMethodData.id,
      },
    });
    expect(primaryPaymentMethods.length).toBe(1);
    expect(primaryPaymentMethods[0].id).toBe(newPaymentMethodData.id);
    paymentMethod2 = newPaymentMethodData;
  });
  test("Add a payment method with nickname", async () => {
    const endpoint = "/api/1.0/account/billing";
    const stripeToken = "token_34567";
    const nickname = "billingnickname";
    const data = {
      stripeToken,
      nickname,
    };
    const response = await request(app)
      .post(endpoint)
      .set("Authorization", `${authToken.tokenType} ${authToken.accessToken}`)
      .send(data);
    expect(response.statusCode).toBe(200);
    expect(response.body.status).toBe("success");
    expect(response.body.message).toBe("payment_method_created");
    const newPaymentMethodData = response.body.data;
    expect(typeof newPaymentMethodData.id).toBe("string");
    expect(newPaymentMethodData.stripePaymentMethodId).toBe(stripeToken);
    expect(newPaymentMethodData.nickname).toBe(nickname);
    expect(newPaymentMethodData.isPrimary).toBe(false);
    paymentMethod3 = newPaymentMethodData;
  });
});
describe("Retrieving payment methods", () => {
  test("Number of payment methods should be sane", async () => {
    const allPaymentMethods = await prisma.paymentMethod.findMany({
      where: { userId: user.id },
    });
    expect(allPaymentMethods.length).toBe(4);
  });
  test("Fetch all payment methods", async () => {
    const endpoint = `/api/1.0/account/billing`;
    const response = await request(app)
      .get(endpoint)
      .set("Authorization", `${authToken.tokenType} ${authToken.accessToken}`);
    expect(response.statusCode).toBe(200);
    expect(response.body.status).toBe("success");
    const returnedPaymentMethods = response.body.data;
    const paymentMethods = await prisma.paymentMethod.findMany({
      where: { userId: user.id },
    });
    expect(paymentMethods.length).toBe(returnedPaymentMethods.length);
    const paymentMethodIds: string[] = [];
    paymentMethods.forEach((paymentMethod) => {
      paymentMethodIds.push(paymentMethod.id);
    });
    let paymentMethodIdsOutOfSync = false;
    for (let returnedPaymentMethod of returnedPaymentMethods) {
      if (!paymentMethodIds.includes(returnedPaymentMethod.id)) {
        paymentMethodIdsOutOfSync = true;
        break;
      }
    }
    expect(paymentMethodIdsOutOfSync).toBe(false);
  });

  test("Fetch a payment method", async () => {
    const endpoint = `/api/1.0/account/billing/${paymentMethod2.id}`;
    const response = await request(app)
      .get(endpoint)
      .set("Authorization", `${authToken.tokenType} ${authToken.accessToken}`);
    expect(response.statusCode).toBe(200);
    expect(response.body.status).toBe("success");
    const returnedPaymentMethod = response.body.data;
    const paymentMethod = await prisma.paymentMethod.findFirst({
      where: { id: paymentMethod2.id, userId: user.id },
    });
    expect(returnedPaymentMethod.id).toBe(paymentMethod?.id);
    expect(returnedPaymentMethod.stripePaymentMethodId).toBe(
      paymentMethod?.stripePaymentMethodId
    );
    expect(returnedPaymentMethod.nickname).toBe(paymentMethod?.nickname);
  });
});
describe("Modifying payment methods", () => {
  test("Remove a payment method", async () => {
    const endpoint = `/api/1.0/account/billing/${paymentMethod1.id}`;
    const response = await request(app)
      .delete(endpoint)
      .set("Authorization", `${authToken.tokenType} ${authToken.accessToken}`);
    expect(response.statusCode).toBe(200);
    expect(response.body.status).toBe("success");
    expect(response.body.message).toBe("payment_method_deleted");
    const paymentMethods = await prisma.paymentMethod.findMany({
      where: { userId: user.id },
    });
    expect(paymentMethods.length).toBe(3);
    let deletedPaymentMethodFound = false;
    for (let paymentMethod of paymentMethods) {
      if (paymentMethod.id === paymentMethod1.id) {
        deletedPaymentMethodFound = true;
        break;
      }
    }
    expect(deletedPaymentMethodFound).toBe(false);
  });
  test("Update a payment method to primary", async () => {
    const endpoint = `/api/1.0/account/billing/${paymentMethod1.id}`;
    const nickname = "thenickname";
    const data = {
      primary: true,
      nickname,
    };
    const response = await request(app)
      .post(endpoint)
      .set("Authorization", `${authToken.tokenType} ${authToken.accessToken}`)
      .send(data);
    expect(response.statusCode).toBe(200);
    expect(response.body.status).toBe("success");
    expect(response.body.message).toBe("payment_method_updated");
    const returnedPaymentMethod = response.body.data;
    const paymentMethod = await prisma.paymentMethod.findFirst({
      where: { id: paymentMethod1.id, userId: user.id },
    });
    expect(returnedPaymentMethod.id).toBe(paymentMethod?.id);
    expect(returnedPaymentMethod.isPrimary).toBe(true);
    expect(returnedPaymentMethod.nickname).toBe(nickname);
    const primaryPaymentMethods = await prisma.paymentMethod.findMany({
      where: { userId: user.id, isPrimary: true },
    });
    expect(primaryPaymentMethods.length).toBe(1);
  });
  test("Update a payment method to non-primary", async () => {
    const endpoint = `/api/1.0/account/billing/${paymentMethod1.id}`;
    const nickname = null;
    const data = {
      primary: false,
      nickname,
    };
    const response = await request(app)
      .post(endpoint)
      .set("Authorization", `${authToken.tokenType} ${authToken.accessToken}`)
      .send(data);
    expect(response.statusCode).toBe(200);
    expect(response.body.status).toBe("success");
    expect(response.body.message).toBe("payment_method_updated");
    const returnedPaymentMethod = response.body.data;
    const paymentMethod = await prisma.paymentMethod.findFirst({
      where: { id: paymentMethod1.id, userId: user.id },
    });
    expect(returnedPaymentMethod.id).toBe(paymentMethod?.id);
    expect(returnedPaymentMethod.isPrimary).toBe(false);
    expect(returnedPaymentMethod.nickname).toBe(nickname);
    const primaryPaymentMethods = await prisma.paymentMethod.findMany({
      where: { userId: user.id, isPrimary: true },
    });
    expect(primaryPaymentMethods.length).toBe(0);
  });
});
