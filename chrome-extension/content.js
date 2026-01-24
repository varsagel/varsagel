// YENİ SİSTEM: SIRALI TIKLAMA VE VERİ ÇEKME
let isRunning = false;
let currentPath = [];
let allData = [];

// Yardımcı fonksiyonlar
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function downloadExcel() {
    if (allData.length === 0) {
        console.log("❎ İndirilecek veri yok");
        return;
    }
    
    let csv = "Marka;Model;Motor_Seri;Donanim_Seri;Path;URL\n";
    
    allData.forEach(row => {
        csv += `"${row.Marka || ''}";"${row.Model || ''}";"${row.Motor_Seri || ''}";"${row.Donanim_Seri || ''}";"${row.Path || ''}";"${row.URL || ''}"\n`;
    });
    
    const blob = new Blob(["\uFEFF" + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sahibinden_verileri.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    console.log(`💾 Excel dosyası indirildi: ${allData.length} kayıt`);
}

function stopBot() {
    isRunning = false;
    chrome.storage.local.set({ isRunning: false });
    console.log("🛑 Bot durduruldu");
    
    // Excel dosyasını indir
    downloadExcel();
}

// Sayfa yüklendiğinde çalış
window.addEventListener('load', async () => {
    await sleep(2000);
    
    // Storage'dan durumu kontrol et
    chrome.storage.local.get(['isRunning', 'currentPath', 'allData'], (data) => {
        isRunning = data.isRunning || false;
        currentPath = data.currentPath || [];
        allData = data.allData || [];
        
        if (isRunning) {
            console.log("🚀 Bot çalışıyor, sıradaki adım...");
            processCurrentPage();
        }
    });
});

// Storage değişikliklerini dinle
chrome.storage.onChanged.addListener((changes, namespace) => {
    if (namespace === 'local' && changes.isRunning) {
        isRunning = changes.isRunning.newValue;
        if (isRunning) {
            console.log("🚀 Bot başlatıldı!");
            startFromMainPage();
        }
    }
});

// Mesaj dinleyicisi (yedek)
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "start") {
        isRunning = true;
        chrome.storage.local.set({ isRunning: true, currentPath: [], allData: [] });
        startFromMainPage();
    }
    sendResponse({status: "ok"});
});

// Ana sayfadan başla
async function startFromMainPage() {
    console.log("🏁 Ana sayfadan başlıyor...");
    
    // Doğru URL kontrolü
    const currentUrl = window.location.href;
    console.log(`📍 Mevcut URL: ${currentUrl}`);
    
    // Eğer zaten otomobil ana sayfasındaysak
    if (currentUrl === 'https://www.sahibinden.com/otomobil' || currentUrl === 'https://www.sahibinden.com/otomobil/') {
        console.log("✅ Doğru otomobil ana sayfasındayız");
        await sleep(3000); // Sayfanın tam yüklenmesini bekle
        processCurrentPage();
    } else {
        console.log("📍 Otomobil ana sayfasına yönlendiriliyor...");
        window.location.href = 'https://www.sahibinden.com/otomobil';
    }
}

// Mevcut sayfayı işle
async function processCurrentPage() {
    console.log("📋 Mevcut sayfa işleniyor:", window.location.href);
    
    // Yanlış URL kontrolü - doğru otomobil sayfasına yönlendir
    if (window.location.href.includes('alt-kategori/otomobil')) {
        console.log("⚠️ Yanlış URL tespit edildi, doğru otomobil sayfasına yönlendiriliyor...");
        window.location.href = 'https://www.sahibinden.com/otomobil';
        return;
    }
    
    // Sayfanın tam yüklenmesini bekle
    await sleep(3000);
    
    // Sayfa seviyesini belirle
    const pageLevel = determinePageLevel();
    console.log("📊 Sayfa seviyesi:", pageLevel);
    
    // Güvenlik kontrol sayfası kontrolü
    if (pageLevel === -1) {
        console.log("⚠️ Güvenlik kontrol sayfası tespit edildi, sayfa yenileniyor...");
        await sleep(5000);
        window.location.reload();
        return;
    }
    
    const handlers = {
        1: processBrands,
        2: processModels,
        3: globalThis.processEngines,
        4: globalThis.processOptions
    };
    const handler = handlers[pageLevel];
    if (handler) {
        await handler();
    } else {
        console.log("❌ Sayfa seviyesi belirlenemedi");
        stopBot();
    }
}

