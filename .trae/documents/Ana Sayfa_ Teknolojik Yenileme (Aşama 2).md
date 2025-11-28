## Hedefler
- Sol sidebar’ı daha akıllı hale getirmek: accordion + arama + mobilde Drawer
- Top ilanlar slider’ını gerçek bir carousel’e çevirmek: auto‑play, ileri/geri, durdur/başlat, hover’da duraklat
- Filtre panelini çökebilir/sticky yaparak alanı genişletmek; seçili filtreleri “chip” olarak üstte göstermek
- İlan kartlarını daha da kompakt ve okunaklı yapmak; skeleton yükleme eklemek
- Küçük performans ve erişilebilirlik iyileştirmeleri (lazy‑load, prefetch, klavye erişimi)

## Yapılacak Değişiklikler
### Sidebar (Accordion + Arama + Drawer)
- Accordion gruplama: kategori başlığını tıklayınca alt kategoriler aç/kapanır
- Alt kategori araması: input ile alt kategorileri filtreler
- Mobil görünüm: Drawer içinde sol paneli aç/kapat

### Top Carousel
- Auto‑play (time‑based kaydırma) + manuel kontrol okları
- Durdur/başlat butonu; hover’da otomatik duraklatma
- Klavye erişimi (Sol/Sağ ok tuşları); ARIA roller

### Filtre Paneli
- Paneli collapse; sticky başlıkta görünür
- Seçili filtreleri chip olarak üstte göster; tek tıkla temizleme

### İlan Kartları
- Görsel yüksekliği `h-28/h-32`; tipografi `text-sm/text-xs`
- Satır başına daha çok kart için `gap` azaltma
- Yükleme sırasında skeleton kartları

### Performans/Erişilebilirlik
- Görseller için lazy‑load ve güvenli domainler: `next.config.ts` `images.remotePatterns`
- Route prefetch: kategori/alt kategori linklerinde
- Carousel kontrol butonlarında `aria-label` ve focus stilleri

## Teknik Uygulama
- `src/app/page.tsx`:
  - Sidebar’ı accordion + arama ile güncelle
  - Top slider’ı carousel kontrolleriyle zenginleştir
  - Filtre panelini collapse/sticky ve chip’lerle düzenle
  - Kartları daha kompakt tasarıma çek ve skeleton ekle
- `next.config.ts`: `images.remotePatterns` tanımla

## Test ve Doğrulama
- Masaüstü/mobil: Sidebar accordion + Drawer davranışları
- Carousel: auto‑play, oklarla kontrol, hover’da duraklatma, klavye erişimi
- Filtreler: chip’ler üzerinden tek tek temizleme; panelin aç/kapanması
- Performans: Liste yükleme iskeleti ve lazy‑load gözlemi

Onay sonrası bu adımları uygulayacağım; tüm değişiklikler mevcut UI bileşenleri ve kod stiline uyumlu olacak.