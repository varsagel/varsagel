const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  try {
    console.log('Connecting to database...');
    
    // List tables
    const tables = await prisma.$queryRaw`SELECT name FROM sqlite_master WHERE type='table';`;
    console.log('Tables:', tables);

    // Check Listing table specifically
    const columns = await prisma.$queryRaw`PRAGMA table_info(Listing);`;
    console.log('Listing Columns:', columns.map(c => c.name));

    // Try to select viewCount
    try {
        const result = await prisma.$queryRaw`SELECT viewCount FROM Listing LIMIT 1;`;
        console.log('SELECT viewCount result:', result);
    } catch (e) {
        console.error('SELECT viewCount FAILED:', e.message);
    }

    // Try to select ALL
    try {
        const result = await prisma.$queryRaw`SELECT * FROM Listing LIMIT 1;`;
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
