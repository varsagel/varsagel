## Tek Sayfa İsimleri ve Yol İsimleri
- Alım İlanı Sayfası: `/ilan/[id]` (tek referans nokta; tüm veri ve gösterimler buradan türetilir)
- Teklif Sayfası: `/teklif-ver/[id]` (tek referans nokta; tüm teklif veri gösterimleri buradan türetilir)
- Profil Sayfası: `/profil`
- Admin Paneli: `/admin`
- Kategori/Alt Kategori Listeleme: `/kategori/[category]/[subcategory]`
- Ana Sayfa (Detaylı Arama ve Keşif): `/`

## Üyelik ve Kimlik Doğrulama
- Üyelik: Tek tip üyelik; kullanıcı hem alıcı hem satıcı rolünde işlem yapabilir
- Oturum: NextAuth (JWT) + Prisma Adapter
- Güvenli çerez ayarları, secret yönetimi, e‑posta/şifre veya sosyal giriş (Google) opsiyonları

## Veri Modeli (Prisma)
- `User`: standart alanlar + `role` (USER/ADMIN)
- `Listing` (alım ilanı):
  - `id` (cuid), `code` (benzersiz 6 haneli ve artan), `title`, `description`, `status` (OPEN/CLOSED), `budget BigInt?`, `city`, `district`, `categoryId`, `subCategoryId`, `ownerId`
  - `attributesJson` (kategoriye özel dinamik alanlar), `imagesJson` (görseller)
  - `createdAt`, `updatedAt`
- `Offer` (satıcı teklifi):
  - `id`, `listingId`, `sellerId`, `price BigInt`, `message`, `status` (PENDING/ACCEPTED/REJECTED), `attributesJson` (kategoriye özel dinamik alanlar)
  - `createdAt`, `updatedAt`
- `Message` (ikili mesajlaşma):
  - `id`, `listingId`, `fromUserId`, `toUserId`, `content`, `createdAt`, `isRead`
- `Favorite` (ilan favori): `userId`, `listingId`, `createdAt`
- `Notification`: `id`, `userId`, `type`, `title`, `body`, `dataJson`, `isRead`, `createdAt`
- `Sequence` (ilan kodu üretimi): `key`='listing', `value` (son kullanılan numara)

## Kategoriler ve Dinamik Formlar
- Kategori/Alt Kategori taksonomisi: Sahibinden.com örnekleri baz alınarak genişletilir
- Kategoriye özel alan tanımları: JSON şablonlar (ör. Vasıta: marka/seri/model/yıl/kilometre; Alışveriş: marka/model/durum vs.)
- Dinamik form oluşturma: Şablonlara göre input seti; doğrulamalar Zod ile
- Konum: Türkiye il/ilçe tam listesi (mevcut veri kaynağı genişletilir)

## Akışlar
- Alıcı (Üye → İlan Ver):
  - Ana sayfa `İlan Ver` butonundan `/ilan-ver` (wizard) ile kategoriye özel form doldurur
  - İlan kaydı sırasında `code` (benzersiz 6 hane) atanır ve `/ilan/[id]`’ye yönlendirilir
  - İlan detayında girilen tüm bilgiler (dinamik alanlar dahil) görünür
- Satıcı (Üye → İlanları Gör → Teklif Ver):
  - Detaylı arama (ana sayfa + kategori) ile filtreler (kategori, alt kategori, konum, fiyat, dinamik alanlar)
  - `/teklif-ver/[id]` üzerinden kategoriye özel teklif formu; teklif kaydı görünür
- Teklif Yönetimi:
  - Alıcı teklifi kabul eder: teklif ACCEPTED, mesajlaşma açılır
  - Reddeder: satıcı artırarak tekrar teklif verebilir; üst üste reddedilirse +2 saat bekleme kuralı (cooldown)
  - Kabul edilen teklif pasife alınır; alışveriş olmazsa tekrar aktif edilebilir
