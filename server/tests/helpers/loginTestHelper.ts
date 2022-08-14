import { Response } from "superagent";
import request from "supertest";
import { app } from "../../src/app";

export type Props = {
  username: string;
  password: string;
};
export const loginTestHelper = async ({
  username,
  password,
}: Props): Promise<Response> => {
  const endpoint = "/api/1.0/account/login";
  const data = {
    username,
    password,
  };
  const response = await request(app).post(endpoint).send(data);
  return response;
};
