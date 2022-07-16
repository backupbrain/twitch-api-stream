import { createOneTimePassword } from "../utils/createOneTimePassword";
import { prisma } from "../../database/prisma";
import { HttpUnauthorizedError } from "../../errors";

export type Props = {
  username: string;
};

export type Response = {
  resetPasswordToken: string;
};

export const requestPasswordReset = async ({
  username,
}: Props): Promise<Response> => {
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
    await prisma.user.update({
      where: { username },
      data: { resetPasswordToken },
    });
    return {
      resetPasswordToken,
    };
  });
};
