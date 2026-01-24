import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const anyUser = await prisma.user.findFirst({
    select: { id: true, email: true, name: true },
    orderBy: { createdAt: 'asc' },
  });

  const openListing = await prisma.listing.findFirst({
    where: { status: 'OPEN' },
    select: {
      id: true,
      title: true,
      ownerId: true,
      attributesJson: true,
      category: { select: { slug: true } },
      subCategory: { select: { slug: true } },
    },
    orderBy: { createdAt: 'desc' },
  });

  const listingAttrs = (() => {
    try {
      const parsed = openListing?.attributesJson ? JSON.parse(openListing.attributesJson) : {};
      return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {};
    } catch {
      return {};
    }
  })();

  const keys = Object.keys(listingAttrs);

  console.log(
    JSON.stringify(
      {
        anyUser,
        openListing: openListing
          ? {
              id: openListing.id,
              title: openListing.title,
              ownerId: openListing.ownerId,
              category: openListing.category?.slug || null,
              subcategory: openListing.subCategory?.slug || null,
              attributeKeyCount: keys.length,
              attributeKeysSample: keys.slice(0, 20),
            }
          : null,
      },
      null,
      2
    )
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

