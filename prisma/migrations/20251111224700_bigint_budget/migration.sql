-- AlterTable
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Listing" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "budget" BIGINT,
    "city" TEXT,
    "district" TEXT,
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "categoryId" TEXT NOT NULL,
    "subCategoryId" TEXT,
    "ownerId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Listing_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Listing_subCategoryId_fkey" FOREIGN KEY ("subCategoryId") REFERENCES "SubCategory" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Listing_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Listing" ("id", "title", "description", "budget", "city", "district", "status", "categoryId", "subCategoryId", "ownerId", "createdAt", "updatedAt")
SELECT "id", "title", "description", 
    CASE 
        WHEN "budget" > 9223372036854775807 OR "budget" < -9223372036854775808 THEN 10000
        ELSE "budget" 
    END,
    "city", "district", "status", "categoryId", "subCategoryId", "ownerId", "createdAt", "updatedAt"
FROM "Listing";
DROP TABLE "Listing";
ALTER TABLE "new_Listing" RENAME TO "Listing";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;

-- AlterTable
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Offer" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "listingId" TEXT NOT NULL,
    "sellerId" TEXT NOT NULL,
    "price" BIGINT NOT NULL,
    "message" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Offer_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "Listing" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Offer_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Offer" ("id", "listingId", "sellerId", "price", "message", "status", "createdAt", "updatedAt")
SELECT "id", "listingId", "sellerId", 
    CASE 
        WHEN "price" > 9223372036854775807 OR "price" < -9223372036854775808 THEN 1000
        ELSE "price" 
    END,
    "message", "status", "createdAt", "updatedAt"
FROM "Offer";
DROP TABLE "Offer";
ALTER TABLE "new_Offer" RENAME TO "Offer";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;