// Comprehensive test script for membership creation and car listing
const puppeteer = require('puppeteer');
const { PrismaClient } = require('@prisma/client');

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

async function testMembershipAndCarListing() {
  const baseUrl = 'https://www.varsagel.com:3004';
  const browser = await puppeteer.launch({ 
    headless: false,
    slowMo: 100,
    ignoreHTTPSErrors: true,
    args: ['--ignore-certificate-errors', '--host-resolver-rules=MAP www.varsagel.com 127.0.0.1']
  });
  
  const page = await browser.newPage();
  const prisma = new PrismaClient();
  const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
  const fillInput = async (selector, value) => {
    await page.waitForSelector(selector);
    await page.click(selector, { clickCount: 3 });
    await page.keyboard.press('Backspace');
    await page.type(selector, value);
  };
  const clickByText = async (selector, text) => {
    const clicked = await page.$$eval(
      selector,
      (elements, target) => {
        const match = elements.find((el) => (el.textContent || '').trim().toLowerCase() === String(target).trim().toLowerCase());
        if (!match) return false;
        match.click();
        return true;
      },
      text
    );
    if (!clicked) {
      throw new Error(`Element not found for selector ${selector} with text ${text}`);
    }
  };
  const selectByLabel = async (labelText, value) => {
    return page.evaluate((labelTextInner, valueInner) => {
      const labels = Array.from(document.querySelectorAll('label'));
      const label = labels.find((l) => (l.textContent || '').trim().toLowerCase().startsWith(labelTextInner.toLowerCase()));
      if (!label) return false;
      let container = label.parentElement;
      for (let i = 0; i < 3 && container; i++) {
        const select = container.querySelector('select');
        if (select) {
          if (select.disabled) return false;
          const match = Array.from(select.options || []).find((o) => o.value === valueInner || (o.textContent || '').trim() === valueInner);
          if (!match) return false;
          select.value = match.value;
          select.dispatchEvent(new Event('change', { bubbles: true }));
          return true;
        }
        container = container.parentElement;
      }
      return false;
    }, labelText, value);
  };
  const waitForSelectOption = async (labelText, value, timeoutMs = 10000) => {
    try {
      await page.waitForFunction(
        (labelTextInner, valueInner) => {
          const labels = Array.from(document.querySelectorAll('label'));
          const label = labels.find((l) => (l.textContent || '').trim().toLowerCase().startsWith(labelTextInner.toLowerCase()));
          if (!label) return false;
          let container = label.parentElement;
          for (let i = 0; i < 3 && container; i++) {
            const select = container.querySelector('select');
            if (select) {
              if (select.disabled) return false;
              return Array.from(select.options || []).some((o) => o.value === valueInner || (o.textContent || '').trim() === valueInner);
            }
            container = container.parentElement;
          }
          return false;
        },
        { timeout: timeoutMs },
        labelText,
        value
      );
      return true;
    } catch {
      return false;
    }
  };
  const ensureManualInputByLabel = async (labelText, placeholder) => {
    const selector = `input[placeholder="${placeholder}"]`;
    if (await page.$(selector)) return true;
    const toggled = await page.evaluate((labelTextInner) => {
      const labels = Array.from(document.querySelectorAll('label'));
      const label = labels.find((l) => (l.textContent || '').trim().toLowerCase().startsWith(labelTextInner.toLowerCase()));
      if (!label) return false;
      const container = label.parentElement;
      if (!container) return false;
      const button = Array.from(container.querySelectorAll('button')).find((b) =>
        (b.textContent || '').toLowerCase().includes('elle gir')
AWS_ACCESS_KEY_ID=YENI_ACCESS_KEY
AWS_SECRET_ACCESS_KEY=YENI_SECRET_KEY
AWS_DEFAULT_REGION=eu-north-1      );
      if (button && button instanceof HTMLElement) {
        button.click();
      } else {
        return false;
      }
      return true;
    }, labelText);
    if (!toggled) return false;
    try {
      await page.waitForSelector(selector, { timeout: 2000 });
      return true;
    } catch {
      return false;
    }
  };
  const attemptLogin = async (email, password) => {
    await page.goto(`${baseUrl}/giris?callbackUrl=/talep-olustur`);
    await sleep(1500);
    await fillInput('input[type="email"]', email);
    await fillInput('input[type="password"]', password);
    await page.click('button[type="submit"]');
    await sleep(4000);
    return !page.url().includes('giris');
  };
  
  try {
    console.log('🚀 Starting comprehensive test...');
    
    // Step 1: Navigate to registration page
    console.log('📋 Step 1: Navigating to registration page...');
    await page.goto(`${baseUrl}/kayit`);
    await sleep(2000);
    
    // Generate unique test data
    const timestamp = Date.now();
    const testEmail = `testuser${timestamp}@example.com`;
    const testName = `Test User ${timestamp}`;
    const testPassword = 'TestPassword123!';
    const fallbackEmail = 'verified-test@example.com';
    const fallbackPassword = 'TestPassword123!';
    let loginEmail = testEmail;
    let loginPassword = testPassword;
    
    console.log(`📝 Test data: Email: ${testEmail}, Name: ${testName}`);
    
    // Step 2: Fill registration form
    console.log('📋 Step 2: Filling registration form...');
    await page.waitForSelector('input[placeholder="Adınız Soyadınız"]');
    await page.type('input[placeholder="Adınız Soyadınız"]', testName);
    await page.type('input[type="email"]', testEmail);
    const passwordInputs = await page.$$('input[type="password"]');
    if (passwordInputs.length >= 2) {
      await passwordInputs[0].type(testPassword);
      await passwordInputs[1].type(testPassword);
    } else {
      throw new Error("Registration password fields not found");
    }
    
    // Step 3: Submit registration
    console.log('🚀 Step 3: Submitting registration form...');
    await page.click('button[type="submit"]');
    await sleep(3000);
    
    // Check for success message or errors
    const pageContent = await page.content();
    if (pageContent.includes('Kayıt işlemi başlatıldı')) {
      console.log('✅ Registration submitted successfully!');
      console.log('📧 Check email for verification link...');
    } else if (pageContent.includes('429') || pageContent.toLowerCase().includes('rate limit') || pageContent.toLowerCase().includes('too many')) {
      console.log('❌ Rate limit hit - using fallback verified user...');
      loginEmail = fallbackEmail;
      loginPassword = fallbackPassword;
    } else {
      console.log('⚠️  Registration response:', pageContent.substring(0, 500));
      loginEmail = fallbackEmail;
      loginPassword = fallbackPassword;
    }
    
    // Step 4: Navigate to login page
    console.log('🔐 Step 4: Logging in...');
    let loggedIn = await attemptLogin(loginEmail, loginPassword);
    if (!loggedIn && loginEmail !== fallbackEmail) {
      console.log('❌ Login failed - trying fallback verified user');
      loggedIn = await attemptLogin(fallbackEmail, fallbackPassword);
    }
    if (!loggedIn) {
      const loginContent = await page.content();
      throw new Error(`Login failed, still on login page. Preview: ${loginContent.substring(0, 400)}`);
    }
    console.log('✅ Login successful!');
    
    // Step 6: Navigate to car listing creation
    console.log('🚗 Step 6: Navigating to car listing creation...');
    await page.goto(`${baseUrl}/talep-olustur`);
    await sleep(2000);
    
    // Step 7: Select vehicle category
    console.log('🚗 Step 7: Selecting vehicle category...');
    await page.waitForFunction(
      (label) => Array.from(document.querySelectorAll('h4')).some((el) => (el.textContent || '').trim().toLowerCase() === label),
      {},
      'vasıta'
    );
    await clickByText('h4', 'Vasıta');
    await sleep(1000);
    
    // Step 8: Select subcategory (otomobil)
    console.log('🚗 Step 8: Selecting otomobil subcategory...');
    await page.waitForFunction(
      (label) => Array.from(document.querySelectorAll('button span')).some((el) => (el.textContent || '').trim().toLowerCase() === label),
      {},
      'otomobil'
    );
    await clickByText('button span', 'Otomobil');
    await sleep(1000);
    
    // Step 9: Fill car listing form
    console.log('🚗 Step 9: Filling car listing form...');
    
    await page.waitForSelector('input[placeholder^="Örn: Temiz"]');
    await page.type('input[placeholder^="Örn: Temiz"]', 'Test Otomobil Talebi - BMW 3 Serisi');
    
    await page.type('textarea[placeholder^="Aradığınız ürünün durumunu"]', 'Test amaçlı oluşturulan BMW 3 Serisi otomobil talebi. Tüm özellikler test edilmektedir.');
    
    console.log('🚗 Testing year/KM range fields (min/max)...');
    const minInputs = await page.$$('input[placeholder="En düşük"]');
    const maxInputs = await page.$$('input[placeholder="En yüksek"]');
    if (minInputs.length >= 2 && maxInputs.length >= 2) {
      await minInputs[0].type('2020');
      await maxInputs[0].type('2024');
      await minInputs[1].type('25000');
      await maxInputs[1].type('75000');
    } else {
      throw new Error('Range-number inputs not found');
    }
    
    console.log('🚗 Selecting brand if available...');
    let brandSelected = await selectByLabel('Marka', 'BMW');
    if (!brandSelected) {
      const manualBrandInput = await page.$('input[placeholder="Marka Giriniz"]');
      if (manualBrandInput) {
        await manualBrandInput.type('BMW');
        brandSelected = true;
      }
    }
    if (!brandSelected) {
      console.log('⚠️  Brand field not found or BMW not available');
    }
    
    // Step 10: Verify range fields are working correctly
    console.log('🔍 Step 10: Verifying range fields are working correctly...');
    
    const minValues = await page.$$eval('input[placeholder="En düşük"]', els => els.map(el => el.value));
    const maxValues = await page.$$eval('input[placeholder="En yüksek"]', els => els.map(el => el.value));
    const yilMin = minValues[0] || '';
    const yilMax = maxValues[0] || '';
    const kmMin = minValues[1] || '';
    const kmMax = maxValues[1] || '';
    
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
    
    console.log('➡️ Step 11: Moving to location & budget step...');
    await clickByText('button span', 'Devam Et');
    await sleep(2000);

    console.log('📍 Filling location and budget...');
    const cityReady = await waitForSelectOption('İl', 'İstanbul');
    const citySelected = cityReady ? await selectByLabel('İl', 'İstanbul') : false;
    if (!citySelected) {
      const manualCity = await ensureManualInputByLabel('İl', 'İl giriniz');
      if (!manualCity) throw new Error('City input not available');
      await page.type('input[placeholder="İl giriniz"]', 'İstanbul');
    }
    await sleep(500);

    const districtReady = await waitForSelectOption('İlçe', 'Kadıköy');
    const districtSelected = districtReady ? await selectByLabel('İlçe', 'Kadıköy') : false;
    if (!districtSelected) {
      const manualDistrict = await ensureManualInputByLabel('İlçe', 'İlçe giriniz');
      if (!manualDistrict) throw new Error('District input not available');
      await page.type('input[placeholder="İlçe giriniz"]', 'Kadıköy');
    }
    await sleep(500);

    const hasNeighborhood = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('label')).some((l) => (l.textContent || '').trim().toLowerCase() === 'mahalle');
    });
    if (hasNeighborhood) {
      const neighborhoodReady = await waitForSelectOption('Mahalle', 'Caferağa');
      const neighborhoodSelected = neighborhoodReady ? await selectByLabel('Mahalle', 'Caferağa') : false;
      if (!neighborhoodSelected) {
        const manualNeighborhood = await ensureManualInputByLabel('Mahalle', 'Mahalle giriniz');
        if (!manualNeighborhood) throw new Error('Neighborhood input not available');
        await page.type('input[placeholder="Mahalle giriniz"]', 'Caferağa');
      }
    }

    const budgetInputs = await page.$$('input[placeholder="0"]');
    if (budgetInputs.length >= 2) {
      await budgetInputs[0].type('500000');
      await budgetInputs[1].type('800000');
    } else {
      throw new Error('Budget inputs not found');
    }

    console.log('➡️ Step 12: Moving to review step...');
    await clickByText('button span', 'Devam Et');
    await sleep(2000);

    console.log('🚀 Step 13: Submitting car listing form...');
    await clickByText('button span', 'İlanı Yayınla');
    await sleep(5000);

    console.log('🔍 Step 14: Checking submission result...');
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

    console.log('➡️ Step 15: Getting listing id from profile...');
    await page.goto(`${baseUrl}/profil?tab=taleplerim`);
    await sleep(3000);
    await page.waitForFunction(() =>
      Array.from(document.querySelectorAll('button')).some((el) => (el.textContent || '').trim().toLowerCase() === 'talep detayı')
    );
    await page.evaluate(() => {
      const btn = Array.from(document.querySelectorAll('button')).find((el) => (el.textContent || '').trim().toLowerCase() === 'talep detayı');
      if (btn && btn instanceof HTMLElement) btn.click();
    });
    await page.waitForFunction(() => window.location.pathname.startsWith('/talep/'));
    const listingId = page.url().split('/talep/')[1]?.split('?')[0] || '';
    if (!listingId) throw new Error('Listing ID not found after navigation');
    console.log(`✅ Listing ID: ${listingId}`);

    const seller1Email = `seller-test-1-${timestamp}@example.com`;
    const seller2Email = `seller-test-2-${timestamp}@example.com`;
    const seller1 = await prisma.user.upsert({
      where: { email: seller1Email },
      update: {},
      create: { email: seller1Email, name: 'Test Seller 1', emailVerified: new Date() },
      select: { id: true, email: true },
    });
    const seller2 = await prisma.user.upsert({
      where: { email: seller2Email },
      update: {},
      create: { email: seller2Email, name: 'Test Seller 2', emailVerified: new Date() },
      select: { id: true, email: true },
    });

    const createOffer = async (sellerId, price, message) => {
      const res = await fetch(`${baseUrl}/api/teklif-ver`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-bypass-auth': 'true',
          'x-debug-user-id': sellerId,
        },
        body: JSON.stringify({
          listingId,
          price,
          message,
          images: [`https://placehold.co/800x600?text=Offer+${price}`],
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(`Offer create failed: ${data.error || res.status}`);
      }
      return data.offerId;
    };

    console.log('➡️ Step 16: Creating offers via API...');
    const offerIdReject = await createOffer(seller1.id, 700000, 'Teklifim hazır. Detayları görüşebiliriz. Test reddi için gönderildi.');
    const offerIdAccept = await createOffer(seller2.id, 710000, 'Uygun fiyatla hızlı teslimat sağlayabilirim. Test kabul için gönderildi.');
    console.log(`✅ Offers created: reject=${offerIdReject}, accept=${offerIdAccept}`);

    console.log('➡️ Step 17: Rejecting first offer...');
    await page.goto(`${baseUrl}/profil?tab=aldigim-teklifler`);
    await sleep(3000);
    const rejectResult = await page.evaluate(async (offerId) => {
      const res = await fetch('/api/offers', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ offerId, action: 'reject', rejectionReason: 'Test reddi' }),
      });
      return { ok: res.ok, status: res.status, body: await res.json().catch(() => ({})) };
    }, offerIdReject);
    if (!rejectResult.ok) {
      throw new Error(`Reject failed: ${rejectResult.status} ${JSON.stringify(rejectResult.body)}`);
    }
    console.log('✅ Offer rejected');

    console.log('➡️ Step 18: Accepting second offer...');
    const acceptResult = await page.evaluate(async (offerId) => {
      const res = await fetch('/api/offers', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ offerId, action: 'accept' }),
      });
      return { ok: res.ok, status: res.status, body: await res.json().catch(() => ({})) };
    }, offerIdAccept);
    if (!acceptResult.ok) {
      throw new Error(`Accept failed: ${acceptResult.status} ${JSON.stringify(acceptResult.body)}`);
    }
    console.log('✅ Offer accepted');

    await page.screenshot({ path: 'final-test-result.png', fullPage: true });
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    try {
      if (page && !page.isClosed()) {
        await page.screenshot({ path: 'error-screenshot.png', fullPage: true });
      }
    } catch {}
  } finally {
    await prisma.$disconnect();
    await browser.close();
    console.log('🏁 Test completed!');
  }
}

// Run the test
testMembershipAndCarListing();
