// Security middleware test script
const http = require('http');

function testSecurityHeaders() {
  const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/health',
    method: 'GET',
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    }
  };

  const req = http.request(options, (res) => {
    console.log('Status Code:', res.statusCode);
    console.log('Headers:', res.headers);
    
    // Check for security headers
    const securityHeaders = [
      'x-content-type-options',
      'x-frame-options', 
      'x-xss-protection',
      'referrer-policy',
      'content-security-policy',
      'strict-transport-security'
    ];
    
    console.log('\n=== Security Headers Check ===');
    securityHeaders.forEach(header => {
      if (res.headers[header]) {
        console.log(`✅ ${header}: ${res.headers[header]}`);
      } else {
        console.log(`❌ Missing: ${header}`);
      }
    });
    
    // Check for removed server headers
    console.log('\n=== Server Headers Check ===');
    if (!res.headers['x-powered-by'] && !res.headers['server']) {
      console.log('✅ Server information headers removed');
    } else {
      console.log('❌ Server headers still present');
    }
  });

  req.on('error', (err) => {
    console.error('Request failed:', err.message);
    console.log('\n⚠️  Make sure the development server is running on port 3000');
    console.log('   Run: npm run dev');
  });

  req.end();
}

function testSuspiciousRequest() {
  const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/test?union=select&from=users',
    method: 'GET',
    headers: {
      'User-Agent': 'sqlmap/1.0'
    }
  };

  const req = http.request(options, (res) => {
    console.log('\n=== Suspicious Request Test ===');
    console.log('Status Code:', res.statusCode);
    if (res.statusCode === 403) {
      console.log('✅ Suspicious request blocked successfully');
    } else {
      console.log('❌ Suspicious request was not blocked');
    }
  });

  req.on('error', (err) => {
    console.error('Suspicious request test failed:', err.message);
  });

  req.end();
}

// Run tests
console.log('Testing security middleware...\n');
testSecurityHeaders();

setTimeout(() => {
  testSuspiciousRequest();
}, 2000);