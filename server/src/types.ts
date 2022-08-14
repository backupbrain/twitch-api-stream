import { ApiKey, User } from "@prisma/client";
import express from "express";

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

export type ErrorResponse = {
  status: string;
  message?: string;
  details?: string[];
};

export type SuccessResponse = {
  status: string;
  message?: string;
  data?: any;
};
