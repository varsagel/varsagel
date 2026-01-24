# Sıfır Kesintiyle (Zero‑Downtime) Geliştirme ve Yayın

Hedef: Site canlıdayken geliştirmeye devam etmek ve yeni sürümleri yayınlarken siteyi kapatmak zorunda kalmamak.

## Temel Yaklaşım: Blue‑Green

- **Blue**: Canlı trafiği alan sürüm (örn. 3004).
- **Green**: Yeni sürümün açıldığı sürüm (örn. 3005).
- Nginx (veya başka reverse proxy) trafiği **tek bir upstream** üzerinden aktif renge gönderir.
- Deploy sırasında Green ayağa kaldırılır, sağlık kontrolü yapılır, sonra Nginx upstream Green’e çevrilir.
- Blue bir süre daha açık bırakılır (chunk/cache geçişleri için), sonra kapatılır.

Bu modelle deploy esnasında **servis kesintisi olmaz**; en kötü ihtimalle kullanıcılar bir kere sayfa yeniler.

## Neden Bu Projede Özellikle Gerekli?

Next.js App Router’da deploy sonrası:
- Kullanıcı tarayıcısı eski HTML’i cache’leyip yeni `_next/static` chunk hash’lerini isteyebilir,
- veya tam tersi.

Bu repo zaten chunk 404’lerini azaltmak için sunucu tarafında fallback servislemeyi içeriyor; Blue‑Green ile beraber daha stabil olur.

## Önerilen Üretim Topolojisi

1) **Nginx 443/80** (SSL burada)
2) **Node/Next** sadece iç portlarda çalışır:
   - Blue: 127.0.0.1:3004
   - Green: 127.0.0.1:3005
3) **PM2** iki app’i yönetir.
4) **Uploads** iki sürüm arasında ortak bir klasörde tutulur (`UPLOAD_DIR`).
5) **DB** tek (ortak) olur; migration stratejisi dikkatli yapılır.

## Nginx Örnek Konfig (Blue‑Green)

Repo içinde hazır şablonlar:

- `nginx/varsagel-bluegreen.conf` (site config)
- `nginx/varsagel-upstream.inc.example` (aktif port seçimi)

Sunucuda önerilen yollar:

- `/etc/nginx/sites-available/varsagel.conf` → `nginx/varsagel-bluegreen.conf` içeriği
- `/etc/nginx/conf.d/varsagel-upstream.inc` → `nginx/varsagel-upstream.inc.example` içeriği

`/etc/nginx/sites-available/varsagel.conf` örneği:

```nginx
upstream varsagel_upstream {
  include /etc/nginx/conf.d/varsagel-upstream.inc;
}

server {
  listen 80;
  server_name varsagel.com www.varsagel.com;
  return 301 https://$host$request_uri;
}

server {
  listen 443 ssl http2;
  server_name varsagel.com www.varsagel.com;

  client_max_body_size 20M;

  location / {
    proxy_pass http://varsagel_upstream;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
  }
}
```

`/etc/nginx/conf.d/varsagel-upstream.inc` içeriği:

- Blue aktifken:
```nginx
server 127.0.0.1:3004;
```

- Green’e geçerken:
```nginx
server 127.0.0.1:3005;
```

Geçiş:
`nginx -t && systemctl reload nginx`

## PM2 Örnek Konfig

Bu repo kökünde örnek: `ecosystem.bluegreen.config.js` (aşağıda).

Önemli: Blue ve Green **ayrı dizinlerden** çalışmalı (iki farklı `.next` build’i aynı dizinde çakışır).

Örnek dizin düzeni:

- `/var/www/varsagel-blue` (Blue)
- `/var/www/varsagel-green` (Green)

## Deploy Akışı (Özet)

1) Green dizinine yeni kodu alın (`git pull` / yeni release klasörü).
2) Green’de `npm ci` + `npm run build`.
3) Green’i PM2 ile başlatın (PORT=3005).
4) Sağlık kontrolü: `curl -fsS http://127.0.0.1:3005/api/health`.
5) Nginx upstream’i Green’e alın, `reload`.
6) 5-15 dk bekleyin (cache/chunk geçişi için), sonra Blue’yu durdurun.

## Uploads (Kesintisiz)

Blue ve Green farklı klasörlerden çalışacağı için upload’lar ortak olmalı.

- Ortak klasör: `/var/www/varsagel-uploads`
- Env: `UPLOAD_DIR=/var/www/varsagel-uploads`
- Nginx’te `/uploads/` isteği yine Node üzerinden ya da doğrudan statik servislenebilir.

## DB Migration (Kesintisiz)

Tek DB kullanırken “sıfır kesinti” için:

- **Geriye uyumlu** migration yazın (önce yeni kolon/indeks ekle, sonra kodu geç, sonra eski kolonları kaldır).
- Deploy’de migration’ı **Green ayağa kalkmadan önce** veya Green ayağa kalktıktan hemen sonra çalıştırın.
- Prisma için: `prisma migrate deploy` (prod).

## Staging (Geliştirme Süreci Siteyi Etkilemesin)

Ek öneri:

- Staging domain: `staging.varsagel.com` → ayrı Node portu (3006) ve ayrı env.
- Yeni özellikler staging’de test edilir, sonra Green’e geçer.

## Kategori/Filtre Sistemi Geçişi (Legacy ↔ Satariz)

Bu repo, kategori/filtre sistemini “aktif/pasif” yapabilmek için iki katmanlı bir anahtar destekler:

1) **Env override (deploy sırasında)**: `CATEGORY_SYSTEM=legacy|satariz`  
2) **Admin Ayarı (deploy gerektirmeden)**: Admin → Ayarlar → “Kategori Sistemi” (`categorySystem`).

Öncelik: Env var ise o kazanır; yoksa admin ayarı okunur; yoksa `legacy`.

### Güvenli Geçiş Akışı

1) **Legacy yedek al**
   - Script: `node scripts/backups/backup-legacy-system.mjs`
   - Çıktı: `public/exports/backups/legacy_<tarih>/legacy-taxonomy-backup.json` ve `.xlsx`

2) **Satariz verisini hazırlayıp kontrol et**
   - Kategori ağacı: `public/exports/satariz-kategori-agaci.xlsx`
   - Alt kategori form şablonu: `public/exports/satariz-alt-kategori-formlari.xlsx`

3) **Satariz sistemini staging’de kur/test et**
   - Staging’de `CATEGORY_SYSTEM=satariz` ile çalıştırıp kategori ve filtre UI’larını kontrol edin.

4) **Prod’da Green’e Satariz’i al**
   - Green portunda `CATEGORY_SYSTEM=satariz` (veya admin ayarı) ile ayağa kaldırın.
   - Sağlık kontrolü + kritik akış testleri.

5) **Nginx upstream’i Green’e çevir**
   - Böylece eski sistem pasife düşer (tek aktif sistem Satariz olur).

### Geri Dönüş (Rollback)

- Hızlı rollback: `CATEGORY_SYSTEM=legacy` ile Green’i tekrar ayağa kaldırıp upstream’i geri çevirin.
- Gerekirse DB verisini geri almak için yedek dosyaları kullanılır.
