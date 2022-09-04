import { User } from "@prisma/client";
import { prisma } from "../../database/prisma";
import { HttpInvalidInputError } from "../../errors";
import { hashPassword } from "../utils/hashPassword";
import { verifyPassword } from "../utils/verifyPassword";

export type Props = {
  user: User;
  oldPassword: string;
  newPassword: string;
};
export const changePassword = async ({
  user,
  oldPassword,
  newPassword,
}: Props): Promise<User> => {
  const isOldPasswordCorrect = verifyPassword({
    password: oldPassword,
    hashedPassword: user.hashedPassword,
  });
  if (!isOldPasswordCorrect) {
    throw new HttpInvalidInputError("field_oldpassword_incorrect");
  }
  const hashedPassword = hashPassword({ password: newPassword });
  const updatedUser = await prisma.user.update({
    where: { id: user.id },
    data: { hashedPassword },
  });
  return updatedUser;
};
