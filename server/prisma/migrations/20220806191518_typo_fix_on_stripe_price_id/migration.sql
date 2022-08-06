/*
  Warnings:

  - You are about to drop the column `stripePlanId` on the `User` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "username" TEXT NOT NULL,
    "hashedPassword" TEXT NOT NULL,
    "isConfirmed" BOOLEAN NOT NULL DEFAULT false,
    "verificationToken" TEXT,
    "resetPasswordToken" TEXT,
    "resetPasswordTokenExpiration" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "stripeCustomerId" TEXT NOT NULL DEFAULT 'invalid',
    "stripeSubscriptionId" TEXT,
    "stripePriceId" TEXT
);
INSERT INTO "new_User" ("createdAt", "hashedPassword", "id", "isConfirmed", "resetPasswordToken", "resetPasswordTokenExpiration", "stripeCustomerId", "stripeSubscriptionId", "username", "verificationToken") SELECT "createdAt", "hashedPassword", "id", "isConfirmed", "resetPasswordToken", "resetPasswordTokenExpiration", "stripeCustomerId", "stripeSubscriptionId", "username", "verificationToken" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_id_key" ON "User"("id");
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
