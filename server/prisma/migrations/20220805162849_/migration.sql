/*
  Warnings:

  - A unique constraint covering the columns `[id]` on the table `AccessToken` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[id]` on the table `ApiKey` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[id]` on the table `PaymentMethod` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[id]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "AccessToken_id_key" ON "AccessToken"("id");

-- CreateIndex
CREATE UNIQUE INDEX "ApiKey_id_key" ON "ApiKey"("id");

-- CreateIndex
CREATE UNIQUE INDEX "PaymentMethod_id_key" ON "PaymentMethod"("id");

-- CreateIndex
CREATE UNIQUE INDEX "User_id_key" ON "User"("id");
