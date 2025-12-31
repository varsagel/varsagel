
// Bu scripti tarayıcı konsoluna yapıştırarak çalıştırabilirsiniz.
// Kullanımı:
// 1. https://www.sahibinden.com/alt-kategori/otomobil sayfasına gidin.
// 2. F12 ile konsolu açın.
// 3. Bu kodu yapıştırın ve Enter'a basın.

(async () => {
    // AYARLAR
    const WAIT_TIME = 2000;
    let collectedData = [];
    let isRunning = true;

    // Arayüz oluştur
    const ui = document.createElement('div');
    ui.style.position = 'fixed';
    ui.style.top = '10px';
    ui.style.right = '10px';
    ui.style.backgroundColor = 'rgba(0,0,0,0.8)';
    ui.style.color = 'white';
    ui.style.padding = '15px';
    ui.style.zIndex = '99999';
    ui.style.borderRadius = '5px';
    ui.innerHTML = `
        <h3>Varsagel Bot</h3>
        <div id="bot-status">Hazır</div>
        <div>Toplanan: <span id="bot-count">0</span></div>
        <button id="bot-stop" style="background:red;color:white;border:none;padding:5px;margin-top:5px;">Durdur</button>
        <button id="bot-export" style="background:green;color:white;border:none;padding:5px;margin-top:5px;">Excel İndir</button>
    `;
    document.body.appendChild(ui);

    document.getElementById('bot-stop').onclick = () => { isRunning = false; updateStatus("Durduruldu."); };
    document.getElementById('bot-export').onclick = () => exportToExcel();

    function updateStatus(msg) {
        document.getElementById('bot-status').innerText = msg;
        console.log(`[BOT] ${msg}`);
    }

    function extractLinks(doc) {
        const selectors = [
            'ul.categoryList li a',
            '.cl-filter-list li a',
            '.category-list li a',
            '.search-filter ul li a',
            '.categories-board li a'
        ];
        
        for (const sel of selectors) {
            const els = Array.from(doc.querySelectorAll(sel));
            if (els.length > 0) {
                return els.map(el => ({
                    text: el.innerText.replace(/\(\d+\)/g, '').trim(),
                    url: el.href
                })).filter(i => i.text && !i.text.includes('Tümü') && !i.text.includes('Fiyat'));
            }
        }
        return [];
    }

    function waitForLoad(win) {
        return new Promise(resolve => {
            const check = setInterval(() => {
                if (win.document.readyState === 'complete' && win.document.body.innerText.length > 100) {
                    clearInterval(check);
                    setTimeout(resolve, WAIT_TIME);
                }
            }, 500);
        });
    }

    // Excel İndirme Fonksiyonu (Basit CSV formatı)
    function exportToExcel() {
        let csvContent = "data:text/csv;charset=utf-8,\uFEFF"; // UTF-8 BOM
        csvContent += "Marka;Model;Seri;Paket\n";
        
        collectedData.forEach(row => {
            csvContent += row.join(";") + "\n";
        });

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "arac_verileri.csv");
        document.body.appendChild(link);
        link.click();
    }

    // ANA İŞLEM
    try {
        updateStatus("Başlıyor...");
        
        // Popup aç
        const popup = window.open("", "bot_popup", "width=1000,height=800");
        if (!popup) {
            alert("Lütfen popup izni verin ve tekrar deneyin!");
            return;
        }

        // Ana sayfadaki markaları al
        const brands = extractLinks(document);
        if (brands.length === 0) {
            updateStatus("Marka listesi bulunamadı! Doğru sayfada mısınız?");
            return;
        }

        for (const brand of brands) {
            if (!isRunning) break;
            updateStatus(`Marka taranıyor: ${brand.text}`);
            
            // Marka sayfasına git
            popup.location.href = brand.url;
            await waitForLoad(popup);
            
            const models = extractLinks(popup.document);
            if (models.length === 0) {
                // Alt kategori yoksa direkt kaydet (ama otomobilde genelde olur)
                continue;
            }

            for (const model of models) {
                if (!isRunning) break;
                updateStatus(`Model taranıyor: ${brand.text} > ${model.text}`);
                
                popup.location.href = model.url;
                await waitForLoad(popup);

                const series = extractLinks(popup.document);
                if (series.length === 0) {
                    // Seri yoksa model olarak kaydet
                    collectedData.push([brand.text, model.text, "", ""]);
                    document.getElementById('bot-count').innerText = collectedData.length;
                    continue;
                }

                for (const ser of series) {
                    if (!isRunning) break;
                    // updateStatus(`Seri taranıyor: ${ser.text}`); // Çok hızlı değişmesin

                    popup.location.href = ser.url;
                    await waitForLoad(popup);

                    const packages = extractLinks(popup.document);
                    if (packages.length === 0) {
                         collectedData.push([brand.text, model.text, ser.text, ""]);
                    } else {
                        for (const pkg of packages) {
                             collectedData.push([brand.text, model.text, ser.text, pkg.text]);
                        }
                    }
                    document.getElementById('bot-count').innerText = collectedData.length;
                }
            }
        }
        
        updateStatus("Tarama Tamamlandı!");
        exportToExcel();
        popup.close();

    } catch (e) {
        console.error(e);
        updateStatus("Hata oluştu: " + e.message);
    }
})();
