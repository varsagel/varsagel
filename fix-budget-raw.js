const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function fixBudgetWithRawSQL() {
  try {
    console.log('Budget değerleri düzeltiliyor...');
    
    // Önce raw SQL ile büyük değerleri kontrol et
    const problematicRows = await prisma.$queryRaw`
      SELECT id, title, budget 
      FROM "Listing" 
      WHERE budget > 2147483647 OR budget < 0
    `;
    
    console.log(`Problem ${problematicRows.length} ilan bulundu:`);
    problematicRows.forEach(row => {
      console.log(`ID: ${row.id}, Başlık: ${row.title}, Budget: ${row.budget}`);
    });
    
    // Büyük değerleri güvenli bir değere ayarla
    const result = await prisma.$executeRaw`
      UPDATE "Listing" 
      SET "budget" = 10000 
      WHERE "budget" > 2147483647 OR "budget" < 0
    `;
    
    console.log(`${result} satır güncellendi.`);
    
    // Kontrol et
    const remaining = await prisma.$queryRaw`
      SELECT COUNT(*) as count 
      FROM "Listing" 
      WHERE budget > 2147483647 OR budget < 0
    `;
    
    console.log(`Kalan problem: ${remaining[0].count}`);
    
  } catch (error) {
    console.error('Hata:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixBudgetWithRawSQL();