const { execSync } = require('child_process');
const fs = require('fs');

try {
  const selfsigned = require('selfsigned');
  // Try generating without extra options first
  const pems = selfsigned.generate([{ name: 'commonName', value: 'varsagel.com' }], { days: 365 });
  
  // Check structure
  if (pems && pems.private && pems.cert) {
    fs.writeFileSync('server.key', pems.private);
    fs.writeFileSync('server.crt', pems.cert);
    console.log('✅ Sertifikalar başarıyla oluşturuldu');
  } else {
      console.error('❌ Oluşturulan nesne yapısı beklenmedik:', Object.keys(pems));
      process.exit(1);
  }
} catch (e) {
  console.error('Error:', e);
}
