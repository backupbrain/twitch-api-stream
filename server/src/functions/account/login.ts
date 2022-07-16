import { prisma } from "../../database/prisma";
import { verifyPassword } from "../utils/verifyPassword";
import { generateAccessToken } from "../utils/generateAccessToken";
import { HttpUnauthorizedError } from "../../errors";
import { AuthToken } from "../../types";

const expirationDurationSeconds = 24 * 60 * 60; // 24 hours

export type Props = {
  username: string;
  password: string;
};

export const login = async ({
  username,
  password,
}: Props): Promise<AuthToken> => {
  const user = await prisma.user.findUnique({
    where: { username },
  });
  if (!user) {
    throw new HttpUnauthorizedError("Unauthorized");
  }
  const doPasswordsMatch = verifyPassword({
    password,
    hashedPassword: user.hashedPassword,
  });
  if (!doPasswordsMatch) {
    throw new HttpUnauthorizedError("Unauthorized");
  }
  const authToken = generateAccessToken({});
  const expiresAt = new Date(authToken.expiresIn);
  await prisma.accessToken.create({
    data: {
      user: { connect: { id: user.id } },
      token: authToken.accessToken,
      expiresAt,
    },
  });
  return authToken;
};