// Sayfa seviyesini belirle
function determinePageLevel() {
    const url = window.location.href;
    const title = document.title;
    
    // Güvenlik kontrol sayfası kontrolü
    if (title.includes('Just a moment') || document.body.innerText.includes('Verifying you are human')) {
        return -1; // Güvenlik kontrolü
    }
    
    if (url === 'https://www.sahibinden.com/otomobil' || url === 'https://www.sahibinden.com/otomobil/') {
        return 1; // Marka seviyesi - ana sayfa
    } else if (currentPath.length === 1) {
        return 2; // Model seviyesi
    } else if (currentPath.length === 2) {
        return 3; // Motor seviyesi
    } else if (currentPath.length === 3) {
        return 4; // Donanım seviyesi
    } else {
        return 0; // Bilinmeyen seviye
    }
}

// 1. SEVİYE: MARKALARI ÇEK VE TIKLA
async function processBrands() {
    console.log("🏷️ Markalar işleniyor...");
    
    // Sayfanın tam yüklenmesini bekle
    await sleep(3000);
    
    // Dinamik içerik için 3 kez dene
    let brands = [];
    let attempts = 0;
    const maxAttempts = 3;
    
    while (brands.length === 0 && attempts < maxAttempts) {
        attempts++;
        console.log(`🔄 Marka araması - Deneme ${attempts}/${maxAttempts}`);
        brands = await findBrands();
        
        if (brands.length === 0 && attempts < maxAttempts) {
            console.log(`⏳ 2 saniye bekleniyor...`);
            await sleep(2000);
        }
    }
    
    if (brands.length === 0) {
        console.log("❌ Tüm denemelerde marka bulunamadı");
        stopBot();
        return;
    }
    
    return await processFoundBrands(brands);
}

