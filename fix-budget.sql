-- Budget sütununu temizleme migration'ı
-- Önce tüm büyük değerleri güvenli bir değere ayarla
UPDATE "Listing" SET "budget" = 10000 WHERE "budget" > 2147483647 OR "budget" < 0;