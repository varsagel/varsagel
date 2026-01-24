
const https = require('https');

const path = process.argv[2] || '/ilan/cmix9ihlf0002zgnl26m9j20o';
console.log(`İstek başlatılıyor: https://localhost:3004${path} (Host: www.varsagel.com)`);

const req = https.request(
  {
    hostname: 'localhost',
    port: 3004,
    path,
    method: 'GET',
    rejectUnauthorized: false,
    headers: { host: 'www.varsagel.com' },
  },
  (res) => {
  console.log('Yanıt alındı, durum:', res.statusCode);
  console.log('Location:', res.headers.location || '-');
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  res.on('end', () => {
    console.log('Veri alındı, uzunluk:', data.length);
    console.log('İçerikte ilan başlığı var mı:', data.includes('Hond') ? 'EVET' : 'HAYIR');
    const ogTitle = data.match(/<meta[^>]+property="og:title"[^>]+content="([^"]*)"/);
    const ogDesc = data.match(/<meta[^>]+property="og:description"[^>]+content="([^"]*)"/);
    const ogUrl = data.match(/<meta[^>]+property="og:url"[^>]+content="([^"]*)"/);
    const htmlTitle = data.match(/<title[^>]*>([^<]*)<\/title>/i);
    const canonical = data.match(/<link[^>]+rel="canonical"[^>]+href="([^"]*)"/i);
    
    console.log('OG Başlık:', ogTitle ? ogTitle[1] : 'Bulunamadı');
    console.log('OG Açıklama:', ogDesc ? ogDesc[1] : 'Bulunamadı');
    console.log('OG URL:', ogUrl ? ogUrl[1] : 'Bulunamadı');
    console.log('HTML Title:', htmlTitle ? htmlTitle[1] : 'Bulunamadı');
    console.log('Canonical:', canonical ? canonical[1] : 'Bulunamadı');

    const metaDesc = data.match(/<meta[^>]+name="description"[^>]+content="([^"]*)"/);
    console.log('Meta Açıklama:', metaDesc ? metaDesc[1] : 'Bulunamadı');
  });
});
req.end();

req.on('error', (err) => {
  console.error('İstek yapılırken hata oluştu:', err.message);
});