- Zaman Kuralları:
  - İlan süresi: 1 ay; dolunca pasife alınır
  - Pasif teklifler: 1 ay içinde aktif edilmezse sistem tarafından silinir

## Mesajlaşma ve Bildirimler
- Mesajlaşma: `/ilan/[id]` bağlamında alıcı-satıcı ikili chat
- Bildirimler (gerçek zamanlı):
  - Yeni teklif, teklif cevabı, mesaj, ilan durumu değişikliği
  - İlk sürümde SSE/WebSocket (lib’siz) veya hafif polling; sonrasında event push altyapısı
- Bildirim paneli: Header’da canlı badge, `/profil` altında bildirim listesi

## Profil Sayfası
- Sekmeler: `İlanlarım`, `Aldığım Teklifler`, `Verdiğim Teklifler`, `Favorilerim`, `Mesajlarım`, `Bildirimler`
- Düzenleme: İlan/teklif düzenleme, veriler formda önceden doldurulmuş halde gelir

## Admin Paneli
- İlan/teklif moderasyonu, kullanıcı yönetimi
- Kategori/dinamik alan şablonlarının yönetimi (JSON editör)
- Raporlar: aktif/pasif ilanlar, teklif istatistikleri, zaman kuralları tetiklemeleri

## Arama ve Keşif
- Ana sayfada gelişmiş arama: kategori, alt kategori, konum, fiyat aralığı, dinamik alan filtreleri
- Popüler/top teklif alan slider, son eklenenler, kategoriye göre öneriler

## SEO ve Mobil
- SEO: metadata, OpenGraph, JSON‑LD (Breadcrumb/Listings), sitemap, robots, canonical
- Performans: lazy‑load görseller, kod bölme, prefetch
- Mobil uyum: responsive, dokunma etkileşimleri, hızlı form deneyimi

## Güvenlik
- Yetkilendirme: API rotalarında oturum şartı ve sahiplik kontrolleri
- Rate limit: teklif ve mesaj uçlarında hız limiti; 2 saat cooldown kuralı enforcement
- Girdi doğrulama: Zod şemaları, XSS koruması; dosya/görsel URL whitelisting (`images.remotePatterns`)
- Gizlilik: çerez ve JWT yapılandırmaları; hassas veriler loglanmaz

## Teknik Uygulama Adımları
1) Veri Modeli ve Migration
- `Listing.attributesJson`, `Listing.imagesJson`, `Offer.attributesJson`, `Message`, `Favorite`, `Notification`, `Sequence`
2) API Katmanı
- İlan oluşturma/düzenleme: kategoriye özel dinamik alan doğrulaması; `code` üretimi (Sequence)
- Teklif oluşturma/düzenleme: dinamik alan doğrulaması; cooldown kontrolü
- Mesaj API: oluşturma, okundu işaretleme
- Bildirim API: oluşturma/çekme; SSE/WebSocket kanal (ilk sürüm SSE)
- Profil ve admin uçları
3) Arayüz
- `/ilan-ver` wizard (kategori: dinamik şablonlar)
- `/ilan/[id]` detay: tüm alanlar, teklifler, mesaj paneli, favori/beğenme
- `/teklif-ver/[id]`: kategoriye özel teklif formu
- `/profil`: sekmeli görünüm
- `/admin`: yönetim konsolu
- Ana sayfa/kategori liste: gelişmiş arama, filtreler, kompakt kartlar
4) Zamanlayıcı İşler
- İlan pasif etme (1 ay), pasif teklif silme (1 ay), cooldown enforcement (2 saat)
- Basit cron (Node job) veya istek bazlı tetikleme (ilk sürümde istek bazlı kontrol)

## Teslim ve Test
- Aşama aşama geliştirme ve doğrulama
- Sayfa başına birim testler (validation), uçtan uca manuel testler
- Admin panelinden operasyonel doğrulamalar

Onaylarsan, bu planla adım adım uygulamaya başlayıp her aşamada Türkçe bilgilendirme yapacağım.