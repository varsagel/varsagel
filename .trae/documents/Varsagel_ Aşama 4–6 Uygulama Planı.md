## Genel Kapsam
- Detaylı arama, favoriler, gerçek zamanlı bildirimler (SSE), profil sekmeleri, admin paneli, zamanlayıcı işler, SEO ve güvenlik güçlendirmeleri

## Detaylı Arama
- API: `/api/listings` → filtre parametreleri genişletilecek
  - `category`, `subcategory`, `city`, `district`, `minPrice`, `maxPrice`
  - Dinamik alanlar: `attributes[marka]=...`, `attributes[model]=...`, `attributes[yil]=...` (vasıta vb.)
- UI: Ana sayfa ve kategori sayfasında gelişmiş filtre paneli (dinamik inputlar)
- Sorgu: Prisma `where` içinde JSON alan eşleştirme (attributesJson parse ve eşleme)

## Favoriler
- API: `POST /api/favorites` (toggle) ve `GET /api/favorites`
- UI: İlan kartlarında favori butonu; `/profil` → Favoriler sekmesi
- Veri: `Favorite` birleşik anahtar (`userId`,`listingId`), listeleme için JOIN

## Bildirimler (Gerçek Zamanlı)
- SSE Kanal: `GET /api/notifications/stream` (oturumlu)
- Olaylar: yeni teklif, teklif kabul/red, mesaj, ilan durum değişimi
- UI: Header badge + `/profil` bildirim listesi, okundu işaretleme (`PATCH /api/notifications/:id`)

## Profil Sekmeleri
- Sekmeler: `İlanlarım`, `Aldığım Teklifler`, `Verdiğim Teklifler`, `Favorilerim`, `Mesajlarım`, `Bildirimler`
- API: sayfalama destekli listeleme uçları
- UI: Sekmeli bileşen; her sekme ilgili endpointten veri çeker

## Admin Paneli
- Yol: `/admin`
- Modüller: Kategori/alt kategori/dinamik alan şablon yönetimi (JSON editör), kullanıcı ve ilan/teklif moderasyonu, raporlar
- API: CRUD uçları ve yetki kontrolü (ADMIN rolü)

## Zamanlayıcı İşler
- İlanı 1 ay sonunda pasife alma: kontrol mantığı API tarafında (istek bazlı) veya node‑cron
- Pasifte 1 ay kalan teklifleri silme
- Cooldown kontrolü (2 saat): zaten teklif API içinde

## SEO ve Mobil
- Metadata, OpenGraph, JSON‑LD (Breadcrumb/Listings), `sitemap.xml`, `robots.txt`, canonical
- Performans: lazy‑load, prefetch, kod bölme
- Mobil: responsive tasarım, dokunma etkileşimleri, carousel swipe

## Güvenlik
- Rate limit: teklif ve mesaj end‑point’lerinde kullanıcı/IP bazlı
- Girdi doğrulama: Zod şemaları; XSS ve HTML injection koruması
- Görsel domain whitelisting (remotePatterns)
- Yetki kontrolleri: sahiplik doğrulama (listing/offer/message)

## Teslim Sıralaması
1) Detaylı arama API + UI (dinamik attributes)
2) Favoriler API + UI (kart ve profil)
3) Bildirim SSE + okundu uçları + header badge
4) Profil sekmeleri (listelemeler)
5) Admin paneli (şablon ve moderasyon)
6) Zamanlayıcı işler
7) SEO ve güvenlik güçlendirmeleri

Her aşama tamamlandıkça Türkçe rapor ve test/doğrulama çıktıları paylaşacağım.