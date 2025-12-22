# Google ile Giriş Kurulumu

Sistem Google ile giriş altyapısını destekleyecek şekilde güncellendi. Ancak Google'ın güvenlik politikaları gereği, Client ID ve Secret bilgilerini Google Cloud Console üzerinden sizin oluşturmanız gerekmektedir.

Aşağıdaki adımları takip ederek 2 dakika içinde aktif edebilirsiniz:

1. **Google Cloud Console'a Gidin:**
   - [https://console.cloud.google.com/](https://console.cloud.google.com/) adresine gidin.
   - Yeni bir proje oluşturun (veya mevcut bir projeyi seçin).

2. **OAuth Onay Ekranını Yapılandırın (OAuth Consent Screen):**
   - Menüden **APIs & Services** > **OAuth consent screen** seçeneğine gidin.
   - **External** (Harici) seçeneğini seçip oluşturun.
   - Uygulama adını (Varsagel) ve destek e-postalarını girin.
   - Kaydedip devam edin.

3. **Kimlik Bilgilerini Oluşturun (Credentials):**
   - Menüden **Credentials** sekmesine gidin.
   - **Create Credentials** > **OAuth client ID** seçeneğine tıklayın.
   - Application type: **Web application** seçin.
   - Name: `Varsagel Web` (isteğe bağlı).
   - **Authorized redirect URIs** kısmına şunu ekleyin:
     ```
     https://varsagel.com/api/auth/callback/google
     ```
     *(Canlı ortam ayarıdır)*
   - **Create** butonuna basın.

4. **Bilgileri Sisteme Girin:**
   - Size verilen **Client ID** ve **Client Secret** değerlerini kopyalayın.
   - Proje klasöründeki `.env` dosyasını açın.
   - İlgili satırları güncelleyin:
     ```env
     GOOGLE_ID="Size verilen Client ID"
     GOOGLE_SECRET="Size verilen Client Secret"
     ```

5. **Sistemi Yeniden Başlatın:**
   - Değişikliklerin geçerli olması için `stop-varsagel.bat` ve ardından `start-varsagel.bat` çalıştırın.

Bu adımlardan sonra giriş ve kayıt sayfalarında "Google ile Devam Et" butonu otomatik olarak görünecektir.
