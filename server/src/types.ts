import express from "express";
import { User, ApiKey } from "@prisma/client";

export type AuthToken = {
  accessToken: string;
  tokenType: string;
  refreshToken: string;
  expiresIn: number;
  scopes: string[];
};

export type HeaderAuthToken = {
  token: string;
};

export type Request = express.Request & {
  adminUser?: User;
  accessToken?: HeaderAuthToken;
  apiKey?: ApiKey;
};
