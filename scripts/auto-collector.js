
// =============================================================================
// SAHIBINDEN.COM OTO-VERI TOPLAYICI (Gelişmiş Versiyon)
// =============================================================================
// Bu kod:
// 1. Sayfa değişimlerini otomatik algılar.
// 2. Filtrelemeleri takip eder.
// 3. Hafızada veriyi tutar.
// =============================================================================

(function() {
    // Zaten çalışıyorsa tekrar başlatma
    if(document.getElementById('varsagel-collector')) {
        alert('Veri Toplayıcı zaten aktif!');
        return;
    }

    // --- AYARLAR ---
    const CONFIG = {
        autoScan: true, // Sayfa açılınca otomatik tara
        storageKey: 'varsagel_data_v2'
    };

    // --- UI STİLLERİ ---
    const style = document.createElement('style');
    style.innerHTML = `
        #varsagel-collector { 
            position: fixed; top: 10px; right: 10px; width: 300px; 
            background: #fff; border: 2px solid #f1c40f; 
            box-shadow: 0 10px 20px rgba(0,0,0,0.2); 
            z-index: 9999999; font-family: 'Roboto', Arial, sans-serif; 
            border-radius: 8px; overflow: hidden; font-size: 13px;
        }
        #v-header { 
            background: #f1c40f; color: #2c3e50; padding: 10px; 
            font-weight: bold; display: flex; justify-content: space-between; 
            align-items: center; cursor: move; border-bottom: 1px solid #d4ac0d;
        }
        #v-body { padding: 10px; max-height: 80vh; overflow-y: auto; }
        .v-row { margin-bottom: 8px; }
        .v-btn { 
            width: 100%; padding: 8px; border: none; border-radius: 4px; 
            cursor: pointer; font-weight: bold; color: white; transition: 0.2s; margin-bottom: 5px;
        }
        .v-btn:hover { opacity: 0.9; }
        .v-btn.blue { background: #3498db; }
        .v-btn.green { background: #27ae60; }
        .v-btn.red { background: #e74c3c; }
        .v-btn.dark { background: #2c3e50; }
        .v-stat-box {
            background: #ecf0f1; padding: 8px; border-radius: 4px;
            text-align: center; margin-bottom: 8px; border: 1px solid #bdc3c7;
        }
        .v-stat-num { font-size: 18px; font-weight: bold; color: #e67e22; }
        .v-list-item {
            padding: 4px; border-bottom: 1px solid #eee; display: flex; 
            justify-content: space-between; align-items: center; font-size: 11px;
        }
        .v-badge {
            background: #3498db; color: white; padding: 2px 6px; 
            border-radius: 10px; font-size: 10px;
        }
    `;
    document.head.appendChild(style);

    // --- UI HTML ---
    const ui = document.createElement('div');
    ui.id = 'varsagel-collector';
    ui.innerHTML = `
        <div id="v-header">
            <span>🚀 Varsagel OTO-Collect</span>
            <span style="cursor:pointer; font-size:16px;" onclick="document.getElementById('varsagel-collector').remove()">×</span>
        </div>
        <div id="v-body">
            <div class="v-stat-box">
                <div>Toplanan Veri</div>
                <div class="v-stat-num" id="v-total-count">0</div>
            </div>
            
            <div class="v-row">
                <div style="font-weight:bold; margin-bottom:5px; border-bottom:1px solid #eee;">Mevcut Sayfa:</div>
                <div id="v-current-path" style="font-size:11px; color:#7f8c8d;">Algılanıyor...</div>
            </div>

            <div class="v-row">
                <button class="v-btn blue" id="v-scan-btn">🔍 Sayfayı Tara</button>
                <div id="v-scan-result" style="font-size:11px; color:#27ae60; text-align:center; margin:5px 0; min-height:15px;"></div>
            </div>

            <button class="v-btn green" id="v-add-all">➕ BULUNANLARI EKLE</button>
            
            <hr style="border:0; border-top:1px solid #eee; margin:10px 0;">
            
            <button class="v-btn dark" id="v-download">📥 EXCEL İNDİR</button>
            <button class="v-btn red" id="v-reset" style="font-size:11px; padding:5px;">🗑️ Sıfırla</button>
        </div>
    `;
    document.body.appendChild(ui);

    // --- DEĞİŞKENLER ---
    let detectedItems = []; // { text: "A3" }
    let currentPath = [];   // ["Otomobil", "Audi"]

    // --- FONKSİYONLAR ---

    function getStorage() {
        return JSON.parse(localStorage.getItem(CONFIG.storageKey) || '[]');
    }

    function setStorage(data) {
        localStorage.setItem(CONFIG.storageKey, JSON.stringify(data));
        updateStats();
    }

    function updateStats() {
        const data = getStorage();
        document.getElementById('v-total-count').innerText = data.length;
    }

    function getBreadcrumb() {
        // Sahibinden breadcrumb yapısını çek
        const els = document.querySelectorAll('.search-breadcrumb li a, ul.breadcrumb li a');
        if(els.length > 0) {
            return Array.from(els)
                .map(el => el.innerText.trim())
                .filter(t => t !== 'Anasayfa' && t !== 'Vasıta');
        }
        return [document.title.split(' - ')[0]];
    }

    function scan() {
        currentPath = getBreadcrumb();
        document.getElementById('v-current-path').innerText = currentPath.join(' > ');

        detectedItems = [];
        // Sahibinden'in sol menü veya kategori listesi selektörleri
        const selectors = [
            '.cl-filter-list li a',
            '.category-list li a',
            '.search-filter ul li a'
        ];

        let found = false;
        for(const sel of selectors) {
            const els = document.querySelectorAll(sel);
            if(els.length > 0) {
                els.forEach(el => {
                    const txt = el.innerText.replace(/\(\d+\)/g, '').trim();
                    if(txt) detectedItems.push(txt);
                });
                found = true;
                break;
            }
        }

        const resDiv = document.getElementById('v-scan-result');
        if(found) {
            resDiv.innerText = `✅ ${detectedItems.length} öğe bulundu`;
            resDiv.style.color = '#27ae60';
        } else {
            resDiv.innerText = `⚠️ Liste bulunamadı`;
            resDiv.style.color = '#e74c3c';
        }
    }

    // --- EVENTLER ---

    document.getElementById('v-scan-btn').onclick = scan;

    document.getElementById('v-add-all').onclick = () => {
        if(detectedItems.length === 0) {
            scan();
            if(detectedItems.length === 0) return alert('Eklenecek veri bulunamadı!');
        }

        const data = getStorage();
        let addedCount = 0;

        detectedItems.forEach(item => {
            // Veri yapısı: [...Kategoriler, Değer]
            // Örn: ["Otomobil", "Audi", "A3"]
            const row = [...currentPath, item];
            const signature = JSON.stringify(row);
            
            if(!data.some(d => JSON.stringify(d) === signature)) {
                data.push(row);
                addedCount++;
            }
        });

        setStorage(data);
        
        // Geri bildirim
        const btn = document.getElementById('v-add-all');
        const originalText = btn.innerText;
        btn.innerText = `✅ ${addedCount} EKLENDİ`;
        setTimeout(() => btn.innerText = originalText, 2000);
    };

    document.getElementById('v-download').onclick = () => {
        const data = getStorage();
        if(data.length === 0) return alert('İndirilecek veri yok!');

        let csv = '\uFEFF'; // BOM for Excel UTF-8
        // Header bulmaya çalış (en uzun satıra göre)
        const maxCols = Math.max(...data.map(r => r.length));
        for(let i=1; i<maxCols; i++) csv += `Kategori ${i}\t`;
        csv += "Değer\n";

        data.forEach(row => {
            csv += row.join('\t') + '\n';
        });

        const blob = new Blob([csv], { type: 'application/vnd.ms-excel' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `sahibinden_veri_${new Date().getTime()}.xls`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    };

    document.getElementById('v-reset').onclick = () => {
        if(confirm('Tüm toplanan veriler silinsin mi?')) {
            localStorage.removeItem(CONFIG.storageKey);
            updateStats();
        }
    };

    // --- OTOMATİK İZLEME (MutationObserver) ---
    // Sayfa içinde AJAX ile içerik değişirse tekrar tara
    let timeout;
    const observer = new MutationObserver(() => {
        clearTimeout(timeout);
        timeout = setTimeout(() => {
            if(CONFIG.autoScan) scan();
        }, 1000); // Değişiklikten 1 sn sonra tara
    });

    const targetNode = document.querySelector('body');
    if(targetNode) {
        observer.observe(targetNode, { childList: true, subtree: true });
    }

    // Başlangıç
    updateStats();
    scan();
    console.log('Varsagel Collector v2.0 Başlatıldı');

})();
