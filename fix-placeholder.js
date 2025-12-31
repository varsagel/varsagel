// Veritabanında placeholder-image.jpg arayan script
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkPlaceholderImages() {
  try {
    // Listing tablosunda ara - doğru column ismi: imagesJson
    const listingsWithPlaceholder = await prisma.$queryRaw`
      SELECT id, title, "imagesJson" 
      FROM "Listing" 
      WHERE "imagesJson" LIKE '%placeholder-image.jpg%'
    `;
    
    console.log('Listings with placeholder-image.jpg:', listingsWithPlaceholder);
    
    // Offer tablosunda ara - doğru column ismi: imagesJson
    const offersWithPlaceholder = await prisma.$queryRaw`
      SELECT id, "listingId", "imagesJson" 
      FROM "Offer" 
      WHERE "imagesJson" LIKE '%placeholder-image.jpg%'
    `;
    
    console.log('Offers with placeholder-image.jpg:', offersWithPlaceholder);
    
    // Eğer bulursan, güncelleme scripti
    if (listingsWithPlaceholder.length > 0 || offersWithPlaceholder.length > 0) {
      console.log('\n--- UPDATING ---');
      
      // Listing güncellemeleri
      for (const listing of listingsWithPlaceholder) {
        const updatedImagesJson = listing.imagesJson.replace(/placeholder-image\.jpg/g, '/images/placeholder-1.svg');
        await prisma.$executeRaw`
          UPDATE "Listing" 
          SET "imagesJson" = ${updatedImagesJson}::text
          WHERE id = ${listing.id}
        `;
        console.log(`Updated listing ${listing.id}: ${listing.title}`);
      }
      
      // Offer güncellemeleri
      for (const offer of offersWithPlaceholder) {
        const updatedImagesJson = offer.imagesJson.replace(/placeholder-image\.jpg/g, '/images/placeholder-1.svg');
        await prisma.$executeRaw`
          UPDATE "Offer" 
          SET "imagesJson" = ${updatedImagesJson}::text
          WHERE id = ${offer.id}
        `;
        console.log(`Updated offer ${offer.id}`);
      }
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkPlaceholderImages();