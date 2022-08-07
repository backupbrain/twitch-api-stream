-- CreateTable
CREATE TABLE "PaymentMethod" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "stripePaymentMethodId" TEXT NOT NULL,
    "nickname" TEXT,
    "last4" TEXT NOT NULL,
    "brand" TEXT NOT NULL,
    "funding" TEXT NOT NULL,
    "expirationMonth" TEXT NOT NULL,
    "expirationYear" TEXT NOT NULL,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,
    CONSTRAINT "PaymentMethod_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
