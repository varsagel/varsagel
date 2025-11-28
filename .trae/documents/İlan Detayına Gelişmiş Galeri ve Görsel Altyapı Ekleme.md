## Hedefler
- İlan detayında gerçek görsellerle çalışan, küçük önizlemeli ve tam ekran (lightbox) destekli galeri
- Benzer ilanlar bölümünde küçük görsel önizlemeleri ve hover mikro etkileşimler
- Kategori sayfasındaki kartlarda lazy-load ve güvenli fallback görsel

## Veri Modeli ve API
- Prisma: `Listing` modeline `images String[]` alanı ekle (görsel URL’leri)
- Migration: Şemayı güncelle, dev DB’yi senkronize et
- API `/api/ilan-olustur`: `images` dizisini kabul et, doğrula, boşsa fallback kullan
- Güvenlik: Harici görsel URL’lerini `images.remotePatterns` ile sınırlandırılmış domainlerden yükle

## UI Uygulaması
- `src/app/ilan/[id]/page.tsx`:
  - Küçük önizlemeler + ana görsel + lightbox (tam ekran) açma
  - Klavye (sol/sağ ok) desteği ve mobil swipe
- `src/app/kategori/[category]/[subcategory]/page.tsx`:
  - Kart görsellerini lazy-load, fallback görsel ekle
- `src/components/ui/Gallery.tsx` (opsiyonel): Yeniden kullanılabilir küçük galeri bileşeni

## Performans ve Erişilebilirlik
- Lazy-load (native `loading="lazy"`)
- ARIA etiketleri ve buton odak stilleri
- Sadece gerekli alanları `select` ile çekme

## Dosya Değişiklikleri
- `prisma/schema.prisma`: `images String[]`
- `src/app/api/ilan-olustur/route.ts`: `images` kabul/validasyon
- `src/app/ilan/[id]/page.tsx`: galeri ve lightbox
- `src/app/kategori/[category]/[subcategory]/page.tsx`: lazy-load ve fallback
- `next.config.ts`: `images.remotePatterns` gerekirse genişletme

## Test
- Yeni ilan oluştururken `images` ile deneme
- Detay sayfasında galeri küçük/ana/ışık kutusu akışını doğrulama
- Kategori sayfasında kart görsellerinin lazy-load ve fallback davranışını gözlemleme

Onayla ve uygulamaya geçeyim; tüm değişiklikler mevcut stil ve mimariye uyumlu olacak.