import { AuthToken } from "../../types";

export const expirationDurationSeconds = 24 * 60 * 60;

export type Props = {
  length?: number;
};
/**
 * Generate an OAuth token
 * @typedef {Object} Props
 * @property {number?} length optional, must be greater than 0
 * @returns string an oauth token
 */
export const generateAccessToken = ({ length = 12 }: Props): AuthToken => {
  let accessToken = "";
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    accessToken += characters.charAt(
      Math.floor(Math.random() * charactersLength)
    );
  }

  const now = new Date().getTime();
  const expriesAtTimestamp = now + expirationDurationSeconds;

  return {
    accessToken,
    refreshToken: accessToken,
    tokenType: "Bearer",
    expiresIn: expirationDurationSeconds,
    scopes: [],
  };
};
