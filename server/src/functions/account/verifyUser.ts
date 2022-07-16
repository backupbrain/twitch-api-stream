import { prisma } from "../../database/prisma";
import { HttpInvalidInputError } from "../../errors";

export type Props = {
  username: string;
  verificationToken: string;
};

export const verifyUser = async ({
  username,
  verificationToken,
}: Props): Promise<void> => {
  try {
    const updatedUsers = await prisma.user.updateMany({
      where: {
        username,
        verificationToken,
        isConfirmed: false,
      },
      data: {
        isConfirmed: true,
      },
    });
    if (updatedUsers.count !== 1) {
      throw new HttpInvalidInputError(
        "Account already verified or doesn't exist"
      );
    }
  } catch (error) {
    throw new HttpInvalidInputError(
      "Account already verified or doesn't exist"
    );
  }
};
