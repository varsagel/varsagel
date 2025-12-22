const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    console.log('Tüm talepler kontrol ediliyor...');
    
    // Tüm talepleri getir
    const listings = await prisma.listing.findMany({
      include: {
        category: true,
        subCategory: true,
        owner: true,
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    console.log(`Toplam talep sayısı: ${listings.length}`);
    
    if (listings.length === 0) {
      console.log('Henüz hiç talep yok.');
    } else {
      listings.forEach((listing, index) => {
        console.log(`\n--- Talep ${index + 1} ---`);
        console.log(`ID: ${listing.id}`);
        console.log(`Başlık: ${listing.title}`);
        console.log(`Açıklama: ${listing.description}`);
        console.log(`Kategori: ${listing.category?.name || 'Yok'}`);
        console.log(`Alt Kategori: ${listing.subCategory?.name || 'Yok'}`);
        console.log(`Şehir: ${listing.city}`);
        console.log(`İlçe: ${listing.district}`);
        console.log(`Bütçe: ${listing.budget}`);
        console.log(`Durum: ${listing.status}`);
        console.log(`Oluşturan: ${listing.owner?.email || 'Bilinmeyen'}`);
        console.log(`Oluşturulma: ${listing.createdAt}`);
      });
    }
    
    // Kategorileri de kontrol edelim
    console.log('\n--- Kategoriler ---');
    const categories = await prisma.category.findMany({
      include: {
        subcategories: true
      }
    });
    
    console.log(`Toplam kategori sayısı: ${categories.length}`);
    categories.forEach(cat => {
      console.log(`- ${cat.name} (${cat.slug}) - ${cat.subcategories.length} alt kategori`);
    });
    
  } catch (error) {
    console.error('Hata:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();