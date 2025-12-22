import React from 'react';
import SozlesmeLayout from '@/components/layout/SozlesmeLayout';
import { Lock } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Gizlilik Politikası | Varsagel",
  description:
    "Varsagel olarak kişisel verilerinizi nasıl topladığımızı, sakladığımızı ve koruduğumuzu inceleyin. KVKK ve gizlilik ilkelerimiz hakkında detaylı bilgi.",
  alternates: {
    canonical: "/kurumsal/gizlilik-politikasi",
  },
};

export default function PrivacyPage() {
  return (
    <SozlesmeLayout title="Gizlilik Politikası" icon={Lock}>
      <h2>1. Giriş</h2>
      <p>
        Varsagel olarak, kullanıcılarımızın gizliliğine ve kişisel verilerinin korunmasına büyük önem veriyoruz. Bu Gizlilik Politikası, topladığımız bilgileri, bu bilgileri nasıl kullandığımızı ve nasıl koruduğumuzu açıklar.
      </p>

      <h2>2. Toplanan Bilgiler</h2>
      <p>
        Hizmetlerimizi kullanırken, doğrudan sağladığınız (örn. kayıt olurken) ve otomatik olarak toplanan (örn. çerezler aracılığıyla) bilgileri işleriz.
      </p>

      <h2>3. Bilgilerin Kullanımı</h2>
      <p>
        Topladığımız bilgileri şu amaçlarla kullanırız:
      </p>
      <ul>
        <li>Hizmetlerimizi sunmak ve iyileştirmek</li>
        <li>Kullanıcı hesaplarını yönetmek</li>
        <li>Güvenliği sağlamak ve dolandırıcılığı önlemek</li>
        <li>Yasal yükümlülükleri yerine getirmek</li>
        <li>Sizinle iletişim kurmak</li>
      </ul>

      <h2>4. Çerezler (Cookies)</h2>
      <p>
        Sitemizde, kullanıcı deneyimini geliştirmek, site trafiğini analiz etmek ve reklamları kişiselleştirmek için çerezler kullanıyoruz. Tarayıcı ayarlarınızdan çerezleri yönetebilirsiniz.
      </p>

      <h2>5. Bilgi Paylaşımı</h2>
      <p>
        Kişisel bilgilerinizi, yasal zorunluluklar dışında veya izniniz olmadan üçüncü taraflara satmayız veya kiralamayız. Ancak, hizmet sağlayıcılarımızla (örn. ödeme altyapısı, bulut sunucular) gerekli olduğu ölçüde paylaşabiliriz.
      </p>

      <h2>6. Veri Güvenliği</h2>
      <p>
        Verilerinizi korumak için endüstri standardı güvenlik önlemleri (SSL şifreleme, güvenlik duvarları vb.) uyguluyoruz. Ancak, internet üzerinden yapılan hiçbir iletimin %100 güvenli olmadığını unutmayınız.
      </p>

      <h2>7. İletişim</h2>
      <p>
        Gizlilik politikamızla ilgili sorularınız için <a href="mailto:info@varsagel.com" className="text-cyan-600 hover:underline">info@varsagel.com</a> adresinden bize ulaşabilirsiniz.
      </p>

      <p className="text-sm text-gray-500 mt-8">
        Son Güncelleme: {new Date().toLocaleDateString('tr-TR')}
      </p>
    </SozlesmeLayout>
  );
}

