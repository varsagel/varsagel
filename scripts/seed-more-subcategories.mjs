
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const OWNER_EMAIL = 'talepsahibi@gmail.com';

// Extended subcategories definition
const NEW_SUBCATEGORIES = {
  'emlak': [
    { name: 'Satılık İşyeri', slug: 'satilik-isyeri' },
    { name: 'Kiralık İşyeri', slug: 'kiralik-isyeri' },
    { name: 'Arsa', slug: 'arsa' },
    { name: 'Devren Satılık', slug: 'devren-satilik' },
    { name: 'Turistik Tesis', slug: 'turistik-tesis' }
  ],
  'vasita': [
    { name: 'Arazi, SUV & Pick-up', slug: 'arazi-suv-pickup' },
    { name: 'Motosiklet', slug: 'motosiklet' },
    { name: 'Minivan & Panelvan', slug: 'minivan-panelvan' },
    { name: 'Ticari Araçlar', slug: 'ticari-araclar' },
    { name: 'Kiralık Araçlar', slug: 'kiralik-araclar' }
  ],
  'alisveris': [
    { name: 'Beyaz Eşya', slug: 'beyaz-esya' },
    { name: 'Fotoğraf & Kamera', slug: 'fotograf-kamera' },
    { name: 'Giyim & Aksesuar', slug: 'giyim-aksesuar' },
    { name: 'Saat', slug: 'saat' },
    { name: 'Anne & Bebek', slug: 'anne-bebek' }
  ],
  'is-talepleri': [
    { name: 'Tam Zamanlı', slug: 'tam-zamanli' },
    { name: 'Yarı Zamanlı', slug: 'yari-zamanli' },
    { name: 'Stajyer', slug: 'stajyer' }
  ],
  'hayvanlar-alemi': [
    { name: 'Akvaryum Balıkları', slug: 'akvaryum-baliklari' },
    { name: 'Aksesuarlar', slug: 'aksesuarlar' },
    { name: 'Yem & Mama', slug: 'yem-mama' }
  ]
};

// Dummy data helpers
const CITIES = ['İstanbul', 'Ankara', 'İzmir', 'Bursa', 'Antalya', 'Adana', 'Konya', 'Gaziantep'];
const DISTRICTS = ['Merkez', 'Çankaya', 'Kadıköy', 'Nilüfer', 'Muratpaşa', 'Seyhan', 'Selçuklu', 'Şahinbey'];

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

  // 2. Iterate and create missing subcategories and listings
  for (const [categorySlug, subcats] of Object.entries(NEW_SUBCATEGORIES)) {
    // Find parent category
    const category = await prisma.category.findUnique({
        where: { slug: categorySlug }
    });

    if (!category) {
        console.log(`Kategori ${categorySlug} bulunamadı, geçiliyor.`);
        continue;
    }

    console.log(`Kategori işleniyor: ${category.name} (${categorySlug})`);

    for (const subDef of subcats) {
        // Check if subcategory exists
        let subCategory = await prisma.subCategory.findFirst({
            where: { 
                slug: subDef.slug,
                categoryId: category.id
            }
        });

        // Create if not exists
        if (!subCategory) {
            console.log(`  Alt kategori oluşturuluyor: ${subDef.name}`);
            subCategory = await prisma.subCategory.create({
                data: {
                    name: subDef.name,
                    slug: subDef.slug,
                    categoryId: category.id
                }
            });
        } else {
            console.log(`  Alt kategori mevcut: ${subDef.name}`);
        }

        // Check existing listings count for this subcategory
        const listingCount = await prisma.listing.count({
            where: {
                subCategoryId: subCategory.id,
                ownerId: user.id
            }
        });

        if (listingCount >= 2) {
            console.log(`    ${subDef.name} için talepler geçiliyor, zaten ${listingCount} tane var.`);
            continue;
        }

        // Create listings
        console.log(`    ${subDef.name} için talepler oluşturuluyor...`);
        for (let i = 1; i <= 2; i++) {
            const title = `${subCategory.name} - Fırsat Talebi ${i}`;
            const description = `Bu, ${category.name} > ${subCategory.name} kategorisinde oluşturulmuş ${i}. örnek taleptir. Detaylı bilgi için iletişime geçiniz.`;
            
            let attributes = {};
            // Simple random attributes
            if (category.slug === 'vasita') {
                attributes = {
                    marka: getRandomItem(['Fiat', 'Renault', 'Ford', 'Toyota']),
                    yil: 2015 + i,
                    yakit: getRandomItem(['Dizel', 'Benzin']),
                    vites: getRandomItem(['Manuel', 'Otomatik'])
                };
            } else if (category.slug === 'emlak') {
                attributes = {
                    metrekare: 100 + (i * 20),
                    isitma: 'Kombi',
                    binaYasi: getRandomInt(0, 20)
                };
            } else {
                attributes = {
                    durum: getRandomItem(['Sıfır', 'İkinci El']),
                    garanti: getRandomItem(['Var', 'Yok'])
                };
            }
      
            const listingData = {
              title: title,
              description: description,
              budget: BigInt(getRandomInt(500, 500000)),
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
      
            console.log(`      Oluşturuldu: ${listing.title}`);
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
