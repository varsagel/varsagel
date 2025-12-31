
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Checking listings...');
  const listings = await prisma.listing.findMany({
    where: { status: 'OPEN' },
    include: { owner: true },
    take: 5
  });

  console.log(`Found ${listings.length} OPEN listings.`);
  listings.forEach(l => {
    console.log(`- [${l.id}] ${l.title} (Owner: ${l.owner.email} / ${l.owner.id})`);
  });

  const users = await prisma.user.findMany({ take: 5 });
  console.log(`Found ${users.length} users:`);
  users.forEach(u => console.log(`- ${u.email} (${u.id})`));
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
