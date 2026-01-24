# Normal (Tek Sunucu) Çalışma Düzeni

Blue‑Green’i şimdilik kullanmadan, mevcut “tek instance” düzeni:

- **Nginx** 80/443’ü dinler (SSL Nginx’te)
- **Node/Next (server.js)** sadece iç portta çalışır (örn. 3004)
- Nginx trafiği `http://127.0.0.1:3004`’e proxy eder

## Env (Önerilen)

`.env.production` için:

- `PORT="3004"`
- `CANONICAL_URL="https://www.varsagel.com"`
- `NEXTAUTH_URL="https://www.varsagel.com"`
- `AUTH_URL="https://www.varsagel.com"`
- `NEXT_PUBLIC_SITE_URL=https://www.varsagel.com`

## Nginx

Repo’da tek instance için hazır şablon:

- `nginx/varsagel-single-www.conf`

## PM2 (Tek instance)

`ecosystem.single.config.js` ile tek instance başlatılabilir.
