require('dotenv').config({ path: '.env.local' });
const bcrypt = require('bcrypt');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function createTestUser() {
  try {
    // Test kullanıcısı oluştur
    const hashedPassword = await bcrypt.hash('test123', 10);
    
    const user = await prisma.user.create({
      data: {
        email: 'test@example.com',
        name: 'Test Kullanıcı',
        passwordHash: hashedPassword,
      }
    });
    
    console.log('Test kullanıcısı oluşturuldu:', user);
    console.log('Email: test@example.com');
    console.log('Şifre: test123');
    
  } catch (error) {
    console.error('Hata:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createTestUser();