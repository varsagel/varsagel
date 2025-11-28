## Amaç
- İlan detayında gerçek görselleri küçük önizleme + ana görsel + lightbox ile göstermek
- Benzer ilan kartlarına küçük görsel ve hover etkileşimi eklemek
- Kategori ve ana sayfa kartlarında lazy-load ve fallback görsel kullanmak

## Şema ve API Güncellemeleri
- Prisma şema: `Listing` modeline `images String[]` alanı ekle
- Migration: veritabanını senkronize et
- `POST /api/ilan-olustur`: `images: string[]` kabul et; boşsa fallback ata; boyut ve URL doğrulama yap

## UI Güncellemeleri
- `src/app/ilan/[id]/page.tsx`:
  - Gerçek `images` dizisini kullanarak küçük önizlemeler (thumbs) ve ana görsel; lightbox aç/kapa
  - Klavye desteği (Sol/Sağ ok), ESC ile kapatma, mobil swipe
- `src/app/kategori/[category]/[subcategory]/page.tsx` ve `src/app/page.tsx`:
  - Kart görselleri için `loading="lazy"`, fallback görsel, hatalı URL’de default resim
- Benzer ilanlar: kartta küçük görsel ve fiyat/konum bilgisi; hover mikro animasyon

## Güvenlik ve Yapılandırma
- `next.config.ts`: `images.remotePatterns` içinde güvenli domainleri tanımla (örn. CDN veya belirli hostlar)

## Test Planı
- İlan oluştururken `images` yollayarak detay sayfada galeri akışını doğrula
- Kategori listesinde kart görsellerinin lazy-load ve fallback davranışını test et
- Benzer ilanlarda kart görseli ve hover etkileşimlerini kontrol et

Onayından sonra şema, API ve UI güncellemelerini adım adım uygulayıp test edeceğim.