
// =============================================================================
// BU KODU TARAYICI KONSOLUNA (F12 -> Console) YAPIŞTIRIN
// =============================================================================

(function() {
    console.clear();
    console.log("🚗 Veri Toplayıcı Başlatılıyor...");

    // 1. Sol menüdeki kategorileri/modelleri bulmaya çalış
    // Sahibinden.com genellikle sol menüde .cl-filter-list veya benzeri yapılar kullanır
    const potentialSelectors = [
        '.cl-filter-list li a',      // Genellikle filtre listesi
        '.category-list li a',       // Kategori listesi
        '.search-filter ul li a'     // Arama filtreleri
    ];

    let items = [];
    let selectedSelector = "";

    for (const selector of potentialSelectors) {
        const elements = document.querySelectorAll(selector);
        if (elements.length > 0) {
            selectedSelector = selector;
            elements.forEach(el => {
                const text = el.innerText || el.textContent;
                // Parantez içindeki sayıları ve gereksiz boşlukları temizle
                const cleanText = text.replace(/\(\d+\)/g, '').trim(); 
                if (cleanText) {
                    items.push(cleanText);
                }
            });
            break; // İlk eşleşen selektörü kullan
        }
    }

    if (items.length === 0) {
        console.error("❌ Kategori veya model listesi bulunamadı!");
        console.log("Lütfen bir marka sayfasına (örn: Audi) girdiğinizden emin olun.");
        return;
    }

    // 2. Veriyi JSON formatına çevir
    const outputData = {
        url: window.location.href,
        extractedItems: items,
        timestamp: new Date().toISOString()
    };

    // 3. Veriyi Panoya Kopyala
    const jsonString = JSON.stringify(outputData, null, 2);
    
    // Panoya kopyalama işlemi
    navigator.clipboard.writeText(jsonString).then(() => {
        console.log(`✅ ${items.length} adet veri başarıyla çekildi ve PANONA KOPYALANDI!`);
        console.log("📋 Şimdi VS Code'da 'extra-brands.ts' veya yeni bir JSON dosyasına yapıştırabilirsin.");
        console.log("\nÇekilen Veriler (Örnek):", items.slice(0, 5));
    }).catch(err => {
        console.error("Panoya kopyalama başarısız oldu:", err);
        console.log("Veri şudur:\n", jsonString);
    });

})();