async function findBrands() {
    console.log("� Marka aranıyor...");
    
    const brands = [];
    
    // Bilinen markalar listesi
    const knownBrands = [
  'Abarth', 'Aion', 'Alfa Romeo', 'Alpine', 'Anadol', 'Arora', 'Aston Martin', 'Audi', 'Bentley', 'BMW', 'Buick', 'BYD', 'Cadillac', 'Cenntro', 'Chery', 'Chevrolet', 'Chrysler', 'Cupra', 'Dacia', 'Daewoo', 'Daihatsu', 'Dodge', 'DS Automobiles', 'Eagle', 'Ferrari', 'Fiat', 'Ford', 'Geely', 'Honda', 'Hyundai', 'I-GO', 'Ikco', 'Infiniti', 'Jaguar', 'Joyce', 'Kia', 'Kuba', 'Lada', 'Lamborghini', 'Lancia', 'Leapmotor', 'Lexus', 'Lincoln', 'Lotus', 'Luqi', 'Marcos', 'Maserati', 'Mazda', 'McLaren', 'Mercedes-Benz', 'Mercury', 'MG', 'Micro', 'Mini', 'Mitsubishi', 'Morgan', 'Nieve', 'Niğmer', 'Nissan', 'Opel', 'Orti', 'Peugeot', 'Plymouth', 'Polestar', 'Pontiac', 'Porsche', 'Proton', 'Rainwoll', 'Reeder', 'Regal Raptor', 'Relive', 'Renault', 'RKS', 'Roewe', 'Rolls-Royce', 'Rover', 'Saab', 'Seat', 'Skoda', 'Smart', 'Subaru', 'Suzuki', 'Tata', 'Tesla', 'The London Taxi', 'Tofaş', 'TOGG', 'Toyota', 'Vanderhall', 'Volkswagen', 'Volta', 'Volvo', 'XEV', 'Yuki'
];
    
    // Tüm linkleri kontrol et - daha basit ve etkili yöntem
    const allLinks = document.querySelectorAll('a[href*="/otomobil/"]');
    console.log(`📊 Toplam ${allLinks.length} adet otomobil linki bulundu`);
    
    // Sayfa yapısını analiz et
    console.log("📄 Sayfa yapısı analizi:");
    console.log(`📍 Mevcut URL: ${window.location.href}`);
    console.log(`📍 Sayfa başlığı: ${document.title}`);
    
    // Tüm H2 etiketlerini kontrol et
    const allH2 = document.querySelectorAll('h2');
    console.log(`📊 Toplam ${allH2.length} adet H2 etiketi bulundu`);
    allH2.forEach((h2, index) => {
        console.log(`📝 H2 ${index + 1}: "${h2.innerText.trim()}"`);
        // H2'nin içinde link var mı?
        const h2Link = h2.querySelector('a[href*="/otomobil/"]');
        if (h2Link) {
            console.log(`   ↳ İçinde link var: ${h2Link.href}`);
        }
    });
    
    // Tüm linkleri genel kontrol
    const allPageLinks = document.querySelectorAll('a[href]');
    console.log(`📊 Sayfada toplam ${allPageLinks.length} adet link bulundu`);
    const otomobilLinks = Array.from(allPageLinks).filter(link => link.href.includes('/otomobil/'));
    console.log(`📊 Bunlardan ${otomobilLinks.length} tanesi otomobil linki`);
    
    // DEBUG: Tüm link detaylarını göster
    allLinks.forEach((link, index) => {
        const text = link.innerText.trim();
        const href = link.href;
        console.log(`🔗 Link ${index + 1}: Metin="${text}" | URL="${href}"`);
        
        // Link metni boş değilse ve bilinen marka içeriyorsa
        if (text && text.length > 0 && text.length < 50) {
            const foundBrand = knownBrands.find(brand => {
                const brandLower = brand.toLowerCase();
                const textLower = text.toLowerCase();
                const hrefLower = href.toLowerCase();
                
                // Daha esnek eşleştirme yöntemleri
                const textMatch = textLower === brandLower || 
                                 textLower.includes(brandLower) || 
                                 brandLower.includes(textLower);
                
                // URL'de marka adı veya varyasyonları
                const urlPatterns = [
                    '/' + brandLower.replace(/\s+/g, '-') + '/',
                    '/' + brandLower.replace(/\s+/g, '_') + '/',
                    '/' + brandLower.replace(/\s+/g, '') + '/',
                    brandLower.replace(/\s+/g, '-').toLowerCase(),
                    brandLower.replace(/\s+/g, '_').toLowerCase()
                ];
                
                const urlMatch = urlPatterns.some(pattern => hrefLower.includes(pattern));
                
                if (textMatch || urlMatch) {
                    console.log(`🎯 EŞLEŞME: ${brand} -> Metin: ${textMatch} | URL: ${urlMatch}`);
                    console.log(`   Metin karşılaştırma: "${textLower}" vs "${brandLower}"`);
                    console.log(`   URL pattern kontrolü: ${urlPatterns.join(', ')}`);
                }
                return textMatch || urlMatch;
            });
            
            if (foundBrand) {
                // Aynı markayı tekrar ekleme
                if (!brands.some(brand => brand.url === href)) {
                    brands.push({ name: foundBrand, url: href });
                    console.log(`✅ Marka bulundu: ${foundBrand} -> ${href}`);
                }
            } else {
                console.log(`❌ Eşleşme bulunamadı: Metin="${text}" | URL="${href}"`);
                // Alternatif eşleştirme denemeleri için log
                knownBrands.slice(0, 5).forEach(brand => {
                    const brandLower = brand.toLowerCase();
                    if (text.toLowerCase().includes(brandLower) || href.toLowerCase().includes(brandLower)) {
                        console.log(`   Yakın eşleşme olabilir: ${brand}`);
                    }
                });
            }
        } else {
            console.log(`⚠️ Link atlandı: Metin="${text}" (uzunluk: ${text.length})`);
        }
    });
    
    // H2 etiketlerini de kontrol et (yedek yöntem)
    if (brands.length === 0) {
        console.log("🔍 H2 etiketlerinden marka aranıyor...");
        
        const h2Elements = document.querySelectorAll('h2');
        h2Elements.forEach(h2 => {
            const text = h2.innerText.trim();
            
            // H2 metni bilinen marka mı?
            const foundBrand = knownBrands.find(brand => text.toLowerCase() === brand.toLowerCase());
            
            if (foundBrand) {
                // H2'nin parent'ında link ara
                const parent = h2.closest('a[href*="/otomobil/"]') || h2.parentElement?.closest('a[href*="/otomobil/"]');
                
                if (parent && parent.href) {
                    brands.push({ name: foundBrand, url: parent.href });
                    console.log(`✅ H2'den marka bulundu: ${foundBrand} -> ${parent.href}`);
                }
            }
        });
    }
    
    // Fallback: Eğer hiç marka bulunamadıysa URL'den marka adı çıkarmayı dene
    if (brands.length === 0 && allLinks.length > 0) {
        console.log("🔍 Fallback: URL'den marka adı çıkarılıyor...");
        
        allLinks.forEach(link => {
            const href = link.href;
            
            // URL'den marka adını çıkar
            // https://www.sahibinden.com/otomobil/bmw -> bmw
            const match = href.match(/\/otomobil\/([^\/]+)/);
            if (match && match[1]) {
                const extractedBrand = match[1].replace(/-/g, ' ').replace(/_/g, ' ').toLowerCase();
                
                // Büyük harfle başlat
                const formattedBrand = extractedBrand.split(' ').map(word => 
                    word.charAt(0).toUpperCase() + word.slice(1)
                ).join(' ');
                
                console.log(`🎯 URL'den marka çıkarıldı: ${formattedBrand} -> ${href}`);
                
                if (!brands.some(brand => brand.url === href)) {
                    brands.push({ name: formattedBrand, url: href });
                }
            }
        });
    }
    
    console.log(`📊 Toplam ${brands.length} marka bulundu`);
    return brands;
}

