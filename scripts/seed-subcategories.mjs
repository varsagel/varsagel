
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const OWNER_EMAIL = process.env.SEED_OWNER_EMAIL || 'talepsahibi@gmail.com';

// Dummy data helpers
const CITIES = ['İstanbul', 'Ankara', 'İzmir', 'Bursa', 'Antalya'];
const DISTRICTS = ['Merkez', 'Çankaya', 'Kadıköy', 'Nilüfer', 'Muratpaşa'];

function getRandomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function main() {
  // 1. Get the user
  let user = await prisma.user.findUnique({
    where: { email: OWNER_EMAIL },
  });

  if (!user) {
    user = await prisma.user.findFirst({ orderBy: { createdAt: 'asc' } });
  }

  if (!user) {
    console.error(`Kullanıcı bulunamadı! Önce bir kullanıcı oluşturun.`);
    process.exit(1);
  }
  console.log(`Kullanıcı seçildi: ${user.name} (${user.id})`);

  // 2. Get categories with subcategories
  const categories = await prisma.category.findMany({
    include: { subcategories: true },
  });

  console.log(`${categories.length} kategori bulundu.`);

  for (const category of categories) {
    // Skip if no subcategories
    if (category.subcategories.length === 0) {
        console.log(`Kategori geçiliyor: ${category.name} (alt kategori yok)`);
        continue;
    }

    for (const subCategory of category.subcategories) {
        console.log(`Alt kategori için talepler oluşturuluyor: ${subCategory.name} (${category.name})`);
        
        const title = `${subCategory.name} - Örnek Talep`;
        const description = `Bu, ${category.name} > ${subCategory.name} kategorisinde oluşturulmuş örnek taleptir. Detaylı bilgi için iletişime geçiniz.`;
          
          // Generate dummy attributes based on category
          let attributes = {};
          if (category.slug === 'vasita') {
              attributes = {
                  marka: 'BMW',
                  model: '320i',
                  yil: 2021,
                  yakit: 'Benzin',
                  vites: 'Otomatik'
              };
          } else if (category.slug === 'emlak') {
              attributes = {
                  odaSayisi: '3+1',
                  metrekare: 120,
                  isitma: 'Doğalgaz',
                  binaYasi: 5
              };
          } else if (category.slug === 'alisveris') {
              attributes = {
                  marka: 'Apple',
                  durum: 'İkinci El'
              };
          } else {
               // Generic attributes for others
               attributes = {
                   durum: 'Yeni Gibi',
                   garanti: 'Var'
               };
          }
    
          const listingData = {
            title: title,
            description: description,
            budget: BigInt(getRandomInt(1000, 1000000)),
            city: getRandomItem(CITIES),
            district: getRandomItem(DISTRICTS),
            status: 'PENDING',
            imagesJson: JSON.stringify([]),
            attributesJson: JSON.stringify(attributes),
            categoryId: category.id,
            subCategoryId: subCategory.id,
            ownerId: user.id,
            code: `${category.slug.substring(0, 3).toUpperCase()}-${subCategory.slug.substring(0, 3).toUpperCase()}-${Date.now()}`
          };
    
          const listing = await prisma.listing.create({
            data: listingData
          });
    
          console.log(`  Talep oluşturuldu: ${listing.title} (ID: ${listing.id})`);
    }
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
