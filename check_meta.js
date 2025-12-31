
const http = require('http');

console.log('İstek başlatılıyor: http://localhost:3004/talep/cmix9ihlf0002zgnl26m9j20o...');

const req = http.get('http://localhost:3004/talep/cmix9ihlf0002zgnl26m9j20o', (res) => {
  console.log('Yanıt alındı, durum:', res.statusCode);
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  res.on('end', () => {
    console.log('Veri alındı, uzunluk:', data.length);
    const titleMatch = data.match(/<meta property="og:title" content="([^"]*)"/);
    const descMatch = data.match(/<meta property="og:description" content="([^"]*)"/);
    
    console.log('OG Başlık:', titleMatch ? titleMatch[1] : 'Bulunamadı');
    console.log('OG Açıklama:', descMatch ? descMatch[1] : 'Bulunamadı');
    
    // Also check standard description
    const metaDesc = data.match(/<meta name="description" content="([^"]*)"/);
    console.log('Meta Açıklama:', metaDesc ? metaDesc[1] : 'Bulunamadı');
  });
});

req.on('error', (err) => {
  console.error('İstek yapılırken hata oluştu:', err.message);
});
