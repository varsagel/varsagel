## Hedefler
- Sol tarafta açılır/kapanır, arama destekli dinamik kategori paneli
- Ortada “en çok teklif alan” ilanları modern bir carousel ile akıcı gösterim
- İlan kartlarını kompakt, hızlı ve okunabilir tasarıma çekmek
- Filtre bölümünü gizlenebilir/sticky yaparak ortayı genişletmek
- Genel görünümü cam (glassmorphism) + neon vurgularla daha teknolojik hale getirmek

## Tasarım Güncellemeleri
- Sidebar: Accordion gruplama, alt kategori araması, mobilde Drawer ile açılır panel
- Carousel: Auto-play, durdur/başlat, ileri/geri okları, hover’da duraklat, yoğun listelerde sanal kaydırma
- Kartlar: Daha küçük görsel (`h-28/h-32`), tipografi (`text-sm/text-xs`), fiyat ve lokasyon satırı minimal, hover mikro etkileşim
- Filtreler: Çökebilir (collapse) kutu, seçili filtreleri “chip” halinde üstte göstermek, tek tıkla temizleme

## İşlevsel Güncellemeler
- Kategori paneli: `/api/categories` verisini kullanıp accordion ile alt kategorileri aç/kapat; arama kutusu ile alt kategori filtreleme
- Top slider: Halihazırdaki `/api/listings/top` verisiyle carousel’e dönüştürme (oklar, auto-play, dur/başlat)
- Liste grid: `gap` azaltma ve responsive kırılımlar, satır başına daha çok kart
- Skeleton: İlanlar ve top slider için yükleme iskeleti

## Veri ve Performans
- Görsel lazy-load, `prefetch` ile kategori sayfaları
- Carousel öğelerini limitli (`take: 10`) tutarak performans
- Next `images.remotePatterns` uyarısını ele alıp güvenli dış görsel tanımlama

## Erişilebilirlik ve UX
- Carousel okları ve durdur/başlat için klavye erişimi
- Odak (focus) durumları, ARIA etiketleri
- Alt metinler

## Teknik Dosya Değişiklikleri
- `src/app/page.tsx`: Sidebar accordion + arama, compact kartlar, collapsible filtre, carousel kontrol butonları ve auto-play
- Gerekirse küçük yardımcı bileşenler: `src/components/ui/` altına minimal kontrol butonları veya skeleton (mevcut UI yapılarına uyumlu)
- `next.config.ts`: `images.remotePatterns` düzenlemesi

## Test & Doğrulama
- Ana sayfa yüklenmesi: Sidebar verisi gelir, slider otomatik çalışır, kart grid’i kompakt
- Mobil görünüm: Sidebar Drawer aç/kapa; carousel dokunma hareketi
- E2E tıklamaları: Kategori/alt kategori linkleri, slider kartlarından ilan sayfasına geçiş

## Teslimatlar
- Modern görünüm, kompakt grid, işlevsel ve akıcı carousel, açılır-kapanır kategori paneli
- Kod değişiklikleri `src/app/page.tsx` ağırlıklı; mevcut UI bileşenleri ile uyumlu