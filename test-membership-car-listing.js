// Comprehensive test script for membership creation and car listing
const puppeteer = require('puppeteer');

async function testMembershipAndCarListing() {
  const browser = await puppeteer.launch({ 
    headless: false,
    slowMo: 100 // Slow down for better debugging
  });
  
  const page = await browser.newPage();
  
  try {
    console.log('🚀 Starting comprehensive test...');
    
    // Step 1: Navigate to registration page
    console.log('📋 Step 1: Navigating to registration page...');
    await page.goto('https://www.varsagel.com/kayit');
    await page.waitForTimeout(2000);
    
    // Generate unique test data
    const timestamp = Date.now();
    const testEmail = `testuser${timestamp}@example.com`;
    const testName = `Test User ${timestamp}`;
    const testPassword = 'TestPassword123!';
    
    console.log(`📝 Test data: Email: ${testEmail}, Name: ${testName}`);
    
    // Step 2: Fill registration form
    console.log('📋 Step 2: Filling registration form...');
    await page.type('input[name="name"]', testName);
    await page.type('input[name="email"]', testEmail);
    await page.type('input[name="password"]', testPassword);
    await page.type('input[name="confirmPassword"]', testPassword);
    
    // Step 3: Submit registration
    console.log('🚀 Step 3: Submitting registration form...');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(3000);
    
    // Check for success message or errors
    const pageContent = await page.content();
    if (pageContent.includes('Kayıt işlemi başlatıldı')) {
      console.log('✅ Registration submitted successfully!');
      console.log('📧 Check email for verification link...');
    } else if (pageContent.includes('429')) {
      console.log('❌ Rate limit hit - waiting 15 minutes...');
      return;
    } else {
      console.log('⚠️  Registration response:', pageContent.substring(0, 500));
    }
    
    // Step 4: Navigate to login page
    console.log('🔐 Step 4: Navigating to login page...');
    await page.goto('https://www.varsagel.com/giris');
    await page.waitForTimeout(2000);
    
    // Step 5: Login with new credentials
    console.log('🔐 Step 5: Logging in with new credentials...');
    await page.type('input[name="email"]', testEmail);
    await page.type('input[name="password"]', testPassword);
    await page.click('button[type="submit"]');
    await page.waitForTimeout(3000);
    
    // Check if login was successful
    const currentUrl = page.url();
    if (currentUrl.includes('giris')) {
      console.log('❌ Login failed - might need email verification first');
    } else {
      console.log('✅ Login successful!');
    }
    
    // Step 6: Navigate to car listing creation
    console.log('🚗 Step 6: Navigating to car listing creation...');
    await page.goto('https://www.varsagel.com/talep-olustur');
    await page.waitForTimeout(2000);
    
    // Step 7: Select vehicle category
    console.log('🚗 Step 7: Selecting vehicle category...');
    await page.click('button[data-category="vasita"]');
    await page.waitForTimeout(1000);
    
    // Step 8: Select subcategory (otomobil)
    console.log('🚗 Step 8: Selecting otomobil subcategory...');
    await page.click('button[data-subcategory="otomobil"]');
    await page.waitForTimeout(1000);
    
    // Step 9: Fill car listing form
    console.log('🚗 Step 9: Filling car listing form...');
    
    // Title
    await page.type('input[name="title"]', 'Test Otomobil Talebi - BMW 3 Serisi');
    
    // Description
    await page.type('textarea[name="description"]', 'Test amaçlı oluşturulan BMW 3 Serisi otomobil talebi. Tüm özellikler test edilmektedir.');
    
    // Year range fields (testing the fix)
    console.log('🚗 Testing year range fields (min/max)...');
    await page.type('input[name="yilMin"]', '2020');
    await page.type('input[name="yilMax"]', '2024');
    
    // KM range fields (testing the fix)
    console.log('🚗 Testing KM range fields (min/max)...');
    await page.type('input[name="kmMin"]', '25000');
    await page.type('input[name="kmMax"]', '75000');
    
    // Brand selection
    console.log('🚗 Selecting brand...');
    await page.click('select[name="marka"]');
    await page.select('select[name="marka"]', 'BMW');
    await page.waitForTimeout(500);
    
    // Model
    await page.type('input[name="model"]', '320i');
    
    // Price range
    await page.type('input[name="fiyatMin"]', '500000');
    await page.type('input[name="fiyatMax"]', '800000');
    
    // Location
    await page.type('input[name="konum"]', 'İstanbul, Türkiye');
    
    // Step 10: Verify range fields are working correctly
    console.log('🔍 Step 10: Verifying range fields are working correctly...');
    
    const yilMin = await page.$eval('input[name="yilMin"]', el => el.value);
    const yilMax = await page.$eval('input[name="yilMax"]', el => el.value);
    const kmMin = await page.$eval('input[name="kmMin"]', el => el.value);
    const kmMax = await page.$eval('input[name="kmMax"]', el => el.value);
    
    console.log(`📊 Current field values:`);
    console.log(`   Yıl Min: ${yilMin}`);
    console.log(`   Yıl Max: ${yilMax}`);
    console.log(`   KM Min: ${kmMin}`);
    console.log(`   KM Max: ${kmMax}`);
    
    // Check if all values are different (no duplication)
    const allValues = [yilMin, yilMax, kmMin, kmMax];
    const uniqueValues = [...new Set(allValues)];
    
    if (uniqueValues.length === 4) {
      console.log('✅ SUCCESS: All range-number fields have different values - no duplication!');
    } else {
      console.log('❌ FAILED: Some fields have duplicate values');
      console.log('   All values:', allValues);
      console.log('   Unique values:', uniqueValues);
    }
    
    // Step 11: Submit the form
    console.log('🚀 Step 11: Submitting car listing form...');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(5000);
    
    // Step 12: Check result
    console.log('🔍 Step 12: Checking submission result...');
    const finalUrl = page.url();
    const finalContent = await page.content();
    
    if (finalUrl.includes('taleplerim') || finalContent.includes('Talebiniz başarıyla oluşturuldu')) {
      console.log('✅ Car listing created successfully!');
    } else if (finalContent.includes('hata') || finalContent.includes('error')) {
      console.log('❌ Error occurred:', finalContent.substring(0, 1000));
    } else {
      console.log('⚠️  Unexpected result:', finalUrl);
      console.log('Content preview:', finalContent.substring(0, 1000));
    }
    
    // Take final screenshot
    await page.screenshot({ path: 'final-test-result.png', fullPage: true });
    console.log('📸 Screenshot saved as final-test-result.png');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    await page.screenshot({ path: 'error-screenshot.png', fullPage: true });
  } finally {
    await browser.close();
    console.log('🏁 Test completed!');
  }
}

// Run the test
testMembershipAndCarListing();