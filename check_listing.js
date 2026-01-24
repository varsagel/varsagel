
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    const l = await prisma.listing.findFirst({
      orderBy: { createdAt: 'desc' },
      include: { category: true, subCategory: true }
    });
    console.log('Found listing id:', l?.id);
    console.log('Found listing code:', l?.code);
    console.log('Found listing title:', l?.title);
    console.log('Category:', l?.category);
    console.log('SubCategory:', l?.subCategory);
    console.log(JSON.stringify(l, (key, value) =>
      typeof value === 'bigint'
        ? value.toString()
        : value // return everything else unchanged
    , 2));
  } catch (e) {
    console.error(e);
  } finally {
    await prisma.$disconnect();
  }
}

main();
