const fs = require('fs');
const { execSync } = require('child_process');

// Fallback: Generate using openssl command line if available (git bash usually has it)
try {
    console.log('OpenSSL ile oluşturulmaya çalışılıyor...');
    execSync('openssl req -x509 -newkey rsa:4096 -keyout server.key -out server.crt -days 365 -nodes -subj "/CN=varsagel.com"', { stdio: 'inherit' });
    console.log('✅ Sertifikalar OpenSSL ile oluşturuldu');
} catch (e) {
    console.log('OpenSSL başarısız oldu, Forge ile manuel oluşturma deneniyor...');
    // We will use node-forge which is more robust
    try {
        execSync('npm install node-forge --no-save', { stdio: 'inherit' });
        const forge = require('node-forge');
        
        const keys = forge.pki.rsa.generateKeyPair(2048);
        const cert = forge.pki.createCertificate();
        cert.publicKey = keys.publicKey;
        cert.serialNumber = '01';
        cert.validity.notBefore = new Date();
        cert.validity.notAfter = new Date();
        cert.validity.notAfter.setFullYear(cert.validity.notBefore.getFullYear() + 1);
        
        const attrs = [{
          name: 'commonName',
          value: 'varsagel.com'
        }, {
          name: 'countryName',
          value: 'TR'
        }, {
          shortName: 'ST',
          value: 'Istanbul'
        }, {
          name: 'localityName',
          value: 'Istanbul'
        }, {
          name: 'organizationName',
          value: 'Varsagel'
        }, {
          shortName: 'OU',
          value: 'Dev'
        }];
        
        cert.setSubject(attrs);
        cert.setIssuer(attrs);
        cert.sign(keys.privateKey);

        const pem_cert = forge.pki.certificateToPem(cert);
        const pem_key = forge.pki.privateKeyToPem(keys.privateKey);

        fs.writeFileSync('server.crt', pem_cert);
        fs.writeFileSync('server.key', pem_key);
        console.log('✅ Sertifikalar node-forge ile oluşturuldu');
    } catch (err) {
        console.error('Tüm yöntemler başarısız oldu:', err);
        process.exit(1);
    }
}
