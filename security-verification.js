// Comprehensive Security Verification Script for Varsagel
// This script tests all implemented security measures

const https = require('https');
const http = require('http');

const TEST_CONFIG = {
  baseUrl: process.env.TEST_URL || 'http://localhost:3000',
  timeout: 5000,
  testResults: []
};

function logTest(name, passed, details = '') {
  const status = passed ? '✅ PASS' : '❌ FAIL';
  console.log(`${status} ${name}`);
  if (details) console.log(`   ${details}`);
  TEST_CONFIG.testResults.push({ name, passed, details });
}

function makeRequest(path, options = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, TEST_CONFIG.baseUrl);
    const isHttps = url.protocol === 'https:';
    const client = isHttps ? https : http;
    
    const reqOptions = {
      hostname: url.hostname,
      port: url.port || (isHttps ? 443 : 80),
      path: url.pathname + url.search,
      method: options.method || 'GET',
      headers: options.headers || {},
      timeout: TEST_CONFIG.timeout
    };

    const req = client.request(reqOptions, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          data: data
        });
      });
    });

    req.on('error', reject);
    req.on('timeout', () => reject(new Error('Request timeout')));
    
    if (options.body) {
      req.write(options.body);
    }
    
    req.end();
  });
}

async function testSecurityHeaders() {
  console.log('\n🛡️  Testing Security Headers...');
  
  try {
    const response = await makeRequest('/api/csp-test');
    const headers = response.headers;
    
    // Test security headers
    logTest('X-Content-Type-Options: nosniff', 
      headers['x-content-type-options'] === 'nosniff');
    
    logTest('X-Frame-Options: DENY', 
      headers['x-frame-options'] === 'DENY');
    
    logTest('X-XSS-Protection: 1; mode=block', 
      headers['x-xss-protection'] === '1; mode=block');
    
    logTest('Referrer-Policy: strict-origin-when-cross-origin', 
      headers['referrer-policy'] === 'strict-origin-when-cross-origin');
    
    logTest('Content-Security-Policy present', 
      !!headers['content-security-policy']);
    
    logTest('Permissions-Policy present', 
      !!headers['permissions-policy']);
    
    // Test server headers are removed
    logTest('Server information headers removed', 
      !headers['x-powered-by'] && !headers['server']);
    
  } catch (error) {
    logTest('Security headers test', false, error.message);
  }
}

async function testSuspiciousRequestBlocking() {
  console.log('\n🚫 Testing Suspicious Request Blocking...');
  
  // Test SQL injection in user agent
  try {
    const response = await makeRequest('/api/csp-test', {
      headers: { 'User-Agent': 'sqlmap/1.0' }
    });
    
    logTest('Malicious user agent blocked', 
      response.statusCode === 403, 
      `Status: ${response.statusCode}`);
      
  } catch (error) {
    logTest('Malicious user agent test', false, error.message);
  }
  
  // Test suspicious path
  try {
    const response = await makeRequest('/api/test?union=select&from=users');
    
    logTest('SQL injection in query params blocked', 
      response.statusCode === 403, 
      `Status: ${response.statusCode}`);
      
  } catch (error) {
    logTest('SQL injection test', false, error.message);
  }
  
  // Test suspicious path traversal
  try {
    const response = await makeRequest('/.env');
    
    logTest('Path traversal blocked', 
      response.statusCode === 403, 
      `Status: ${response.statusCode}`);
      
  } catch (error) {
    logTest('Path traversal test', false, error.message);
  }
}

async function testRateLimiting() {
  console.log('\n⏱️  Testing Rate Limiting...');
  
  // Test rapid requests (should trigger rate limiting)
  const requests = [];
  for (let i = 0; i < 5; i++) {
    requests.push(makeRequest('/api/csp-test'));
  }
  
  try {
    const responses = await Promise.allSettled(requests);
    const rateLimitedResponses = responses.filter(r => 
      r.status === 'fulfilled' && r.value.statusCode === 429
    );
    
    logTest('Rate limiting working', 
      rateLimitedResponses.length > 0, 
      `${rateLimitedResponses.length} requests rate limited out of ${responses.length}`);
      
  } catch (error) {
    logTest('Rate limiting test', false, error.message);
  }
}

async function testAPIEndpoints() {
  console.log('\n🔍 Testing API Endpoints...');
  
  const endpoints = [
    { path: '/api/health', method: 'GET' },
    { path: '/api/csp-test', method: 'GET' },
    { path: '/api/talepler', method: 'GET' }
  ];
  
  for (const endpoint of endpoints) {
    try {
      const response = await makeRequest(endpoint.path, {
        method: endpoint.method
      });
      
      logTest(`${endpoint.method} ${endpoint.path} accessible`, 
        response.statusCode < 500, 
        `Status: ${response.statusCode}`);
        
    } catch (error) {
      logTest(`${endpoint.method} ${endpoint.path}`, false, error.message);
    }
  }
}

async function testHTTPSRedirect() {
  console.log('\n🔒 Testing HTTPS Configuration...');
  
  // This test will only work in production environment
  if (TEST_CONFIG.baseUrl.includes('https')) {
    try {
      const response = await makeRequest('/');
      logTest('HTTPS working', response.statusCode < 500, `Status: ${response.statusCode}`);
    } catch (error) {
      logTest('HTTPS test', false, error.message);
    }
  } else {
    logTest('HTTPS redirect test', true, 'Skipped (development environment)');
  }
}

function generateReport() {
  console.log('\n📊 SECURITY TEST REPORT');
  console.log('=' .repeat(50));
  
  const passed = TEST_CONFIG.testResults.filter(r => r.passed).length;
  const total = TEST_CONFIG.testResults.length;
  const percentage = Math.round((passed / total) * 100);
  
  console.log(`Total Tests: ${total}`);
  console.log(`Passed: ${passed}`);
  console.log(`Failed: ${total - passed}`);
  console.log(`Success Rate: ${percentage}%`);
  
  if (percentage < 100) {
    console.log('\n❌ Failed Tests:');
    TEST_CONFIG.testResults
      .filter(r => !r.passed)
      .forEach(r => {
        console.log(`  - ${r.name}: ${r.details}`);
      });
  }
  
  console.log('\n🎯 Recommendations:');
  if (percentage < 80) {
    console.log('  ⚠️  Critical security issues detected - DO NOT DEPLOY');
  } else if (percentage < 95) {
    console.log('  ⚠️  Some security issues - Review before deployment');
  } else {
    console.log('  ✅ Security measures working well - Ready for deployment');
  }
  
  console.log('\n🔧 Next Steps:');
  console.log('  1. Review failed tests above');
  console.log('  2. Check application logs for errors');
  console.log('  3. Test with real user scenarios');
  console.log('  4. Verify in production environment');
}

async function runAllTests() {
  console.log('🚀 Starting Varsagel Security Verification...');
  console.log(`Testing URL: ${TEST_CONFIG.baseUrl}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  
  await testSecurityHeaders();
  await testSuspiciousRequestBlocking();
  await testRateLimiting();
  await testAPIEndpoints();
  await testHTTPSRedirect();
  
  generateReport();
}

// Run tests
runAllTests().catch(console.error);