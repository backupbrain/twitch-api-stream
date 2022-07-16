import { prisma } from "../../database/prisma";
import { AuthToken } from "../../types";

import { expirationDurationSeconds } from "../utils/generateAccessToken";

export type Props = {
  accessToken: string;
};
export const refreshAuthToken = async ({
  accessToken,
}: Props): Promise<AuthToken> => {
  const now = new Date().getTime();
  const expriesAtTimestamp = now + expirationDurationSeconds;
  const expiresAtDatetime = new Date(expriesAtTimestamp);

  const updatedToken = await prisma.accessToken.update({
    where: { token: accessToken },
    data: { expiresAt: expiresAtDatetime },
  });
  const authToken = {
    accessToken: updatedToken.token,
    tokenType: "Bearer",
    refreshToken: updatedToken.token,
    expiresIn: expirationDurationSeconds,
    scopes: [],
  };
  return authToken;
};
