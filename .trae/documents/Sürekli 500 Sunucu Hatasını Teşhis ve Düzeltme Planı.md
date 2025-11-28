## Sorun Özeti
- Loglarda iki ana problem var:
  - Auth.js hata: `JWTSessionError (JWEDecryptionFailed)` — eski/uyuşmayan session token’ı veya secret kaynaklı (`.next/dev/logs/next-development.log:4-6`).
  - İlan oluşturma API’sinde `BigInt` serileştirme hatası — önce 500 üretiyordu, sonrasında düzeltme ile 201 başarı görülüyor (`next-development.log:13-57` ve `69-77`).

## Teşhis Adımları
- Hangi endpoint 500 veriyor? Network panelde başarısız isteğin yolunu kontrol edeceğim.
- Sunucu loglarını incelemeye devam edeceğim: `.next/dev/logs/next-development.log`.
- Oturum durumunu doğrulayacağım: `next-auth.session-token` çerezi ve `AUTH_SECRET/NEXTAUTH_URL` uyumu.

## Düzeltmeler
1) Auth.js Hatası (JWT decryption)
- Tarayıcıda `next-auth.session-token` çerezini temizleyin ve yeniden giriş yapın.
- `.env.local` içinde sırların tutarlılığını koruyun: `AUTH_SECRET` tek kaynak olsun; port-URL uyumu `NEXTAUTH_URL=http://localhost:3004` ile sağlanıyor.

2) İlan Oluşturma 500
- `budget` için güvenli dönüştürme: metin→sayı→tamsayı→`BigInt` (ondalık girilirse 400 döndür).
- Yanıtta `BigInt` alanları sayıya çevirerek döndürmeye devam edin (şu an 201 kayıtlar bunu doğruluyor).

3) Prisma Kullanımı
- Tüm API rotalarında ortak `prisma` istemcisini (`src/lib/prisma.ts`) kullanacak şekilde düzenleme; `new PrismaClient()` yerine tekil instance — SQLite kilitlenmelerini ve bellek şişmesini azaltır.

4) Kategori Akışı
- Dinamik kategori API’si (`GET /api/categories`) kullanılıyor; form bu veriye geçti. Akış uçtan uca test edilecek.

## Test Planı
- Tarayıcı çerez temizliği sonrası giriş testi: `giris` sayfası.
- İlan oluşturma: farklı kategoriler ve bütçe senaryoları (tam sayı, ondalık) — 201/400 doğrulaması.
- Listeleme API: `GET /api/listings` 200 doğrulaması.

## Beklenen Çıktı
- Auth.js hatası giderilir; oturum okuma çalışır.
- İlan oluşturma 500 hatası ortadan kalkar; hatalı girişte doğru 400 mesajı döner.
- Veritabanı erişimi stabil olur (tek Prisma instance).