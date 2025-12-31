document.addEventListener('DOMContentLoaded', updateStats);

// İstatistikleri sürekli güncelle
setInterval(updateStats, 1000);

function updateStats() {
    chrome.storage.local.get(['isRunning', 'currentPath', 'allData'], (data) => {
        document.getElementById('q-len').innerText = data.currentPath ? data.currentPath.length : 0;
        document.getElementById('res-len').innerText = data.allData ? data.allData.length : 0;
        document.getElementById('last-action').innerText = data.isRunning ? "Çalışıyor..." : "Bekliyor";
        
        const status = document.getElementById('status');
        if (data.isRunning) {
            status.innerText = "Çalışıyor... Sayfa değişiyor...";
            status.style.color = "#2ecc71";
        } else {
            status.innerText = "Durduruldu.";
            status.style.color = "#e74c3c";
        }

        // Listeyi güncelle
        const list = document.getElementById('data-list');
        list.innerHTML = "";
        const recent = (data.allData || []).slice(-10).reverse(); // Son 10 veri
        recent.forEach(r => {
            const li = document.createElement('li');
            let text = r.Path || "Bilinmeyen Veri";
            
            li.textContent = text;
            li.style.whiteSpace = "nowrap";
            li.style.overflow = "hidden";
            li.style.textOverflow = "ellipsis";
            list.appendChild(li);
        });
    });
}

document.getElementById('btn-start').addEventListener('click', () => {
    chrome.storage.local.set({ isRunning: true, currentPath: [], allData: [] }, () => {
        // Mevcut sayfaya mesaj gönder: Başla
        chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
            if(tabs[0]) chrome.tabs.sendMessage(tabs[0].id, {action: "start"});
        });
    });
});

document.getElementById('btn-stop').addEventListener('click', () => {
    chrome.storage.local.set({ isRunning: false });
});

document.getElementById('btn-reset').addEventListener('click', () => {
    chrome.storage.local.set({ 
        currentPath: [], 
        allData: [], 
        isRunning: false 
    }, () => {
        alert("Veriler sıfırlandı! 'Başlat'a basınca en baştan başlayacak.");
        updateStats();
    });
});

document.getElementById('btn-export').addEventListener('click', () => {
    chrome.storage.local.get(['allData'], (data) => {
        if (!data.allData || data.allData.length === 0) {
            alert("Henüz veri toplanmadı!");
            return;
        }

        let csv = "Marka;Model;Motor_Seri;Donanim_Seri;Path;URL\n";
        
        data.allData.forEach(r => {
            const row = [
                r.Marka || "",
                r.Model || "",
                r.Motor_Seri || "",
                r.Donanim_Seri || "",
                r.Path || "",
                r.URL || ""
            ].map(field => `"${field}"`).join(";");
            
            csv += row + "\n";
        });

        const blob = new Blob(["\uFEFF" + csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        
        chrome.downloads.download({
            url: url,
            filename: "sahibinden_verileri.csv"
        });
    });
});