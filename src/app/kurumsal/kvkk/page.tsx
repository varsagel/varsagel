import React from 'react';
import SozlesmeLayout from '@/components/layout/SozlesmeLayout';
import { Shield } from 'lucide-react';
import type { Metadata } from 'next';
import { metadataBase } from '@/lib/metadata-base';

export const metadata: Metadata = {
  title: "KVKK Aydınlatma Metni | Varsagel",
  description:
    "6698 sayılı KVKK kapsamında kişisel verilerinizin işlenmesine ilişkin aydınlatma metnimizi okuyun. Veri sorumlusu bilgilerimiz ve haklarınız hakkında detaylı bilgi.",
  metadataBase: metadataBase,
  alternates: {
    canonical: "/kurumsal/kvkk",
  },
};

export default function KVKKPage() {
  return (
    <SozlesmeLayout title="KVKK Aydınlatma Metni" icon={Shield}>
      <h2>1. Veri Sorumlusu</h2>
      <p>
        6698 sayılı Kişisel Verilerin Korunması Kanunu ("KVKK") uyarınca, kişisel verileriniz; veri sorumlusu olarak <strong>Varsagel</strong> tarafından aşağıda açıklanan kapsamda işlenebilecektir.
      </p>

      <h2>2. Kişisel Verilerin Hangi Amaçla İşleneceği</h2>
      <p>
        Toplanan kişisel verileriniz, Varsagel hizmetlerinden faydalanmanız, üyelik işlemlerinin gerçekleştirilmesi, talep ve teklif süreçlerinin yönetilmesi, güvenliğin sağlanması ve yasal yükümlülüklerin yerine getirilmesi amaçlarıyla işlenmektedir.
      </p>

      <h2>3. İşlenen Kişisel Veriler</h2>
      <ul>
        <li><strong>Kimlik Bilgileri:</strong> Ad, soyad.</li>
        <li><strong>İletişim Bilgileri:</strong> E-posta adresi, telefon numarası, adres.</li>
        <li><strong>İşlem Güvenliği:</strong> IP adresi, log kayıtları, parola bilgileri.</li>
        <li><strong>İşlem Bilgileri:</strong> Talep detayları, teklif verileri, favoriler.</li>
      </ul>

      <h2>4. Kişisel Verilerin Toplanma Yöntemi ve Hukuki Sebebi</h2>
      <p>
        Kişisel verileriniz, web sitemiz, mobil uygulamamız, çağrı merkezimiz veya e-posta yoluyla elektronik ortamda toplanmaktadır. Bu veriler, "bir sözleşmenin kurulması veya ifasıyla doğrudan doğruya ilgili olması" ve "veri sorumlusunun meşru menfaatleri için veri işlenmesinin zorunlu olması" hukuki sebeplerine dayanarak işlenmektedir.
      </p>

      <h2>5. Kişisel Verilerin Kimlere Aktarılabileceği</h2>
      <p>
        Kişisel verileriniz, yasal zorunluluklar kapsamında yetkili kamu kurum ve kuruluşlarına, hizmet aldığımız tedarikçilere ve iş ortaklarımıza KVKK'nın 8. ve 9. maddelerinde belirtilen şartlar dahilinde aktarılabilecektir.
      </p>

      <h2>6. Veri Sahibinin Hakları</h2>
      <p>
        KVKK'nın 11. maddesi uyarınca, veri sahibi olarak; kişisel verilerinizin işlenip işlenmediğini öğrenme, işlenmişse buna ilişkin bilgi talep etme, işlenme amacını ve amacına uygun kullanılıp kullanılmadığını öğrenme, yurt içinde veya yurt dışında aktarıldığı üçüncü kişileri bilme, eksik veya yanlış işlenmişse düzeltilmesini isteme haklarına sahipsiniz.
      </p>

      <p className="text-sm text-gray-600 mt-8">
        Son Güncelleme: {new Date().toLocaleDateString('tr-TR')}
      </p>
    </SozlesmeLayout>
  );
}
