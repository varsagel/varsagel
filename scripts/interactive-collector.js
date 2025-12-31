
// =============================================================================
// SAHIBINDEN.COM INTERAKTIF VERI TOPLAYICI (Excel Exportlu)
// =============================================================================
// Bu kodu konsola yapıştırın. Sağ üstte bir panel açılacaktır.
// 1. "Sayfayı Tara" butonuna basın (Otomatik tarar).
// 2. Listeden istediklerinizi seçin veya "Hepsini Ekle" deyin.
// 3. Farklı sayfalara gidip işlemi tekrarlayın.
// 4. En sonunda "Excel İndir" diyerek biriken veriyi alın.
// =============================================================================

(function() {
    // --- CSS STİLLERİ ---
    const style = document.createElement('style');
    style.innerHTML = `
        #varsagel-collector {
            position: fixed;
            top: 10px;
            right: 10px;
            width: 350px;
            background: #fff;
            border: 2px solid #2980b9;
            box-shadow: 0 5px 15px rgba(0,0,0,0.3);
            z-index: 999999;
            font-family: Arial, sans-serif;
            border-radius: 8px;
            overflow: hidden;
            font-size: 13px;
        }
        #varsagel-header {
            background: #2980b9;
            color: white;
            padding: 10px;
            font-weight: bold;
            display: flex;
            justify-content: space-between;
            align-items: center;
            cursor: move;
        }
        #varsagel-content {
            padding: 10px;
            max-height: 500px;
            overflow-y: auto;
        }
        .v-row { margin-bottom: 8px; }
        .v-btn {
            background: #3498db;
            color: white;
            border: none;
            padding: 6px 12px;
            border-radius: 4px;
            cursor: pointer;
            margin-right: 5px;
            font-size: 12px;
        }
        .v-btn:hover { background: #2980b9; }
        .v-btn.green { background: #27ae60; }
        .v-btn.green:hover { background: #219150; }
        .v-btn.red { background: #c0392b; }
        .v-btn.red:hover { background: #a93226; }
        .v-btn.orange { background: #d35400; }
        .v-tag {
            background: #ecf0f1;
            padding: 2px 6px;
            border-radius: 4px;
            margin: 2px;
            display: inline-block;
            border: 1px solid #bdc3c7;
        }
        .v-list-item {
            display: flex;
            justify-content: space-between;
            padding: 4px;
            border-bottom: 1px solid #eee;
        }
        .v-list-item:hover { background: #f9f9f9; }
        .v-breadcrumb { color: #7f8c8d; font-size: 11px; margin-bottom: 5px; }
        .v-stat { font-weight: bold; color: #2c3e50; }
    `;
    document.head.appendChild(style);

    // --- UI OLUŞTURMA ---
    const container = document.createElement('div');
    container.id = 'varsagel-collector';
    container.innerHTML = `
        <div id="varsagel-header">
            <span>Varsagel Veri Toplayıcı</span>
            <span style="cursor:pointer" onclick="document.getElementById('varsagel-collector').remove()">X</span>
        </div>
        <div id="varsagel-content">
            <div class="v-row">
                <div class="v-breadcrumb" id="v-current-path">Konum: Tespit ediliyor...</div>
            </div>
            <div class="v-row">
                <button class="v-btn" id="v-scan-btn">Sayfadaki Listeyi Tara</button>
                <button class="v-btn green" id="v-add-all-btn">Tümünü Ekle (+)</button>
            </div>
            <div class="v-row" style="border-top: 1px solid #eee; padding-top:5px;">
                <div id="v-detected-list"></div>
            </div>
            <div class="v-row" style="border-top: 2px solid #2980b9; padding-top:10px; margin-top:10px;">
                <div>Toplanan Satır: <span id="v-count" class="v-stat">0</span></div>
            </div>
            <div class="v-row">
                <button class="v-btn orange" id="v-download-btn">Excel İndir (XLS)</button>
                <button class="v-btn red" id="v-clear-btn">Temizle</button>
            </div>
        </div>
    `;
    document.body.appendChild(container);

    // --- STATE & STORAGE ---
    const STORAGE_KEY = 'varsagel_collected_data';
    let detectedItems = []; // { text: "A3", url: "..." }
    let currentContext = []; // ["Otomobil", "Audi"]

    function loadData() {
        const data = localStorage.getItem(STORAGE_KEY);
        return data ? JSON.parse(data) : [];
    }

    function saveData(data) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        updateCount();
    }

    function updateCount() {
        const data = loadData();
        document.getElementById('v-count').innerText = data.length;
    }

    // --- CORE FONKSİYONLAR ---

    function getBreadcrumb() {
        // Sahibinden breadcrumb yapısını analiz et
        const parts = [];
        // Genellikle .search-breadcrumb veya benzeri
        // 1. Yöntem: URL analizi (daha güvenilir olabilir)
        // 2. Yöntem: Sayfa başlığı veya breadcrumb elementleri
        
        // Breadcrumb elementlerini bulmaya çalış
        const breadcrumbLinks = document.querySelectorAll('.search-breadcrumb li a, ul.breadcrumb li a');
        if (breadcrumbLinks.length > 0) {
            breadcrumbLinks.forEach(el => parts.push(el.innerText.trim()));
        } else {
            // Yedek: Sayfa başlığından tahmin et
            parts.push(document.title.split(' - ')[0]);
        }
        return parts.filter(p => p !== 'Anasayfa' && p !== 'Vasıta'); // Gereksizleri at
    }

    function scanPage() {
        currentContext = getBreadcrumb();
        document.getElementById('v-current-path').innerText = "Konum: " + currentContext.join(' > ');

        // Listeyi bul
        detectedItems = [];
        const potentialSelectors = [
            '.cl-filter-list li a',      // Sol menü filtreleri
            '.category-list li a',       // Kategori listesi
            '.searchResultsRowClass tr td.searchResultsTitleValue a' // İlan listesi (detay gerekirse)
        ];

        let listElement = null;
        for (const sel of potentialSelectors) {
            const els = document.querySelectorAll(sel);
            if (els.length > 0 && !sel.includes('searchResults')) { // Öncelik filtrelerde
                listElement = els;
                break;
            }
        }

        const listContainer = document.getElementById('v-detected-list');
        listContainer.innerHTML = '';

        if (listElement && listElement.length > 0) {
            listElement.forEach(el => {
                const text = el.innerText.replace(/\(\d+\)/g, '').trim(); // Sayıları temizle
                if (text) {
                    detectedItems.push(text);
                    // UI'a ekle
                    const div = document.createElement('div');
                    div.className = 'v-list-item';
                    div.innerHTML = `
                        <span>${text}</span>
                        <button class="v-btn green" style="padding:2px 5px; font-size:10px;" onclick="window.addItem('${text}')">+</button>
                    `;
                    listContainer.appendChild(div);
                }
            });
            // "Tümünü Ekle" butonu için listeyi sakla
        } else {
            listContainer.innerHTML = '<div style="color:red">Liste bulunamadı.</div>';
        }
    }

    // Tekil Ekleme (Global erişim için window'a atıyoruz)
    window.addItem = function(itemText) {
        const data = loadData();
        // Hiyerarşi: Marka - Model - Seri - Paket
        // currentContext ne içeriyor? Örn: ["Otomobil", "Audi", "A3"]
        // Eklenen item: "1.6 TDI"
        
        // Yapıyı düzleştirip kaydedelim. 
        // Excel için kolonlar: Kolon 1 | Kolon 2 | Kolon 3 | Kolon 4
        // Context + Item
        const row = [...currentContext, itemText];
        
        // Mükerrer kontrolü
        const rowStr = JSON.stringify(row);
        const exists = data.some(d => JSON.stringify(d) === rowStr);
        
        if (!exists) {
            data.push(row);
            saveData(data);
            // Görsel geri bildirim (Button rengini değiştirme vs. yapılabilir ama basit tutuyoruz)
        }
    };

    // --- EVENT LISTENERS ---

    document.getElementById('v-scan-btn').onclick = scanPage;

    document.getElementById('v-add-all-btn').onclick = function() {
        if (detectedItems.length === 0) {
            alert("Önce listeyi tarayın!");
            return;
        }
        detectedItems.forEach(item => window.addItem(item));
        alert(`${detectedItems.length} öğe eklendi!`);
    };

    document.getElementById('v-clear-btn').onclick = function() {
        if(confirm("Tüm toplanan veriler silinsin mi?")) {
            localStorage.removeItem(STORAGE_KEY);
            updateCount();
        }
    };

    document.getElementById('v-download-btn').onclick = function() {
        const data = loadData();
        if (data.length === 0) {
            alert("İndirilecek veri yok!");
            return;
        }

        // CSV/XLS Oluşturma
        let csvContent = "data:application/vnd.ms-excel;charset=utf-8,";
        // Header (Tahmini)
        csvContent += "Kategori 1\tKategori 2\tKategori 3\tKategori 4\tDeğer\n";
        
        data.forEach(row => {
            csvContent += row.join("\t") + "\n";
        });

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "sahibinden_veri.xls");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // Başlangıçta çalıştır
    updateCount();
    scanPage(); // Otomatik tara
    console.log("Varsagel Collector Hazır!");

})();
