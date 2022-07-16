import { createOneTimePassword } from "../utils/createOneTimePassword";
import { prisma } from "../../database/prisma";
import { HttpInvalidInputError } from "../../errors";
import { User } from "@prisma/client";
import { hashPassword } from "../utils/hashPassword";

export type Props = {
  username: string;
  password: string;
};

export const register = async ({
  username,
  password,
}: Props): Promise<User> => {
  const hashedPassword = hashPassword({ password });
  const verificationToken = createOneTimePassword({});
  try {
    const user = await prisma.user.create({
      data: {
        username,
        hashedPassword,
        verificationToken,
        isConfirmed: false,
      },
    });
    return user;
  } catch (error) {
    throw new HttpInvalidInputError("Email already registerd");
  }
};
