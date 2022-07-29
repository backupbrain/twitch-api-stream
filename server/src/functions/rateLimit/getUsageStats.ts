import { ApiStats, User } from "@prisma/client";
import { prisma } from "../../database/prisma";
import { HttpInternalServerError } from "../../errors";

export type Props = {
  user: User;
};
export const getUsageStats = async ({ user }: Props): Promise<ApiStats> => {
  const stats = await prisma.apiStats.findUnique({
    where: { userId: user.id },
  });
  if (!stats) {
    throw new HttpInternalServerError(
      `API Stats could not be found for user ${user.username}`
    );
  }
  return stats;
};
