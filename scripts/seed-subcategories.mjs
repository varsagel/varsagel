
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const OWNER_EMAIL = 'talepsahibi@gmail.com';

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
  const user = await prisma.user.findUnique({
    where: { email: OWNER_EMAIL },
  });

  if (!user) {
    console.error(`Kullanıcı ${OWNER_EMAIL} bulunamadı! Lütfen check-data.mjs çalıştırın veya kullanıcının var olduğundan emin olun.`);
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
        
        // Create 2 listings for each subcategory
        for (let i = 1; i <= 2; i++) {
          const title = `${subCategory.name} - Örnek Talep ${i}`;
          const description = `Bu, ${category.name} > ${subCategory.name} kategorisinde oluşturulmuş ${i}. örnek taleptir. Detaylı bilgi için iletişime geçiniz.`;
          
          // Generate dummy attributes based on category
          let attributes = {};
          if (category.slug === 'vasita') {
              attributes = {
                  marka: i === 1 ? 'BMW' : 'Mercedes',
                  model: i === 1 ? '320i' : 'C180',
                  yil: 2020 + i,
                  yakit: 'Benzin',
                  vites: 'Otomatik'
              };
          } else if (category.slug === 'emlak') {
              attributes = {
                  odaSayisi: '3+1',
                  metrekare: 120 + (i * 10),
                  isitma: 'Doğalgaz',
                  binaYasi: 5
              };
          } else if (category.slug === 'alisveris') {
              attributes = {
                  marka: i === 1 ? 'Apple' : 'Samsung',
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
            status: 'OPEN',
            imagesJson: JSON.stringify([]),
            attributesJson: JSON.stringify(attributes),
            categoryId: category.id,
            subCategoryId: subCategory.id,
            ownerId: user.id,
            code: `${category.slug.substring(0, 3).toUpperCase()}-${subCategory.slug.substring(0, 3).toUpperCase()}-${Date.now()}-${i}`
          };
    
          const listing = await prisma.listing.create({
            data: listingData
          });
    
          console.log(`  Talep oluşturuldu: ${listing.title} (ID: ${listing.id})`);
        }
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
