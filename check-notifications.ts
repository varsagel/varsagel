
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  try {
    console.log('Testing DB connection...');
    const user = await prisma.user.findFirst();
    console.log('User found:', user ? user.id : 'None');
    
    if (user) {
        const count = await prisma.notification.count({
            where: { userId: user.id, read: false }
        });
        console.log('Notification count:', count);
    }
  } catch (e) {
    console.error('Error:', e);
  } finally {
    await prisma.$disconnect();
  }
}

main();
