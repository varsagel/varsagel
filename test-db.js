async function main() {
  const { prisma } = await import('./src/lib/prisma');
  try {
    console.log('Testing DB connection...');
    const count = await prisma.user.count();
    console.log('Successfully connected to DB. User count:', count);
  } catch (e) {
    console.error('DB Connection failed:', e);
  } finally {
    await prisma.$disconnect();
  }
}

main();
