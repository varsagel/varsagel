## Detaylı Arama (API + UI)
- API `/api/listings`: Filtreleri genişlet (category, subcategory, city, district, minPrice, maxPrice, attributes[alan])
- Sorgu: `attributesJson` eşleşmesi (JSON parse) + BigInt→Number fiyat karşılaştırma
- UI: Ana sayfa ve `/kategori/...` filtre paneline kategori şablonlarına göre dinamik alanlar (örn. Vasıta: marka/seri/model/yıl/km)
- Test: Örnek URL’lerle 200 yanıt ve doğru sonuç seti; log kontrol

## Favoriler (API + UI)
- API: `POST /api/favorites` (toggle), `GET /api/favorites` (liste) — oturum şartı
- UI: Kartlarda favori butonu; `/profil` içinde Favoriler sekmesi
- Test: Toggle sonrası listede görünürlük; sahiplik ve yetki doğrulama

## Bildirimler (Gerçek Zamanlı — SSE)
- API: `GET /api/notifications/stream` (SSE); `PATCH /api/notifications/:id` (okundu)
- Olaylar: yeni teklif, teklif kabul/red, mesaj, ilan durumu değişikliği
- UI: Header’da canlı badge; `/profil` bildirim listesi
- Test: Teklif/mesaj olaylarında canlı bildirim düşmesi; okundu akışı

## Teslim Sırası
1) Detaylı arama API + UI
2) Favoriler API + UI
3) Bildirimler SSE + okundu
- Her adım bittiğinde Türkçe doğrulama raporu ve örnek istek/yanıt paylaşımı