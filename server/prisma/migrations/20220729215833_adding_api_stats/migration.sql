-- CreateTable
CREATE TABLE "ApiStats" (
    "userId" TEXT NOT NULL,
    "accountBirthday" DATETIME NOT NULL,
    "billingPeriodStart" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "billingPeriodEnd" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "numApiCallsSinceAccountBirthday" BIGINT NOT NULL DEFAULT 0,
    "numApiCallsSinceBillingStart" BIGINT NOT NULL DEFAULT 0,
    "numApiCallsRemainingInPeriod" BIGINT NOT NULL,
    "numApiCallsRemainingInBillingPeriod" BIGINT NOT NULL,
    CONSTRAINT "ApiStats_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "ApiStats_userId_key" ON "ApiStats"("userId");
