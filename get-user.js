
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.findFirst();
  if (user) {
    console.log('FOUND_USER_EMAIL:', user.email);
  } else {
    console.log('NO_USER_FOUND');
  }
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
