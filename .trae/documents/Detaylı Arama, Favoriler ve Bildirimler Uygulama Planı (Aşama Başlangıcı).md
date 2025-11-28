## Detaylı Arama
- API: `/api/listings` filtrelerini genişlet: `category`, `subcategory`, `city`, `district`, `minPrice`, `maxPrice`, `attributes[alan]=değer`
- Sorgu: `attributesJson` parse edilip eşleme; fiyat BigInt → Number karşılaştırma
- UI: Ana sayfa ve `/kategori/...` sayfasına dinamik filtre paneli (kategori şablonlarına göre inputlar)
- Doğrulama: Zod ile filtre parametre kontrolü

## Favoriler
- API: `POST /api/favorites` (toggle), `GET /api/favorites` (liste)
- Yetki: oturum şartı; sahiplik kontrolü
- UI: İlan kartlarına favori butonu; `/profil` altında Favoriler sekmesi

## Bildirimler (Gerçek Zamanlı)
- SSE Kanal: `GET /api/notifications/stream` (oturumlu)
- Olaylar: yeni teklif, teklif kabul/red, mesaj, ilan durumu güncellemesi
- UI: Header’da canlı badge; bildirim listesi ve `PATCH /api/notifications/:id` ile okundu işaretleme

## Profil Sekmeleri
- Sekmeler: `İlanlarım`, `Aldığım Teklifler`, `Verdiğim Teklifler`, `Favorilerim`, `Mesajlarım`, `Bildirimler`
- API: sayfalama destekli listeleme uçları
- UI: Sekmeli bileşen; ilgili uçlardan veri çekimi

## Admin Paneli
- `/admin`: Kategori/alt kategori ve dinamik alan şablon yönetimi (JSON editör); kullanıcı/ilan/teklif moderasyonu; raporlar

## Zamanlayıcı İşler
- İlanları 1 ay sonra pasife alma; pasif teklifleri 1 ay sonunda silme
- İlk sürümde istek bazlı kontrol; ardından node‑cron

## SEO ve Güvenlik
- SEO: metadata, OpenGraph, JSON‑LD, `sitemap.xml`, `robots.txt`, canonical
- Güvenlik: rate limit (teklif/mesaj); Zod ile girdi doğrulama; yetki kontrolleri; görsel domain whitelisting

Onay sonrası yukarıdaki maddeleri sırayla kodlayıp test edip Türkçe raporlayacağım.