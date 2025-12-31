const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('Connecting to database...');
  try {
    const result = await prisma.$queryRaw`PRAGMA table_info(Category);`;
    console.log('Columns in Category table:');
    let hasIcon = false;
    result.forEach(row => {
      console.log(`- ${row.name} (${row.type})`);
      if (row.name === 'icon') hasIcon = true;
    });
    console.log('\nHas icon column?', hasIcon);
  } catch (e) {
    console.error('Error:', e);
  } finally {
    await prisma.$disconnect();
  }
}

main();
