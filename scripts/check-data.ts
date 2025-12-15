
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.findUnique({
    where: { email: 'talepsahibi@gmail.com' },
  });
  console.log('User:', user);

  const categories = await prisma.category.findMany({
    include: { subcategories: true },
  });
  console.log('Categories:', JSON.stringify(categories, null, 2));
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
