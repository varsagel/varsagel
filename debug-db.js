require('dotenv').config({ override: true });
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  try {
    console.log('Connecting to database...');
    
    const tables = await prisma.$queryRaw`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `;
    console.log('Tables:', tables);

    const columns = await prisma.$queryRaw`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'Listing'
      ORDER BY ordinal_position;
    `;
    console.log('Listing Columns:', columns.map(c => c.column_name));

    // Try to select viewCount
    try {
        const result = await prisma.$queryRaw`SELECT "viewCount" FROM "Listing" LIMIT 1;`;
        console.log('SELECT viewCount result:', result);
    } catch (e) {
        console.error('SELECT viewCount FAILED:', e.message);
    }

    // Try to select ALL
    try {
        const result = await prisma.$queryRaw`SELECT * FROM "Listing" LIMIT 1;`;
        console.log('SELECT * result keys:', result.length > 0 ? Object.keys(result[0]) : 'No rows');
    } catch (e) {
        console.error('SELECT * FAILED:', e.message);
    }

  } catch (e) {
    console.error('General Error:', e);
  } finally {
    await prisma.$disconnect();
  }
}

main();
