
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    const l = await prisma.listing.findUnique({
      where: { id: 'cmix9ihlf0002zgnl26m9j20o' },
      include: { category: true }
    });
    console.log('Kategori:', l.category);
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
