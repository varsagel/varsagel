
// GÜNCELLENMİŞ SCRIPT (v3) - Alt Kategorilere İnmeme Sorunu Düzeltildi
// KULLANIM:
// 1. https://www.sahibinden.com/alt-kategori/otomobil sayfasına git.
// 2. F12 -> Console sekmesine yapıştır ve Enter'a bas.

(async () => {
    // --- AYARLAR ---
    const WAIT_TIME = 3500; // Sayfa yükleme bekleme süresi (artırıldı)
    
    // --- DURUM ---
    let collectedData = [];
    let isRunning = true;
    let popup = null;

    // --- UI ---
    const ui = document.createElement('div');
    Object.assign(ui.style, {
        position: 'fixed', top: '10px', right: '10px', width: '350px',
        backgroundColor: 'rgba(0,0,0,0.95)', color: '#0f0', padding: '15px',
        zIndex: 999999, borderRadius: '8px', fontFamily: 'Consolas, monospace',
        fontSize: '12px', boxShadow: '0 5px 25px rgba(0,0,0,0.8)', border: '1px solid #333'
    });
    
    ui.innerHTML = `
        <h3 style="margin:0 0 10px 0;border-bottom:1px solid #444;color:#fff;padding-bottom:5px">Varsagel Bot v3.1</h3>
        <div style="margin-bottom:8px;font-size:13px">Durum: <span id="bot-status" style="color:#fff">Hazır</span></div>
        <div style="margin-bottom:8px">İşlenen: <span id="bot-current" style="color:#f1c40f">-</span></div>
        <div style="margin-bottom:8px">Toplanan Veri: <span id="bot-count" style="font-weight:bold;color:#2ecc71;font-size:14px">0</span></div>
        <div id="bot-log" style="height:150px;overflow-y:auto;background:#111;border:1px solid #333;margin-bottom:10px;padding:8px;color:#ccc;font-size:11px;white-space:pre-wrap"></div>
        <div style="display:flex;gap:5px">
            <button id="bot-stop" style="flex:1;background:#e74c3c;color:white;border:none;padding:10px;cursor:pointer;font-weight:bold;border-radius:4px">DURDUR</button>
            <button id="bot-export" style="flex:1;background:#27ae60;color:white;border:none;padding:10px;cursor:pointer;font-weight:bold;border-radius:4px">EXCEL İNDİR</button>
        </div>
    `;
    document.body.appendChild(ui);

    function log(msg, type = "info") {
        const div = document.getElementById('bot-log');
        const color = type === "error" ? "#e74c3c" : type === "success" ? "#2ecc71" : type === "warn" ? "#f39c12" : "#ccc";
        div.innerHTML += `<div style="color:${color};margin-bottom:2px">${msg}</div>`;
        div.scrollTop = div.scrollHeight;
        console.log(`[BOT] ${msg}`);
        if(type === "info") document.getElementById('bot-status').innerText = "Çalışıyor...";
    }

    document.getElementById('bot-stop').onclick = () => { isRunning = false; log("Kullanıcı durdurdu!", "error"); document.getElementById('bot-status').innerText = "Durduruldu"; };
    document.getElementById('bot-export').onclick = () => exportToExcel();

    function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

    // --- KRİTİK FONKSİYON: LİNKLERİ BULMA ---
    function extractLinks(doc, contextName) {
        // Sahibinden sayfa yapısına göre olası liste yerleri
        const strategies = [
            { name: "Sol Menü", selector: '.cl-filter-list li a' },
            { name: "Ana Kategori Listesi", selector: 'ul.categoryList li a' },
            { name: "Kategori Kartları", selector: '.categories-board li a' },
            { name: "Arama Filtreleri", selector: '.search-filter ul li a' },
            { name: "Sol Kolon Genel", selector: '.search-left-layout li a' }
        ];
        
        for (const strat of strategies) {
            const els = Array.from(doc.querySelectorAll(strat.selector));
            if (els.length > 0) {
                // Temizlik
                const items = els.map(el => ({
                    text: el.innerText.replace(/\(\d+\)/g, '').replace(/\d+ ilan/, '').trim(),
                    url: el.href
                })).filter(i => 
                    i.text.length > 1 && 
                    !i.text.includes('Tümü') && 
                    !i.text.includes('Fiyat') &&
                    !i.text.includes('Model') && // "Model Yılı" filtresini atla
                    !i.text.includes('Kilometre')
                );
                
                if(items.length > 0) {
                    // log(`   -> [${contextName}] ${strat.name} ile ${items.length} öğe bulundu.`, "success");
                    return items;
                }
            }
        }
        log(`   -> [${contextName}] HİÇBİR LİSTE BULUNAMADI! Sayfa yapısı farklı olabilir.`, "error");
        return [];
    }

    async function waitForLoad(win, expectedUrlPart) {
        return new Promise(async resolve => {
            let checks = 0;
            const maxChecks = 20; // 10 saniye max
            
            while(checks < maxChecks) {
                try {
                    // URL değişmiş mi kontrol et
                    if (expectedUrlPart && !win.location.href.includes(expectedUrlPart)) {
                        // Henüz URL değişmemiş, bekle
                        await sleep(500);
                        checks++;
                        continue;
                    }

                    // DOM hazır mı?
                    if (win.document.readyState === 'complete') {
                        // İçerik var mı? (Liste elemanı arıyoruz)
                        const hasList = win.document.querySelector('li a');
                        if (hasList) {
                            await sleep(1000); // Ekstra güvenlik beklemesi
                            resolve(true);
                            return;
                        }
                    }
                } catch(e) {
                    // Cross-origin hatası olabilir, bekle
                }
                await sleep(500);
                checks++;
            }
            log("   -> Sayfa yüklenmesi zaman aşımına uğradı veya boş.", "warn");
            resolve(false);
        });
    }

    function saveData(row) {
        collectedData.push(row);
        document.getElementById('bot-count').innerText = collectedData.length;
    }

    function exportToExcel() {
        if(collectedData.length === 0) { alert("Veri yok!"); return; }
        let csv = "Marka;Model;Seri;Paket\n";
        collectedData.forEach(row => csv += row.map(c => `"${c}"`).join(";") + "\n");
        const blob = new Blob(["\uFEFF" + csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `sahibinden_veriler_${Date.now()}.csv`;
        document.body.appendChild(link);
        link.click();
    }

    // --- ANA AKIŞ ---
    try {
        log("Bot Başlatılıyor...", "info");
        
        popup = window.open("", "bot_popup", "width=1000,height=800");
        if (!popup) { alert("POPUP İZNİ VERİN!"); return; }

        // 1. ADIM: MARKALAR (Ana Sayfadan)
        const brands = extractLinks(document, "AnaSayfa");
        if (brands.length === 0) { log("Ana sayfada marka bulunamadı!", "error"); return; }
        
        log(`${brands.length} Marka Taranacak.`, "info");

        for (const brand of brands) {
            if (!isRunning) break;
            log(`[MARKA] ${brand.text}`, "warn");
            document.getElementById('bot-current').innerText = brand.text;

            // Marka sayfasına git
            popup.location.href = brand.url;
            await waitForLoad(popup);
            
            // Modelleri bul
            const models = extractLinks(popup.document, "ModelSayfası");
            if (models.length === 0) {
                log(`   -> Model listesi boş! (${brand.text})`, "warn");
                saveData([brand.text, "-", "-", "-"]);
                continue;
            }

            for (const model of models) {
                if(!isRunning) break;
                // log(`   > [MODEL] ${model.text}`);
                document.getElementById('bot-current').innerText = `${brand.text} > ${model.text}`;

                popup.location.href = model.url;
                await waitForLoad(popup);

                // Serileri bul
                const series = extractLinks(popup.document, "SeriSayfası");
                if (series.length === 0) {
                    saveData([brand.text, model.text, "-", "-"]);
                    continue;
                }

                for (const ser of series) {
                    if(!isRunning) break;
                    // log(`      > [SERİ] ${ser.text}`);
                    
                    popup.location.href = ser.url;
                    await waitForLoad(popup);

                    // Paketleri bul
                    const packages = extractLinks(popup.document, "PaketSayfası");
                    if (packages.length === 0) {
                        saveData([brand.text, model.text, ser.text, "-"]);
                    } else {
                        for (const pkg of packages) {
                            saveData([brand.text, model.text, ser.text, pkg.text]);
                        }
                    }
                }
            }
        }
        
        log("BİTTİ!", "success");
        exportToExcel();

    } catch (e) {
        console.error(e);
        log("HATA: " + e.message, "error");
    }
})();
