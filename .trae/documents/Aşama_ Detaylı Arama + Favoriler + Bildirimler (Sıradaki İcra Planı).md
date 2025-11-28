## Detaylı Arama
- API: `/api/listings` filtrelerini genişlet (category, subcategory, city, district, minPrice, maxPrice, attributes[anahtar])
- Uygulama: `attributesJson` içinden JSON eşleme; BigInt fiyat karşılaştırmaları
- UI: Ana sayfa ve kategori sayfasında dinamik alanlara göre filtre inputları
- Test: Örnek isteklerle 200 yanıt ve doğru sonuç seti; log denetimi

## Favoriler
- API: `POST /api/favorites` (toggle), `GET /api/favorites` (liste)
- UI: Kartlarda favori butonu; `/profil` → Favoriler sekmesi
- Test: Toggle sonrası listede görünürlük; sahiplik ve oturum kontrolü

## Bildirimler (SSE)
- API: `GET /api/notifications/stream` (oturumlu SSE), `PATCH /api/notifications/:id` (okundu)
- UI: Header badge, profil bildirim listesi
- Test: Teklif/mesaj olaylarında canlı bildirim düşmesi, okundu akışı

Onayla; değişiklikleri uygulayıp her bölümün sonunda Türkçe doğrulama raporu paylaşacağım.