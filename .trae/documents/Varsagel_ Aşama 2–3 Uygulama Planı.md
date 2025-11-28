## Kapsam ve Öncelikler
- İlan/teklif düzenleme, gelişmiş arama, favoriler, gerçek zamanlı bildirim, profil sekmeleri, admin paneli, SEO ve güvenlik güçlendirmeleri

## İlan/Teklif Düzenleme
- API: PUT/PATCH `/api/listings/:id` ve `/api/offers/:id` (sahiplik ve oturum kontrolü)
- UI: Formlar önceden doldurulmuş; dinamik `attributes` aynı şemaya göre

## Gelişmiş Arama
- Ana sayfa ve kategori sayfasına dinamik filtreler: `attributes` alanlarına göre (ör. Vasıta: marka/seri/model/yıl)
- API: `/api/listings` filtre parametrelerinde `attributes[alan]=değer` desteği

## Favoriler
- API: POST/DELETE `/api/favorites` (toggle)
- UI: İlan kartlarında favori butonu; Profil’de Favoriler sekmesi

## Bildirimler (Gerçek Zamanlı)
- SSE kanal: `/api/notifications/stream` (oturumlu)
- Header’da canlı badge; Profil’de bildirim listesi ve okundu işaretleme

## Profil Sekmeleri
- `İlanlarım`, `Aldığım Teklifler`, `Verdiğim Teklifler`, `Favorilerim`, `Mesajlarım`, `Bildirimler`
- API uçlarını kullanarak sayfalı listeleme

## Admin Paneli
- Kategori ve dinamik alan şablon yönetimi (JSON editör)
- İlan/teklif moderasyonu, kullanıcı yönetimi
- Raporlar: aktif/pasif ilanlar, teklif istatistikleri, zaman kuralları

## Zamanlayıcı İşler
- İlanları 1 ay sonunda pasife alma
- Pasifte 1 ay kalan teklifleri temizleme
- Cooldown kuralı kontrolü (istek bazlı veya cron)

## SEO ve Mobil
- Metadata, OpenGraph, JSON‑LD (Breadcrumb/Listings); `sitemap.xml`, `robots.txt`
- Lazy‑load, prefetch; responsive ve dokunma etkileşimleri

## Güvenlik
- Rate limit (teklif/mesaj); güçlü girdi doğrulama (Zod); yetki kontrolleri
- Görsel domain whitelisting (remotePatterns) ve XSS korumaları

Onay sonrası bu adımları uygulanabilir parçalara bölüp kodlayıp test edeceğim; her aşamada Türkçe bilgilendirme sağlayacağım.