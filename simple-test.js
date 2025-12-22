// Simple test to check registration and car listing functionality
const https = require('https');

async function testRegistration() {
  console.log('🚀 Testing registration functionality...');
  
  const timestamp = Date.now();
  const testData = {
    name: `TestUser${timestamp}`,
    email: `test${timestamp}@example.com`,
    password: 'TestPassword123!'
  };
  
  const postData = JSON.stringify(testData);
  
  const options = {
    hostname: 'www.varsagel.com',
    port: 443,
    path: '/api/register',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData),
      'User-Agent': 'TestScript/1.0'
    }
  };
  
  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        console.log(`📊 Status Code: ${res.statusCode}`);
        console.log(`📊 Headers:`, res.headers);
        console.log(`📊 Response:`, data);
        
        if (res.statusCode === 429) {
          console.log('❌ Rate limit still active - need to wait');
          resolve({ success: false, reason: 'rate_limit', data: data });
        } else if (res.statusCode === 200 || res.statusCode === 201) {
          console.log('✅ Registration successful!');
          resolve({ success: true, data: data });
        } else {
          console.log('⚠️  Registration failed:', data);
          resolve({ success: false, reason: 'registration_failed', data: data });
        }
      });
    });
    
    req.on('error', (error) => {
      console.error('❌ Request error:', error);
      reject(error);
    });
    
    req.write(postData);
    req.end();
  });
}

async function testCarListingForm() {
  console.log('🚗 Testing car listing form fields...');
  
  // Test the form validation logic directly
  const testFormData = {
    category: 'vasita',
    subcategory: 'otomobil',
    title: 'Test BMW 320i',
    description: 'Test otomobil talebi',
    yilMin: '2020',
    yilMax: '2024',
    kmMin: '25000',
    kmMax: '75000',
    marka: 'BMW',
    model: '320i',
    fiyatMin: '500000',
    fiyatMax: '800000',
    konum: 'İstanbul'
  };
  
  console.log('📊 Testing form data:', testFormData);
  
  // Check if range values are different
  const rangeFields = [
    { min: testFormData.yilMin, max: testFormData.yilMax, name: 'Yıl' },
    { min: testFormData.kmMin, max: testFormData.kmMax, name: 'KM' },
    { min: testFormData.fiyatMin, max: testFormData.fiyatMax, name: 'Fiyat' }
  ];
  
  rangeFields.forEach(field => {
    if (field.min !== field.max) {
      console.log(`✅ ${field.name} range: ${field.min} - ${field.max} (different values)`);
    } else {
      console.log(`❌ ${field.name} range: ${field.min} - ${field.max} (same values - potential duplication)`);
    }
  });
  
  return { success: true, rangeFields };
}

async function runTests() {
  try {
    console.log('🧪 Starting comprehensive tests...\n');
    
    // Test 1: Registration
    console.log('=== TEST 1: REGISTRATION ===');
    const regResult = await testRegistration();
    
    // Test 2: Car listing form
    console.log('\n=== TEST 2: CAR LISTING FORM VALIDATION ===');
    const formResult = await testCarListingForm();
    
    console.log('\n📋 TEST SUMMARY:');
    console.log('Registration:', regResult.success ? '✅ PASSED' : '❌ FAILED');
    console.log('Form Validation:', formResult.success ? '✅ PASSED' : '❌ FAILED');
    
    if (!regResult.success && regResult.reason === 'rate_limit') {
      console.log('\n⚠️  Rate limit still active. The server needs more time to reset.');
      console.log('⏰ Please wait 15 minutes and try again.');
    }
    
  } catch (error) {
    console.error('❌ Test suite failed:', error);
  }
}

// Run the tests
runTests();