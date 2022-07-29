/*
  Warnings:

  - You are about to drop the column `numApiCallsRemainingInPeriod` on the `ApiStats` table. All the data in the column will be lost.
  - You are about to alter the column `numApiCallsRemainingInBillingPeriod` on the `ApiStats` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Int`.
  - You are about to alter the column `numApiCallsSinceBillingStart` on the `ApiStats` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Int`.
  - Added the required column `numApiCallsAllowedInPeriod` to the `ApiStats` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_ApiStats" (
    "userId" TEXT NOT NULL,
    "accountBirthday" DATETIME NOT NULL,
    "billingPeriodStart" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "billingPeriodEnd" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "numApiCallsSinceAccountBirthday" BIGINT NOT NULL DEFAULT 0,
    "numApiCallsSinceBillingStart" INTEGER NOT NULL DEFAULT 0,
    "numApiCallsRemainingInBillingPeriod" INTEGER NOT NULL,
    "numApiCallsAllowedInPeriod" INTEGER NOT NULL,
    CONSTRAINT "ApiStats_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_ApiStats" ("accountBirthday", "billingPeriodEnd", "billingPeriodStart", "numApiCallsRemainingInBillingPeriod", "numApiCallsSinceAccountBirthday", "numApiCallsSinceBillingStart", "userId") SELECT "accountBirthday", "billingPeriodEnd", "billingPeriodStart", "numApiCallsRemainingInBillingPeriod", "numApiCallsSinceAccountBirthday", "numApiCallsSinceBillingStart", "userId" FROM "ApiStats";
DROP TABLE "ApiStats";
ALTER TABLE "new_ApiStats" RENAME TO "ApiStats";
CREATE UNIQUE INDEX "ApiStats_userId_key" ON "ApiStats"("userId");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
