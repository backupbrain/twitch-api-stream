import { createOneTimePassword } from "../utils/createOneTimePassword";
import { prisma } from "../../database/prisma";
import { HttpUnauthorizedError } from "../../errors";
import { User } from "@prisma/client";

const resetPasswordTokenExpirationHours = 24;

export type Props = {
  username: string;
};
export const requestPasswordReset = async ({
  username,
}: Props): Promise<User> => {
  return await prisma.$transaction(async (prisma) => {
    const user = await prisma.user.findUnique({
      where: {
        username,
      },
    });
    if (!user) {
      throw new HttpUnauthorizedError("Unauthorized");
    }
    const resetPasswordToken = createOneTimePassword({});
    const resetPasswordTokenExpiration = new Date();
    resetPasswordTokenExpiration.setHours(
      resetPasswordTokenExpiration.getHours() +
        resetPasswordTokenExpirationHours
    );
    const updatedUser = await prisma.user.update({
      where: { username },
      data: { resetPasswordToken, resetPasswordTokenExpiration },
    });
    return updatedUser;
  });
};
