const https = require('https');
const http = require('http');

// Global fetch is available in Node 18+, but we might need a custom agent for self-signed certs
const agent = new https.Agent({
  rejectUnauthorized: false
});

async function testTalepOlustur() {
  console.log('Test başlatılıyor...');

  // Try HTTP first, then HTTPS if that fails
  const protocols = ['https']; // User requested https
  const ports = [3004]; // User requested port 3004
  const hostname = 'www.varsagel.com';
  
  // Örnek veri - Emlak / Satılık Daire
  const payload = {
    title: "Otomatik Test İlanı - Satılık Daire " + Date.now(),
    description: "Bu bir otomatik test ilanıdır. Detaylı açıklama en az 20 karakter olmalıdır.",
    category: "emlak",
    subcategory: "satilik-daire",
    city: "İstanbul",
    district: "Kadıköy",
    budget: "5000000",
    images: [],
    attributes: {
      odaSayisi: '3+1',
      binaYasiMin: '5',
      binaYasiMax: '10',
      isitma: 'Doğalgaz (Kombi)',
      banyoSayisi: '2',
      balkon: true,
      esyali: false,
      kullanimDurumu: 'Boş',
      siteIcerisinde: true,
      aidat: '1500',
      cephe: ['Güney', 'Doğu'],
      tapuDurumu: 'Kat Mülkiyeti'
    }
  };

  console.log('Gönderilecek veri:', JSON.stringify(payload, null, 2));

  for (const port of ports) {
    for (const protocol of protocols) {
      const endpoint = `${protocol}://${hostname}:${port}/api/talep-olustur`;
      console.log(`Testing endpoint: ${endpoint}`);

      try {
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-bypass-auth': 'true',
            'x-debug-user-email': 'test@example.com'
          },
          body: JSON.stringify(payload),
          agent: protocol === 'https' ? agent : undefined,
        });

        const status = response.status;
        const text = await response.text();
        let result;
        try {
          result = JSON.parse(text);
        } catch (e) {
          result = text;
        }

        console.log(`[${protocol}:${port}] Yanıt Kodu:`, status);
        console.log(`[${protocol}:${port}] Yanıt Gövdesi:`, typeof result === 'string' ? result.substring(0, 200) : JSON.stringify(result, null, 2));

        if (status === 200 || status === 201) {
          console.log('✅ TEST BAŞARILI: İlan oluşturuldu.');
          return; // Success
        } else {
          console.log('❌ TEST BAŞARISIZ: Hata alındı.');
        }
      } catch (error) {
        // Connection refused is expected for wrong ports
        if (error.cause && error.cause.code === 'ECONNREFUSED') {
          // console.log(`Skipping ${endpoint} (Connection refused)`);
        } else {
          console.error(`❌ TEST HATASI (${endpoint}):`, error.message);
        }
      }
    }
  }
}

// Node 18+ workaround for self-signed certs with global fetch
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

testTalepOlustur();
