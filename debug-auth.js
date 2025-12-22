const http = require('http');
const https = require('https');

// Ignore self-signed certs
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

function request(options, data) {
  return new Promise((resolve, reject) => {
    const lib = options.protocol === 'https:' ? https : http;
    const req = lib.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => resolve({ statusCode: res.statusCode, headers: res.headers, body }));
    });
    req.on('error', reject);
    if (data) req.write(data);
    req.end();
  });
}

async function run() {
  const baseUrl = 'https://www.varsagel.com';
  
  console.log('1. Getting CSRF token...');
  const csrfRes = await request({
    method: 'GET',
    host: 'www.varsagel.com',
    port: 443,
    path: '/api/auth/csrf',
    protocol: 'https:'
  });
  
  console.log('CSRF Response:', csrfRes.statusCode);
  const cookies = csrfRes.headers['set-cookie'];
  const csrfData = JSON.parse(csrfRes.body);
  const csrfToken = csrfData.csrfToken;
  console.log('CSRF Token:', csrfToken);

  console.log('2. Initiating Google Signin...');
  // NextAuth v5 signin is a POST to /api/auth/signin/{provider}
  const postData = new URLSearchParams({
    csrfToken: csrfToken,
    callbackUrl: 'https://www.varsagel.com/'
  }).toString();

  const signinRes = await request({
    method: 'POST',
    host: 'www.varsagel.com',
    port: 443,
    path: '/api/auth/signin/google',
    protocol: 'https:',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Content-Length': Buffer.byteLength(postData),
      'Cookie': cookies ? cookies.join('; ') : ''
    }
  }, postData);

  console.log('Signin Response Status:', signinRes.statusCode);
  console.log('Signin Headers:', signinRes.headers);
  console.log('Signin Body:', signinRes.body);
}

run().catch(console.error);
