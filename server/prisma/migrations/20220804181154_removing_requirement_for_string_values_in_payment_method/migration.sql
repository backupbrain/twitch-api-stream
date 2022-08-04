-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_PaymentMethod" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "stripePaymentMethodId" TEXT NOT NULL,
    "nickname" TEXT,
    "last4" TEXT,
    "brand" TEXT,
    "funding" TEXT,
    "expirationMonth" TEXT,
    "expirationYear" TEXT,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,
    CONSTRAINT "PaymentMethod_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_PaymentMethod" ("brand", "createdAt", "expirationMonth", "expirationYear", "funding", "id", "isPrimary", "last4", "nickname", "stripePaymentMethodId", "userId") SELECT "brand", "createdAt", "expirationMonth", "expirationYear", "funding", "id", "isPrimary", "last4", "nickname", "stripePaymentMethodId", "userId" FROM "PaymentMethod";
DROP TABLE "PaymentMethod";
ALTER TABLE "new_PaymentMethod" RENAME TO "PaymentMethod";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
