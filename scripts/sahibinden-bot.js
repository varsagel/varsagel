
const puppeteer = require('puppeteer');
const XLSX = require('xlsx');

// AYARLAR
const START_URL = 'https://www.sahibinden.com/alt-kategori/otomobil';
const MAX_DEPTH = 3; 
const WAIT_TIME = 3000; 

// Durum Takibi
let visitedUrls = new Set();
let collectedData = [];

(async () => {
    console.log('🤖 Gelişmiş Varsagel Bot Başlatılıyor...');
    
    let browser;
    try {
        browser = await puppeteer.connect({
            browserURL: 'http://127.0.0.1:9222',
            defaultViewport: null
        });
        console.log('✅ Chrome bağlantısı başarılı!');
    } catch (e) {
        console.error('❌ Chrome bağlantısı başarısız! Debug port açık mı?');
        process.exit(1);
    }

    const pages = await browser.pages();
    let page = pages.find(p => p.url().includes('sahibinden.com')) || pages[0];
    
    console.log(`📄 Çalışılan Sayfa: ${page.url()}`);
    
    // Eğer doğru sayfada değilse git
    if (!page.url().includes('otomobil')) {
        console.log('➡️ Otomobil sayfasına gidiliyor...');
        await page.goto(START_URL, { waitUntil: 'domcontentloaded' });
    }

    try {
        await crawl(page, [], 0);
    } catch (e) {
        console.error('❌ Genel Hata:', e);
    } finally {
        saveToExcel();
        console.log('✅ İşlem Bitti.');
    }
})();

async function crawl(page, path, depth) {
    console.log(`\n🔍 TARAMA BAŞLADI: ${path.join(' > ')} (Derinlik: ${depth})`);

    // Sayfanın tamamen yüklenmesini bekle
    await new Promise(r => setTimeout(r, 2000));

    // Başlık Kontrolü (Cloudflare vs)
    const pageTitle = await page.title();
    console.log(`   📄 Sayfa Başlığı: ${pageTitle}`);
    if (pageTitle.includes('Just a moment') || pageTitle.includes('Security')) {
        console.log('   ⚠️ CLOUDFLARE KORUMASI TESPİT EDİLDİ!');
        console.log('   Lütfen tarayıcıda doğrulamayı yapın ve scripti tekrar çalıştırın.');
        return;
    }

    // LİSTEYİ BULMAK İÇİN DAHA GENİŞ ARAMA
    // Sayfadaki tüm potansiyel listeleri dene
    const items = await page.evaluate(() => {
        // Yardımcı: Metin temizleme
        const clean = (t) => t.replace(/\(\d+\)/g, '').replace(/\d+ ilan/, '').replace('Tümü', '').trim();
        
        let foundItems = [];
        
        // 1. Strateji: Kategori Listesi (Ana Sayfa Yapısı) - categoryList (CamelCase)
        const categoryListLinks = document.querySelectorAll('ul.categoryList li a');
        if (categoryListLinks.length > 0) {
            console.log("   -> ul.categoryList bulundu");
            categoryListLinks.forEach(el => foundItems.push({ text: clean(el.innerText), href: el.href }));
        }

        // 2. Strateji: Sol Menü Filtreleri (.cl-filter-list)
        if (foundItems.length === 0) {
            const filterLinks = document.querySelectorAll('.cl-filter-list li a');
            if (filterLinks.length > 0) {
                console.log("   -> .cl-filter-list bulundu");
                filterLinks.forEach(el => foundItems.push({ text: clean(el.innerText), href: el.href }));
            }
        }

        // 3. Strateji: Kategori Listesi (.category-list) - Tireli
        if (foundItems.length === 0) {
            const catLinks = document.querySelectorAll('.category-list li a');
            if (catLinks.length > 0) {
                console.log("   -> .category-list bulundu");
                catLinks.forEach(el => foundItems.push({ text: clean(el.innerText), href: el.href }));
            }
        }

        // 4. Strateji: Arama Filtreleri (.search-filter)
        if (foundItems.length === 0) {
            const searchLinks = document.querySelectorAll('.search-filter ul li a');
            if (searchLinks.length > 0) {
                console.log("   -> .search-filter bulundu");
                searchLinks.forEach(el => foundItems.push({ text: clean(el.innerText), href: el.href }));
            }
        }
        
        // 5. Strateji: Sol Kolon Geneli (Son çare)
        if (foundItems.length === 0) {
            const leftCol = document.querySelector('.search-left-layout');
            if (leftCol) {
                const links = leftCol.querySelectorAll('li a');
                if (links.length > 0) {
                    console.log("   -> Sol kolon geneli bulundu");
                    links.forEach(el => foundItems.push({ text: clean(el.innerText), href: el.href }));
                }
            }
        }

        // 6. Strateji: Mobilden veya farklı yapıdan geliyorsa
        if (foundItems.length === 0) {
            const categoriesBoard = document.querySelectorAll('.categories-board li a');
             if (categoriesBoard.length > 0) {
                console.log("   -> .categories-board bulundu");
                categoriesBoard.forEach(el => foundItems.push({ text: clean(el.innerText), href: el.href }));
            }
        }

        // Gereksizleri filtrele
        return foundItems.filter(i => 
            i.text && 
            i.text.length > 1 && 
            !i.text.includes('Fiyat') && 
            !i.text.includes('Yıl') &&
            !i.text.includes('KM') &&
            !i.text.includes('Renk')
        );
    });

    console.log(`   📝 ${items.length} adet öğe bulundu.`);

    if (items.length === 0) {
        console.log('⚠️ Liste boş! Sayfa yapısı farklı olabilir veya son seviye.');
        // Sayfa içeriğini debug için konsola yazdırabiliriz ama şimdilik geçelim.
        return;
    }

    // SON SEVİYE KONTROLÜ
    if (depth >= MAX_DEPTH) {
        console.log('   🛑 Maksimum derinliğe ulaşıldı. Kaydediliyor...');
        items.forEach(item => collectedData.push([...path, item.text]));
        saveToExcel();
        return;
    }

    // DÖNGÜ: Her öğeye tıkla
    for (const item of items) {
        if (visitedUrls.has(item.href)) continue;
        visitedUrls.add(item.href);

        const newPath = [...path, item.text];
        collectedData.push(newPath); // Ara kaydet

        console.log(`   👉 Gidiliyor: ${item.text}`);
        
        try {
            // TIKLAMA / GİTME
            await page.goto(item.href, { waitUntil: 'domcontentloaded' });
            
            // RECURSION (Alt seviyeye in)
            await crawl(page, newPath, depth + 1);

            // GERİ DÖN
            console.log('   ⬅️ Geri dönülüyor...');
            await page.goBack({ waitUntil: 'domcontentloaded' });
            await new Promise(r => setTimeout(r, 1500)); // Sayfa otursun diye bekle

        } catch (err) {
            console.error(`   ❌ Hata (${item.text}):`, err.message);
        }
    }
}

function saveToExcel() {
    if (collectedData.length === 0) return;
    const ws = XLSX.utils.aoa_to_sheet([['Marka', 'Model', 'Seri', 'Paket'], ...collectedData]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Veriler");
    XLSX.writeFile(wb, 'sahibinden_verileri.xlsx');
    console.log(`💾 Kayıt Edildi (${collectedData.length} satır)`);
}
