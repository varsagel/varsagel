// Sayfa yüklendiğinde content script zaten çalışır, 
// ama bazen tetiklemek gerekebilir.
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === 'complete' && tab.url && tab.url.includes('sahibinden.com')) {
        // Content script'e "Sayfa Yüklendi" mesajı atabiliriz ama
        // Content script zaten yüklendiği an çalışacağı için gerek yok.
        // Burası boş kalabilir veya loglama için kullanılabilir.
    }
});
