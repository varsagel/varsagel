## Genel Bakış
- Çatı: `Next.js 16` (App Router) + `React 19` + `Tailwind 4`
- Kimlik: `NextAuth (Auth.js)` Prisma adapter ile (`src/auth.ts:44-76`)
- Veritabanı: `Prisma` + `SQLite` (geliştirme) (`prisma/schema.prisma:8-11`), URL `.env.local` üzerinden (`.env.local:1`)
- Sunucu komutu: `npm run dev` (`package.json:6`); proje env URL’leri 3004 porta işaret ediyor (`.env.local:3-5`)

## Ön Koşullar
- Node.js 18+ (öneri: 20) ve `npm`
- `.env.local` mevcut ve dolu: `DATABASE_URL`, `AUTH_SECRET`, `NEXTAUTH_URL`, `AUTH_URL` (`.env.local:1-5`)

## Adım 1: Bağımlılıkları Kur
- Komut: `npm install`
- Amaç: Next.js, Prisma, NextAuth ve diğer bağımlılıkların kurulumu (`package.json:12-38`)

## Adım 2: Prisma İstemcisini ve Veritabanını Hazırla
- İstemci üret: `npx prisma generate`
- Şema veritabanına yansıt: `npx prisma migrate dev` (SQLite dosyası `prisma/dev.db` zaten var; komut yine güvenle çalışır)
- Not: Prisma istemcisi `src/lib/prisma.ts` içinde tekil instance ile kullanılıyor (`src/lib/prisma.ts:1-12`)

## Adım 3: Geliştirme Sunucusunu Başlat
- Çalıştırma (3004 portu ile): `npm run dev -- -p 3004`
- Neden: `.env.local`’daki `NEXTAUTH_URL` ve `AUTH_URL` 3004’e ayarlı (`.env.local:3-5`), NextAuth callback’lerinin doğru çalışması için port eşleşmeli
- Alternatif (3000): `npm run dev` kullanılırsa `.env.local` değerleri 3000’e güncellenmeli veya komut satırında port 3004’e taşınmalıdır

## Adım 4: Doğrulama
- Ana sayfa: `http://localhost:3004/`
- Giriş sayfası: `http://localhost:3004/giris` (kimlik akışı `src/app/api/auth/[...nextauth]/route.ts` → `src/auth.ts`) 
- API örnekleri: `GET /api/listings` (`src/app/api/listings/route.ts:6-89`)

## Opsiyonel: Test Verileri Oluşturma
- Test kullanıcı: `node create-test-user.js` (Email: `test@example.com`, Şifre: `test123`) (`create-test-user.js:10-23`)
- Kategori seed: `node seed-categories.js` (ana ve alt kategorileri ekler) (`seed-categories.js:99-139`)

## Olası Sorunlar ve Çözümler
- Port çakışması: `npm run dev -- -p 3004` ile çözülür
- Prisma client hatası: `npx prisma generate` tekrar çalıştırın
- Migration hatası: `npx prisma migrate reset` (tüm veriyi sıfırlar), ardından `npx prisma migrate dev`
- NextAuth URL uyuşmazlığı: Sunucu portu ile `.env.local`’daki `NEXTAUTH_URL` ve `AUTH_URL` eşleşmeli (`next.config.ts:12-15`)