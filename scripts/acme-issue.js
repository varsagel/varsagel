const fs = require('fs');
const path = require('path');
const acme = require('acme-client');

(async () => {
  try {
    const domain = 'varsagel.com';
    const altNames = ['www.varsagel.com'];

    const accountKey = await acme.forge.createPrivateKey();
    const client = new acme.Client({
      directoryUrl: acme.directory.letsencrypt.production,
      accountKey,
    });

    const [key, csr] = await acme.forge.createCsr({
      commonName: domain,
      altNames,
    });

    const challengesDir = path.join(process.cwd(), 'public', '.well-known', 'acme-challenge');
    fs.mkdirSync(challengesDir, { recursive: true });

    const challengeCreateFn = async (authz, challenge, keyAuthorization) => {
      const tokenPath = path.join(challengesDir, challenge.token);
      fs.writeFileSync(tokenPath, keyAuthorization);
      console.log('Doğrulama dosyası oluşturuldu:', tokenPath);
    };

    const challengeRemoveFn = async (authz, challenge, keyAuthorization) => {
      const tokenPath = path.join(challengesDir, challenge.token);
      try { fs.unlinkSync(tokenPath); } catch {}
      console.log('Doğrulama dosyası silindi:', tokenPath);
    };

    const cert = await client.auto({
      csr,
      email: 'varsagel.com@gmail.com',
      termsOfServiceAgreed: true,
      challengeCreateFn,
      challengeRemoveFn,
      challengePriority: ['http-01'],
    });

    fs.writeFileSync(path.join(process.cwd(), 'server.crt'), cert);
    fs.writeFileSync(path.join(process.cwd(), 'server.key'), key);
    console.log('Sertifika ve anahtar server.crt ve server.key dosyalarına yazıldı');
  } catch (e) {
    console.error('ACME sertifika alma başarısız:', e);
    process.exit(1);
  }
})();

