const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function fixBudgetValues() {
  try {
    // Tüm listing'leri getir
    const listings = await prisma.listing.findMany();
    
    console.log(`Toplam ${listings.length} ilan bulundu.`);
    
    // Büyük budget değerlerini kontrol et
    const problematicListings = listings.filter(listing => 
      listing.budget && (listing.budget > 2147483647 || listing.budget < 0)
    );
    
    console.log(`Problem ${problematicListings.length} ilan bulundu:`);
    problematicListings.forEach(listing => {
      console.log(`ID: ${listing.id}, Başlık: ${listing.title}, Budget: ${listing.budget}`);
    });
    
    // Problematik değerleri düzelt
    for (const listing of problematicListings) {
      await prisma.listing.update({
        where: { id: listing.id },
        data: { budget: 10000 } // Güvenli bir değer
      });
      console.log(`İlan ${listing.id} budget değeri düzeltildi.`);
    }
    
    console.log('Tüm budget değerleri düzeltildi.');
    
  } catch (error) {
    console.error('Hata:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixBudgetValues();