# Varsagel.com - Detaylı Site Denetim ve Geliştirme Raporu

**Tarih:** 3 Aralık 2024
**Durum:** Ulusal Lansman Öncesi Denetim

## 1. Yönetici Özeti
Varsagel.com, "tersine pazar yeri" (alıcı ilan verir, satıcı teklif verir) modeliyle Türkiye pazarında önemli bir boşluğu doldurma potansiyeline sahiptir. Mevcut altyapı (Next.js App Router, Tailwind CSS, Prisma, NextAuth) modern ve ölçeklenebilir bir temel üzerine kurulmuştur. Ancak, ulusal çapta rekabet edebilmek ve kullanıcı güvenini kazanmak için tamamlanması gereken kritik "Trust & Safety" (Güven ve Emniyet) ve yönetim özellikleri bulunmaktadır.

## 2. Kritik Eksikler (Lansman İçin Zorunlu)

### 2.1. Yönetim Paneli (Admin Dashboard)
*   **Mevcut Durum:** `/admin` sayfası sadece bir iskelet (placeholder) halindedir.
*   **Eksiklik:** Site yöneticileri şu an kullanıcıları banlayamaz, illegal ilanları silemez veya sistem istatistiklerini göremez.
*   **Öneri:** Basit ama işlevsel bir admin paneli acilen kodlanmalıdır.
    *   Kullanıcı Listesi & Yasaklama (Ban)
    *   İlan Onaylama/Reddetme/Silme
    *   Şikayet Yönetimi

### 2.2. Güven ve Şikayet Mekanizması
*   **Mevcut Durum:** Kullanıcıların sorunlu ilanları veya tacizci mesajları bildirebileceği bir buton bulunmamaktadır.
*   **Eksiklik:** "Sahibinden", "Dolap" gibi sitelerin en önemli özelliği "Şikayet Et" mekanizmasıdır. Bu olmadan yasal sorumluluk riski artar.
*   **Öneri:** İlan detay sayfasına ve mesajlaşma alanına "Şikayet Et" butonu eklenmeli ve bu şikayetler admin paneline düşmelidir.

### 2.3. Profil Yönetimi ve Doğrulama
*   **Mevcut Durum:** Profil sayfasındaki "Ayarlar" sekmesi işlevsizdir. Kullanıcılar adını, telefonunu değiştirememektedir.
*   **Eksiklik:** Telefon doğrulama (SMS) veya en azından E-posta doğrulama yoktur. Bu, sahte (fake) hesapların çoğalmasına neden olur.
*   **Öneri:**
    *   Profil güncelleme API'sinin yazılması.
    *   Telefon numarası doğrulama (SMS entegrasyonu - Netgsm vb. ile).
    *   "Onaylı Hesap" rozeti sistemi.

## 3. Kullanıcı Deneyimi (UX) ve Özellik Geliştirmeleri

### 3.1. Gelişmiş Arama ve Filtreleme
*   **Mevcut Durum:** Arama sadece metin, kategori ve fiyat aralığı ile sınırlı.
*   **Geliştirme:** Kategoriye özel filtreler eklenmeli.
    *   Örn: Araba kategorisi seçilince "Yıl", "KM", "Yakıt Tipi" filtreleri sol menüde otomatik çıkmalı.
    *   Bu veriler veritabanında JSON olarak tutuluyor (attributes), ancak arayüzde filtrelenemiyor.

### 3.2. Benzer İlanlar (Cross-Selling)
*   **Mevcut Durum:** İlan detayına giren kullanıcı, o ilanı beğenmezse çıkıyor.
*   **Geliştirme:** İlanın en altına "Bu ilana bakanlar bunlara da baktı" veya "Benzer İlanlar" şeridi eklenerek kullanıcının sitede kalma süresi artırılmalı.

### 3.3. Mesajlaşma ve Bildirimler
*   **Mevcut Durum:** Mesajlaşma çalışıyor ancak gerçek zamanlı (real-time) değil, sayfa yenileme veya polling gerektiriyor olabilir.
*   **Geliştirme:**
    *   Socket.io veya Pusher kullanılarak anlık mesajlaşma.
    *   Yeni teklif veya mesaj geldiğinde tarayıcı bildirimi (Web Push) ve E-posta bildirimi gönderilmesi.

### 3.4. Mobil Deneyim (PWA)
*   **Mevcut Durum:** Site responsive (mobil uyumlu) ancak bir uygulama hissi vermiyor.
*   **Geliştirme:** "Ana Ekrana Ekle" butonu (PWA Install Prompt) daha belirgin hale getirilmeli. Alt navigasyon barı (Bottom Navigation) mobilde daha uygulama benzeri bir deneyim sunabilir.

## 4. Teknik ve SEO İyileştirmeleri

### 4.1. Resim Optimizasyonu ve CDN
*   **Mevcut Durum:** Kullanıcıların yüklediği resimler direkt sunuluyor olabilir.
*   **Geliştirme:** Cloudinary veya AWS S3 + CloudFront kullanılarak resimler otomatik boyutlandırılmalı ve sıkıştırılmalı. Bu, site hızını (LCP) ciddi oranda artırır.

### 4.2. SEO Yapısal Veri (Schema Markup)
*   **Mevcut Durum:** Temel Organization şeması eklendi.
*   **Geliştirme:** Her ilan sayfası için `Product` veya `Service` şeması detaylandırılmalı. "Breadcrumb" şeması eklenerek Google'da kategori hiyerarşisi gösterilmeli.

## 5. Önerilen Yol Haritası

1.  **Aşama 1 (Hemen Yapılacaklar):**
    *   Profil Ayarları (Güncelleme) özelliğinin aktif edilmesi.
    *   "İlan Şikayet Et" modülünün eklenmesi.
    *   Admin paneline temel istatistiklerin ve ilan yönetiminin eklenmesi.

2.  **Aşama 2 (Lansman Öncesi):**
    *   Kategoriye özel detaylı filtreleme (Özellik filtreleri).
    *   E-posta bildirim servisi (SendGrid/Resend entegrasyonu).
    *   Resim optimizasyonu.

3.  **Aşama 3 (Lansman Sonrası):**
    *   Mobil Uygulama (React Native ile).
    *   SMS Doğrulama.
    *   Premium Üyelik / Doping Sistemi (Gelir Modeli).
