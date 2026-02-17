ALTER TABLE "Listing" ALTER COLUMN "budget" TYPE BIGINT USING "budget"::bigint;
ALTER TABLE "Offer" ALTER COLUMN "price" TYPE BIGINT USING "price"::bigint;
