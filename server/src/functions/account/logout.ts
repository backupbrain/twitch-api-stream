import { prisma } from "../../database/prisma";

export type Props = {
  accessToken: string;
};
export const logout = async ({ accessToken }: Props) => {
  await prisma.accessToken.updateMany({
    where: { token: accessToken },
    data: {
      expiresAt: new Date(),
    },
  });
  const authToken = {
    accessToken: accessToken,
    tokenType: "Bearer",
    refreshToken: "",
    expiresIn: 0,
    scopes: [],
  };
  return authToken;
};
