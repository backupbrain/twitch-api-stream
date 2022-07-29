/*
  Warnings:

  - You are about to alter the column `numApiCallsSinceAccountBirthday` on the `ApiStats` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Int`.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_ApiStats" (
    "userId" TEXT NOT NULL,
    "accountBirthday" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "billingPeriodStart" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "billingPeriodEnd" DATETIME NOT NULL,
    "numApiCallsSinceAccountBirthday" INTEGER NOT NULL DEFAULT 0,
    "numApiCallsSinceBillingStart" INTEGER NOT NULL DEFAULT 0,
    "numApiCallsRemainingInBillingPeriod" INTEGER NOT NULL,
    "numApiCallsAllowedInPeriod" INTEGER NOT NULL,
    "lastApiCall" DATETIME,
    CONSTRAINT "ApiStats_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_ApiStats" ("accountBirthday", "billingPeriodEnd", "billingPeriodStart", "lastApiCall", "numApiCallsAllowedInPeriod", "numApiCallsRemainingInBillingPeriod", "numApiCallsSinceAccountBirthday", "numApiCallsSinceBillingStart", "userId") SELECT "accountBirthday", "billingPeriodEnd", "billingPeriodStart", "lastApiCall", "numApiCallsAllowedInPeriod", "numApiCallsRemainingInBillingPeriod", "numApiCallsSinceAccountBirthday", "numApiCallsSinceBillingStart", "userId" FROM "ApiStats";
DROP TABLE "ApiStats";
ALTER TABLE "new_ApiStats" RENAME TO "ApiStats";
CREATE UNIQUE INDEX "ApiStats_userId_key" ON "ApiStats"("userId");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
