# Varsagel Kapsamlı İyileştirme Planı

İncelemelerim sonucunda belirlediğim kritik güvenlik, performans ve kod kalitesi eksikliklerini gidermek için aşağıdaki adımları uygulayacağım.

## 1. Aşama: Güvenlik ve Stabilite (Kritik)
*   **Middleware Güncellemesi**: `middleware.ts` dosyasını güncelleyerek `/profil`, `/talep-olustur` ve `/admin` gibi hassas sayfaları koruma altına alacağım. Şu anki yapı yetersiz.
*   **CORS Kısıtlaması**: `middleware.ts` içindeki `Access-Control-Allow-Origin: *` ayarını sadece kendi domaininize izin verecek şekilde düzelteceğim.
*   **Girdi Doğrulama (Validation)**: `api/talepler` başta olmak üzere API rotalarına **Zod** kütüphanesi ile sıkı veri doğrulama ekleyerek `any` kullanımını kaldıracağım ve hatalı verilerin sistemi bozmasını engelleyeceğim.

## 2. Aşama: Performans ve Ölçeklenebilirlik
*   **Veritabanı Sorgu Optimizasyonu**: `listingService.ts` içinde şu an **tüm veriyi çekip bellekte (RAM) filtreleyen** yapıyı değiştireceğim. Bunun yerine PostgreSQL'in JSONB yeteneklerini kullanarak filtrelemeyi doğrudan veritabanında yapacak şekilde refaktör edeceğim. Bu, site büyüdüğünde çökmesini engelleyecek en önemli adımdır.
*   **Önbellekleme (Caching)**: Ana sayfadaki `force-dynamic` ayarını kaldırıp, Next.js'in önbellekleme mekanizmasını (Revalidation) devreye alarak sayfa açılış hızlarını artıracağım.

## 3. Aşama: Kullanıcı Deneyimi (UX) ve Temizlik
*   **Yükleme Ekranları**: `src/app/loading.tsx` dosyası ekleyerek sayfa geçişlerinde beyaz ekran yerine şık bir yükleme animasyonu göstereceğim.
*   **Tip Güvenliği**: Kod genelindeki `any` tiplerini temizleyip TypeScript standartlarına uygun hale getireceğim.

Bu planı onaylarsanız, değişiklikleri sırasıyla uygulamaya başlayacağım.