async function processFoundBrands(brands) {
    console.log(`📊 Toplam ${brands.length} marka bulundu`);
    
    // İlk markaya tıkla
    const firstBrand = brands[0];
    currentPath = [firstBrand.name];
    allData.push({
        Marka: firstBrand.name,
        Model: "",
        Motor_Seri: "",
        Donanim_Seri: "",
        Path: currentPath.join(" > "),
        URL: firstBrand.url
    });
    
    // Verileri kaydet
    await saveData();
    
    console.log(`🎯 İlk markaya tıklanıyor: ${firstBrand.name}`);
    window.location.href = firstBrand.url;
}

// 2. SEVİYE: MODELLERİ ÇEK VE TIKLA
async function processModels() {
    const currentBrand = currentPath[0];
    console.log(`🚗 ${currentBrand} modelleri işleniyor...`);
    
    // Önce "Tüm ... Kategorileri" linkini bul
    const allCategoriesLink = findAllCategoriesLink(currentBrand);
    if (allCategoriesLink) {
        console.log(`🎯 Tüm ${currentBrand} kategorilerine tıklanıyor`);
        window.location.href = allCategoriesLink;
        return;
    }
    
    // YENİ YÖNTEM: H2 etiketlerinden model bulma
    console.log("🔍 H2 etiketlerinden modeller aranıyor...");
    
    const h2Elements = document.querySelectorAll('h2');
    console.log(`📊 Toplam ${h2Elements.length} adet H2 etiketi bulundu`);
    
    const models = [];
    
    h2Elements.forEach((h2, index) => {
        const text = h2.innerText.trim();
        console.log(`${index + 1}. H2 Model: "${text}"`);
        
        // Eğer H2 içinde link varsa, onun href'ini al
        const link = h2.querySelector('a');
        const href = link ? link.href : null;
        
        if (text && text.length > 0 && text.length < 50 && href && href.includes('/otomobil/')) {
            models.push({ name: text, url: href });
            console.log(`✅ H2'de model bulundu: ${text} -> ${href}`);
        }
    });
    
    // Eğer H2'de bulunamadıysa, alternatif yöntemler
    if (models.length === 0) {
        console.log("❌ H2'de model bulunamadı, alternatif yöntemler deneniyor...");
        
        // Alternatif 1: H2'nin parent'ındaki linkler
        h2Elements.forEach(h2 => {
            const parent = h2.parentElement;
            if (parent) {
                const link = parent.querySelector('a');
                if (link) {
                    const text = h2.innerText.trim();
                    const href = link.href;
                    if (text && href && href.includes('/otomobil/')) {
                        models.push({ name: text, url: href });
                        console.log(`✅ H2 parent'ında model bulundu: ${text}`);
                    }
                }
            }
        });
    }
    
    // Hala bulunamadıysa, genel arama
    if (models.length === 0) {
        console.log("🔍 Genel model araması yapılıyor...");
        
        const links = document.querySelectorAll('a');
    
    links.forEach(link => {
        const text = link.innerText.trim();
        const href = link.href;
        
        if (text && 
            text.length > 0 && 
            text.length < 50 && 
            !text.includes('Kategori') && 
            !text.includes('Fiyat') &&
            !text.includes('Yıl') && 
            !text.includes('KM') && 
            !text.includes('Renk') &&
            !text.includes('Tüm') &&
            !text.includes('Kategorileri') &&
            href && 
            (href.includes('/otomobil/') || href.includes('/kategori/otomobil/')) &&
            !href.includes('alt-kategori')) {
            
            models.push({ name: text, url: href });
            console.log(`✅ Model bulundu: ${text}`);
        }
    });
    
    if (models.length === 0) {
        console.log(`❌ ${currentBrand} için model bulunamadı`);
        await goBackAndTryNext();
        return;
    }
    
    console.log(`📊 ${currentBrand} için ${models.length} model bulundu`);
    
    // İlk modeli seç
    const firstModel = models[0];
    currentPath = [currentBrand, firstModel.name];
    
    // Veriyi güncelle
    updateLastData({
        Model: firstModel.name,
        Path: currentPath.join(" > ")
    });
    
    await saveData();
    
    console.log(`🎯 İlk modele tıklanıyor: ${firstModel.name}`);
    window.location.href = firstModel.url;
}

// 3. SEVİYE: MOTOR/SERİ ÇEK VE TIKLA
globalThis.processEngines = async () => {
    const currentBrand = currentPath[0];
    const currentModel = currentPath[1];
    console.log(`⚙️ ${currentBrand} > ${currentModel} motorları işleniyor...`);
    
    // Önce "Tüm ... Kategorileri" linkini bul
    const allCategoriesLink = findAllCategoriesLink(currentModel);
    if (allCategoriesLink) {
        console.log(`🎯 Tüm ${currentModel} kategorilerine tıklanıyor`);
        window.location.href = allCategoriesLink;
        return;
    }
    
    // YENİ YÖNTEM: H2 etiketlerinden motor bulma
    console.log("🔍 H2 etiketlerinden motorlar aranıyor...");
    
    const h2Elements = document.querySelectorAll('h2');
    console.log(`📊 Toplam ${h2Elements.length} adet H2 etiketi bulundu`);
    
    const engines = [];
    
    h2Elements.forEach((h2, index) => {
        const text = h2.innerText.trim();
        console.log(`${index + 1}. H2 Motor: "${text}"`);
        
        // Eğer H2 içinde link varsa, onun href'ini al
        const link = h2.querySelector('a');
        const href = link ? link.href : null;
        
        if (text && text.length > 0 && text.length < 50 && href && href.includes('/otomobil/')) {
            engines.push({ name: text, url: href });
            console.log(`✅ H2'de motor bulundu: ${text} -> ${href}`);
        }
    });
    
    // Eğer H2'de bulunamadıysa, alternatif yöntemler
    if (engines.length === 0) {
        console.log("❌ H2'de motor bulunamadı, alternatif yöntemler deneniyor...");
        
        // Alternatif 1: H2'nin parent'ındaki linkler
        h2Elements.forEach(h2 => {
            const parent = h2.parentElement;
            if (parent) {
                const link = parent.querySelector('a');
                if (link) {
                    const text = h2.innerText.trim();
                    const href = link.href;
                    if (text && href && href.includes('/otomobil/')) {
                        engines.push({ name: text, url: href });
                        console.log(`✅ H2 parent'ında motor bulundu: ${text}`);
                    }
                }
            }
        });
    }
    
    // Hala bulunamadıysa, genel arama
    if (engines.length === 0) {
        console.log("🔍 Genel motor araması yapılıyor...");
        
        const links = document.querySelectorAll('a');
    
    links.forEach(link => {
        const text = link.innerText.trim();
        const href = link.href;
        
        if (text && 
            text.length > 0 && 
            text.length < 30 && 
            !text.includes('Kategori') && 
            !text.includes('Fiyat') &&
            !text.includes('Yıl') && 
            !text.includes('KM') && 
            !text.includes('Renk') &&
            !text.includes('Tüm') &&
            !text.includes('Kategorileri') &&
            href && 
            (href.includes('/otomobil/') || href.includes('/kategori/otomobil/')) &&
            !href.includes('alt-kategori')) {
            
            engines.push({ name: text, url: href });
            console.log(`✅ Motor bulundu: ${text}`);
        }
    });
    
    if (engines.length === 0) {
        console.log(`❌ ${currentModel} için motor bulunamadı`);
        await goBackAndTryNext();
        return;
    }
    
    console.log(`📊 ${currentModel} için ${engines.length} motor bulundu`);
    
    // İlk motoru seç
    const firstEngine = engines[0];
    currentPath = [currentBrand, currentModel, firstEngine.name];
    
    // Veriyi güncelle
    updateLastData({
        Motor_Seri: firstEngine.name,
        Path: currentPath.join(" > ")
    });
    
    await saveData();
    
    console.log(`🎯 İlk motora tıklanıyor: ${firstEngine.name}`);
    window.location.href = firstEngine.url;
};

// 4. SEVİYE: DONANIM/SERİ ÇEK VE KAYDET
globalThis.processOptions = async () => {
    const currentBrand = currentPath[0];
    const currentModel = currentPath[1];
    const currentEngine = currentPath[2];
    console.log(`🔧 ${currentBrand} > ${currentModel} > ${currentEngine} donanımları işleniyor...`);
    
    // Önce "Tüm ... Kategorileri" linkini bul
    const allCategoriesLink = findAllCategoriesLink(currentEngine);
    if (allCategoriesLink) {
        console.log(`🎯 Tüm ${currentEngine} kategorilerine tıklanıyor`);
        window.location.href = allCategoriesLink;
        return;
    }
    
    // YENİ YÖNTEM: H2 etiketlerinden donanım bulma
    console.log("🔍 H2 etiketlerinden donanımlar aranıyor...");
    
    const h2Elements = document.querySelectorAll('h2');
    console.log(`📊 Toplam ${h2Elements.length} adet H2 etiketi bulundu`);
    
    const options = [];
    
    h2Elements.forEach((h2, index) => {
        const text = h2.innerText.trim();
        console.log(`${index + 1}. H2 Donanım: "${text}"`);
        
        // Eğer H2 içinde link varsa, onun href'ini al
        const link = h2.querySelector('a');
        const href = link ? link.href : null;
        
        if (text && text.length > 0 && text.length < 50 && href && href.includes('/otomobil/')) {
            options.push({ name: text, url: href });
            console.log(`✅ H2'de donanım bulundu: ${text} -> ${href}`);
        }
    });
    
    // Eğer H2'de bulunamadıysa, alternatif yöntemler
    if (options.length === 0) {
        console.log("❌ H2'de donanım bulunamadı, alternatif yöntemler deneniyor...");
        
        // Alternatif 1: H2'nin parent'ındaki linkler
        h2Elements.forEach(h2 => {
            const parent = h2.parentElement;
            if (parent) {
                const link = parent.querySelector('a');
                if (link) {
                    const text = h2.innerText.trim();
                    const href = link.href;
                    if (text && href && href.includes('/otomobil/')) {
                        options.push({ name: text, url: href });
                        console.log(`✅ H2 parent'ında donanım bulundu: ${text}`);
                    }
                }
            }
        });
    }
    
    // Hala bulunamadıysa, genel arama
    if (options.length === 0) {
        console.log("🔍 Genel donanım araması yapılıyor...");
        
        const links = document.querySelectorAll('a');
    
    links.forEach(link => {
        const text = link.innerText.trim();
        const href = link.href;
        
        if (text && 
            text.length > 0 && 
            text.length < 30 && 
            !text.includes('Kategori') && 
            !text.includes('Fiyat') &&
            !text.includes('Yıl') && 
            !text.includes('KM') && 
            !text.includes('Renk') &&
            !text.includes('Tüm') &&
            !text.includes('Kategorileri') &&
            href && 
            (href.includes('/otomobil/') || href.includes('/kategori/otomobil/')) &&
            !href.includes('alt-kategori')) {
            
            options.push({ name: text, url: href });
            console.log(`✅ Donanım bulundu: ${text}`);
        }
    });
    
    if (options.length === 0) {
        console.log(`❌ ${currentEngine} için donanım bulunamadı`);
        // Yine de kaydet
        updateLastData({
            Donanim_Seri: "Belirtilmemiş",
            Path: currentPath.join(" > ")
        });
        await saveData();
    } else {
        console.log(`📊 ${currentEngine} için ${options.length} donanım bulundu`);
        
        // Tüm donanımları kaydet
        for (let option of options) {
            const newPath = [...currentPath, option.name];
            allData.push({
                Marka: currentBrand,
                Model: currentModel,
                Motor_Seri: currentEngine,
                Donanim_Seri: option.name,
                Path: newPath.join(" > "),
                URL: option.url
            });
            console.log(`💾 Kaydedildi: ${option.name}`);
        }
        
        await saveData();
    }
    
    // Bir üst seviyeye dön ve bir sonrakini dene
    await goBackAndTryNext();
};

function findAllCategoriesLink(searchTerm) {
    const links = document.querySelectorAll('a');
    for (let link of links) {
        const text = link.innerText.trim();
        if (text.includes(`Tüm ${searchTerm} Kategorileri`)) {
            return link.href;
        }
    }
    return null;
}

async function saveData() {
    await chrome.storage.local.set({ 
        currentPath: currentPath,
        allData: allData
    });
}

function updateLastData(updates) {
    if (allData.length > 0) {
        const lastIndex = allData.length - 1;
        allData[lastIndex] = { ...allData[lastIndex], ...updates };
    }
}

async function goBackAndTryNext() {
    console.log("⬅️ Bir üst seviyeye dönülüyor...");
    
    if (currentPath.length > 1) {
        currentPath.pop(); // Son elemanı çıkar
        await saveData();
        
        // Tarayıcıda geri dön
        window.history.back();
        
        // 5 saniye bekle ve sayfayı yeniden işle
        setTimeout(() => {
            processCurrentPage();
        }, 5000);
    } else {
        console.log("✅ Tüm markalar işlendi!");
        stopBot();
    }
}
}
}
}
