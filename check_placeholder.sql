-- Veritabanında placeholder-image.jpg referansı olan kayıtları bul
SELECT id, title, images_json 
FROM "Listing" 
WHERE images_json LIKE '%placeholder-image.jpg%';

-- Offer tablosunda da kontrol et
SELECT id, listing_id, images_json 
FROM "Offer" 
WHERE images_json LIKE '%placeholder-image.jpg%';