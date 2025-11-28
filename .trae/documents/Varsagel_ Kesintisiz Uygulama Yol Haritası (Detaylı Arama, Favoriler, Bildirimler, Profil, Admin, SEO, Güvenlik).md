## Genel Yaklaşım
- Onay beklemeden, ardışık adımlarla geliştirme ve her adım sonunda doğrulama raporu
- API, veri modeli ve UI güncellemeleri eşgüdümlü ilerler; güvenlik ve performans denetimleri paralelde

## 1) Detaylı Arama (Dinamik Attributes)
- API genişletme: `/api/listings`
  - Parametreler: `category`, `subcategory`, `city`, `district`, `minPrice`, `maxPrice`, `attributes[anahtar]=değer`
  - BigInt → Number karşılaştırma; `attributesJson` içinde JSON eşleme
- UI güncelleme:
  - Ana sayfa ve `/kategori/[category]/[subcategory]` filtre paneline kategori şablonlarına göre dinamik alanlar (ör. Vasıta: marka/seri/model/yıl/km)
- Doğrulama:
  - Örnek isteklerle 200 yanıt, doğru sonuç seti ve sıralama kontrolleri (createdAt/price/popular)

## 2) Favoriler
- API: `POST /api/favorites` (toggle), `GET /api/favorites` (liste)
  - Veritabanı: `Favorite (userId, listingId)` birleşik anahtar; sahiplik ve oturum kontrolü
- UI: İlan kartlarına favori butonu; `/profil` içinde Favoriler sekmesi
- Doğrulama: Toggle akışı, profil listesindeki görünürlük, yetki kontrolleri

## 3) Bildirimler (Gerçek Zamanlı – SSE)
- API: `GET /api/notifications/stream` (oturumlu SSE)
  - Olaylar: yeni teklif, teklif kabul/red, mesaj, ilan durumu değişikliği
  - Okundu işaretleme: `PATCH /api/notifications/:id`
- UI: Header’da canlı badge; `/profil` bildirim listesi
- Doğrulama: Teklif/mesaj olaylarında SSE akışıyla canlı bildirim düşmesi

## 4) Profil Sekmeleri
- Sekmeler: `İlanlarım`, `Aldığım Teklifler`, `Verdiğim Teklifler`, `Favorilerim`, `Mesajlarım`, `Bildirimler`
- API: Sayfalama destekli listeleme uçları; her sekme için veri çekimi
- UI: Sekmeli yapı ve tablo/kart görünümleri; düzenleme butonları

## 5) İlan/Teklif Düzenleme
- API: `PUT/PATCH /api/listings/:id`, `/api/offers/:id` (oturum ve sahiplik kontrolü)
- UI: Formlar önceden doldurulmuş; dinamik `attributes` aynı şemaya göre
- Doğrulama: Düzenleme sonrası detay sayfa ve ilgili listelerde güncel veri

## 6) Admin Paneli
- Yol: `/admin`
- Modüller: Kategori/alt kategori ve dinamik alan şablon yönetimi (JSON editör), kullanıcı/ilan/teklif moderasyonu, raporlar
- Doğrulama: ADMIN rolü şartı, CRUD akışları ve rapor çıktıları

## 7) Zamanlayıcı İşler
- İlanları 1 ay sonunda pasife alma
- Pasifte 1 ay kalan teklifleri silme
- İlk sürümde istek bazlı kontrol; ardından node‑cron ile periyodik

## 8) SEO ve Mobil
- SEO: metadata, OpenGraph, JSON‑LD (Breadcrumb/Listings), `sitemap.xml`, `robots.txt`, canonical
- Mobil/Performans: lazy‑load, prefetch, kod bölme, responsive ve dokunma etkileşimleri

## 9) Güvenlik
- Rate limit: teklif ve mesaj end‑point’lerinde kullanıcı/IP bazlı
- Girdi doğrulama: Zod şemaları; XSS ve HTML injection önlemleri
- Görsel domain whitelisting (remotePatterns); yetki kontrolleri ve veri sahipliği

## Teslim Sırası ve Raporlama
1) Detaylı arama API + UI
2) Favoriler API + UI
3) Bildirim SSE + okundu
4) Profil sekmeleri
5) İlan/teklif düzenleme
6) Admin paneli
7) Zamanlayıcı işler
8) SEO ve güvenlik

Her adım bittiğinde: Türkçe doğrulama raporu, örnek istek/yanıtlar ve görsel/akış test bilgileri paylaşılacaktır.