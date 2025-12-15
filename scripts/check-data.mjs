
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Kullanıcı kontrol ediliyor...');
  const user = await prisma.user.findUnique({
    where: { email: 'talepsahibi@gmail.com' },
  });
  
  if (user) {
      console.log('Kullanıcı bulundu:', user.id);
  } else {
      console.log('Kullanıcı bulunamadı, oluşturuluyor...');
      // Assuming a password hash is needed, but for now let's just create it if missing
      // We might need bcrypt but let's see if we can skip password or use a dummy one
      // Note: User model usually has password field.
      const bcrypt = await import('bcrypt');
      const hashedPassword = await bcrypt.hash('123456', 10);
      
      const newUser = await prisma.user.create({
        data: {
            email: 'talepsahibi@gmail.com',
            name: 'Talep Sahibi',
            password: hashedPassword,
            role: 'USER',
            phone: '5555555555'
        }
      });
      console.log('Kullanıcı oluşturuldu:', newUser.id);
  }

  const categories = await prisma.category.findMany({
    include: { subcategories: true },
  });
  console.log('Bulunan kategoriler:', categories.length);
  
  // Just print the structure to help me write the seeder
  categories.forEach(c => {
      console.log(`Kategori: ${c.slug} (${c.id})`);
      c.subcategories.forEach(s => {
          console.log(`  - ${s.slug} (${s.id})`);
      });
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
