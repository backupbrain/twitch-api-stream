import { User } from "@prisma/client";
import { prisma } from "../../database/prisma";
import { HttpInvalidInputError } from "../../errors";
import { hashPassword } from "../utils/hashPassword";

export type Props = {
  username: string;
  resetPasswordToken: string;
  password: string;
};
export const setPasswordForUsername = async ({
  username,
  resetPasswordToken,
  password,
}: Props): Promise<User> => {
  const now = new Date();
  const user = await prisma.user.findFirst({
    where: {
      username,
      resetPasswordToken,
      resetPasswordTokenExpiration: {
        gte: now,
      },
    },
  });
  if (!user) {
    throw new HttpInvalidInputError("invalid_or_expired_token");
  }
  const hashedPassword = hashPassword({ password });
  const updatedUser = await prisma.user.update({
    where: { id: user.id },
    data: { hashedPassword },
  });
  return updatedUser;
};
