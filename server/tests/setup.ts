import { prisma } from "../src/database/prisma";

export default async function clearDatabase() {
  const users = await prisma.user.findMany({});
  const authTokens = await prisma.accessToken.findMany({});
  const apiKeys = await prisma.apiKey.findMany({});

  const deleteUsers = async () => {
    await prisma.user.deleteMany({
      where: {
        id: {
          in: users.map((user) => user.id),
        },
      },
    });
  };

  const deleteApiKeys = async () => {
    await prisma.apiKey.deleteMany({
      where: {
        id: {
          in: apiKeys.map((apiKey) => apiKey.id),
        },
      },
    });
  };

  const deleteAuthTokens = async () => {
    await prisma.accessToken.deleteMany({
      where: {
        id: {
          in: authTokens.map((authToken) => authToken.id),
        },
      },
    });
  };

  await deleteApiKeys();
  await deleteAuthTokens();
  await deleteUsers();
}
